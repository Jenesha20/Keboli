import json
import re
from typing import List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from .state import EvaluationState
from .llm import get_llm
from langchain_core.messages import HumanMessage, SystemMessage
from .prompt_manager import PromptManager


def extract_json(content: str) -> Optional[Dict[str, Any]]:
    match = re.search(r'\{.*\}', content, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return None
    return None


def _parse_skill_graph(raw_skill_graph: Any) -> Dict[str, float]:
    """
    Normalize the skill_graph from the assessment into a flat {skill_name: weight} dict.
    The interview agent stores it as: {"skills": [{"name": "Java", "weightage": 0.3, ...}]}
    But sometimes it can be a flat dict like {"Java": 0.3, "Python": 0.2}
    """
    if not raw_skill_graph:
        return {}

    if isinstance(raw_skill_graph, dict) and "skills" in raw_skill_graph:
        skills_list = raw_skill_graph["skills"]
        if isinstance(skills_list, list):
            result = {}
            for s in skills_list:
                name = s.get("name", "")
                weight = s.get("weightage", s.get("weight", 0.0))
                if name:
                    try:
                        result[name] = float(weight)
                    except (ValueError, TypeError):
                        result[name] = 0.0
            return result

    if isinstance(raw_skill_graph, dict):
        result = {}
        for key, val in raw_skill_graph.items():
            try:
                w = float(str(val).replace('%', '')) 
                if w > 1.0:
                    w = w / 100.0  
                result[key] = w
            except (ValueError, TypeError):
                continue
        return result

    return {}


def _find_skill_score(skill_evaluations: Dict, skill_name: str) -> Optional[Dict]:
    """
    Fuzzy match a skill name from the graph against the LLM's skill evaluation keys.
    The LLM might use slightly different casing or naming.
    """
    if not skill_evaluations:
        return None
    
    if skill_name in skill_evaluations:
        return skill_evaluations[skill_name]
    
    lower_name = skill_name.lower()
    for key, val in skill_evaluations.items():
        if key.lower() == lower_name:
            return val
    
    for key, val in skill_evaluations.items():
        if lower_name in key.lower() or key.lower() in lower_name:
            return val
    
    return None


async def analyze_technical_node(state: EvaluationState):
    llm = get_llm(temperature=0)
    transcript_text = "\n".join([f"{t['role']}: {t['text']}" for t in state['transcript']])
    
    raw_skill_graph = state['assessment_details'].get('skill_graph', {})
    
    prompt = PromptManager.get_technical_prompt(transcript_text, str(raw_skill_graph))
    
    resp = await llm.ainvoke([
        SystemMessage(content="You are a rigorous technical evaluator. You MUST output valid JSON. Score strictly using the provided rubric. Do not inflate scores."),
        HumanMessage(content=prompt)
    ])
    
    data = extract_json(resp.content)
    if data and "skill_evaluations" in data:
        return {
            "technical_analysis": json.dumps(data) if isinstance(data, dict) else str(data),
            "skill_scores": data["skill_evaluations"]
        }
    return {"technical_analysis": resp.content, "skill_scores": {}}

async def analyze_communication_node(state: EvaluationState):
    llm = get_llm(temperature=0)
    transcript_text = "\n".join([f"{t['role']}: {t['text']}" for t in state['transcript']])
    
    prompt = PromptManager.get_communication_prompt(transcript_text)
    
    resp = await llm.ainvoke([
        SystemMessage(content="You are a rigorous communication assessor. Output valid JSON. Score strictly using the provided rubric."),
        HumanMessage(content=prompt)
    ])
    
    data = extract_json(resp.content)
    return {"communication_analysis": json.dumps(data) if data else resp.content}

async def analyze_cultural_fit_node(state: EvaluationState):
    llm = get_llm(temperature=0)
    transcript_text = "\n".join([f"{t['role']}: {t['text']}" for t in state['transcript']])
    
    prompt = PromptManager.get_cultural_fit_prompt(transcript_text)
    
    resp = await llm.ainvoke([
        SystemMessage(content="You are a rigorous culture assessor. Output valid JSON. Score conservatively."),
        HumanMessage(content=prompt)
    ])
    
    data = extract_json(resp.content)
    return {"cultural_analysis": json.dumps(data) if data else resp.content}


async def final_scoring_node(state: EvaluationState):
    raw_skill_graph = state['assessment_details'].get('skill_graph', {})
    passing_score = float(state['assessment_details'].get('passing_score', 60))

    parsed_skills = _parse_skill_graph(raw_skill_graph)
    skill_evaluations = state.get('skill_scores', {})

    print(f"[EVAL DEBUG] Parsed skills: {list(parsed_skills.keys())}")
    print(f"[EVAL DEBUG] LLM evaluated skills: {list(skill_evaluations.keys())}")

    weighted_tech_score = 0.0
    evaluated_weight_sum = 0.0
    total_weight_sum = 0.0
    matched_skills = []
    unmatched_skills = []

    for skill_name, weight in parsed_skills.items():
        total_weight_sum += weight

        eval_data = _find_skill_score(skill_evaluations, skill_name)
        if eval_data and eval_data.get('score') is not None:
            try:
                score = float(eval_data['score'])
                score = min(5.0, max(0.0, score))
                weighted_tech_score += score * weight
                evaluated_weight_sum += weight
                matched_skills.append(f"{skill_name}: {score}/5 (w={weight})")
            except (ValueError, TypeError):
                unmatched_skills.append(skill_name)
        else:
            unmatched_skills.append(skill_name)

    print(f"[EVAL DEBUG] Matched: {matched_skills}")
    print(f"[EVAL DEBUG] Unmatched/unevaluated: {unmatched_skills}")

    if evaluated_weight_sum > 0:
        normalized_tech_score = weighted_tech_score / evaluated_weight_sum
    else:
        normalized_tech_score = 0.0

    coverage_ratio = evaluated_weight_sum / total_weight_sum if total_weight_sum > 0 else 0.0

    
    coverage_factor = 0.85 + (0.15 * coverage_ratio)
    final_technical_score = normalized_tech_score * coverage_factor
    final_technical_score = min(5.0, max(0.0, final_technical_score))

    print(f"[EVAL DEBUG] Normalized tech: {normalized_tech_score:.2f}, Coverage: {coverage_ratio:.2f}, Final tech: {final_technical_score:.2f}")

    comm_data = extract_json(state.get('communication_analysis') or "{}") or {}
    cult_data = extract_json(state.get('cultural_analysis') or "{}") or {}

    try:
        comm_score = float(comm_data.get('communication_score', 0))
        comm_score = min(5.0, max(0.0, comm_score))
    except (ValueError, TypeError):
        comm_score = 0.0

    try:
        conf_score = float(comm_data.get('confidence_score', 0))
        conf_score = min(5.0, max(0.0, conf_score))
    except (ValueError, TypeError):
        conf_score = 0.0

    try:
        cult_score = float(cult_data.get('cultural_fit_score', 0))
        cult_score = min(5.0, max(0.0, cult_score))
    except (ValueError, TypeError):
        cult_score = 0.0

  
    final_total_score = (
        (final_technical_score * 0.60) +
        (comm_score * 0.15) +
        (conf_score * 0.15) +
        (cult_score * 0.10)
    )
    final_total_score = min(5.0, max(0.0, final_total_score))
    
    total_score_100 = final_total_score * 20.0

    print(f"[EVAL DEBUG] Scores → Tech: {final_technical_score:.2f}, Comm: {comm_score:.2f}, Conf: {conf_score:.2f}, Cult: {cult_score:.2f}")
    print(f"[EVAL DEBUG] Total (0-5): {final_total_score:.2f}, Total (0-100): {total_score_100:.2f}")

    transcript_text = "\n".join(
        [f"{t.get('role','unknown')}: {t.get('text','')}" for t in state.get("transcript", [])]
    )

    llm = get_llm(temperature=0)

    prompt = PromptManager.get_final_synthesis_prompt(
        state.get('technical_analysis') or "None",
        state.get('communication_analysis') or "None",
        state.get('cultural_analysis') or "None",
        transcript_text,
        round(total_score_100, 1),
        round(coverage_ratio, 2),
        passing_score
    )

    resp = await llm.ainvoke([
        SystemMessage(content="You are a strict hiring decision maker. Your recommendation MUST align with the numeric score ranges provided. Output valid JSON only."),
        HumanMessage(content=prompt)
    ])

    data = extract_json(resp.content) or {}
    llm_recommendation = data.get("recommendation", "REJECT").upper()

    if total_score_100 < passing_score:
        final_recommendation = "REJECT"
        print(f"[EVAL DEBUG] REJECT: Score {total_score_100:.1f} < passing {passing_score}")
    elif coverage_ratio < 0.5:
        final_recommendation = "REJECT"
        print(f"[EVAL DEBUG] REJECT: Coverage {coverage_ratio:.2f} < 0.5")
    else:
        if total_score_100 < 55 and llm_recommendation != "REJECT":
            final_recommendation = "REJECT"
            print(f"[EVAL DEBUG] Overriding LLM {llm_recommendation} → REJECT (score {total_score_100:.1f} < 55)")
        elif total_score_100 < 80 and llm_recommendation == "STRONG_HIRE":
            final_recommendation = "HIRE"
            print(f"[EVAL DEBUG] Downgrading STRONG_HIRE → HIRE (score {total_score_100:.1f} < 80)")
        else:
            final_recommendation = llm_recommendation

    print(f"[EVAL DEBUG] Final recommendation: {final_recommendation}")

    return {
        "scores": {
            "technical": round(final_technical_score, 2),
            "communication": round(comm_score, 2),
            "confidence": round(conf_score, 2),
            "cultural_fit": round(cult_score, 2),
            "total": round(final_total_score, 2),
            "coverage_ratio": round(coverage_ratio, 2),
            "total_score_100": round(total_score_100, 2)
        },
        "summary": data.get("summary", ""),
        "explanation": data.get("explanation", ""),
        "recommendation": final_recommendation,
        "tie_breaker_subscore": round(total_score_100 / 10, 2)
    }

workflow = StateGraph(EvaluationState)

workflow.add_node("analyze_technical", analyze_technical_node)
workflow.add_node("analyze_communication", analyze_communication_node)
workflow.add_node("analyze_cultural", analyze_cultural_fit_node)
workflow.add_node("final_scoring", final_scoring_node)

workflow.set_entry_point("analyze_technical")
workflow.add_edge("analyze_technical", "analyze_communication")
workflow.add_edge("analyze_communication", "analyze_cultural")
workflow.add_edge("analyze_cultural", "final_scoring")
workflow.add_edge("final_scoring", END)

evaluation_app = workflow.compile()
