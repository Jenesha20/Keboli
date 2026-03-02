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

async def analyze_technical_node(state: EvaluationState):
    llm = get_llm()
    transcript_text = "\n".join([f"{t['role']}: {t['text']}" for t in state['transcript']])
    skill_graph = state['assessment_details'].get('skill_graph', {})
    
    prompt = PromptManager.get_technical_prompt(transcript_text, str(skill_graph))
    
    resp = await llm.ainvoke([
        SystemMessage(content="You are a technical expert interviewer who outputs JSON."), 
        HumanMessage(content=prompt)
    ])
    
    data = extract_json(resp.content)
    if data and "skill_evaluations" in data:
        return {
            "technical_analysis": data.get("technical_summary", resp.content),
            "skill_scores": data["skill_evaluations"]
        }
    return {"technical_analysis": resp.content, "skill_scores": {}}

async def analyze_communication_node(state: EvaluationState):
    llm = get_llm()
    transcript_text = "\n".join([f"{t['role']}: {t['text']}" for t in state['transcript']])
    
    prompt = PromptManager.get_communication_prompt(transcript_text)
    
    resp = await llm.ainvoke([
        SystemMessage(content="You are an expert HR professional who outputs JSON."), 
        HumanMessage(content=prompt)
    ])
    
    data = extract_json(resp.content)
    return {"communication_analysis": json.dumps(data) if data else resp.content}

async def analyze_cultural_fit_node(state: EvaluationState):
    llm = get_llm()
    transcript_text = "\n".join([f"{t['role']}: {t['text']}" for t in state['transcript']])
    
    prompt = PromptManager.get_cultural_fit_prompt(transcript_text)
    
    resp = await llm.ainvoke([
        SystemMessage(content="You are a company culture specialist who outputs JSON."), 
        HumanMessage(content=prompt)
    ])
    
    data = extract_json(resp.content)
    return {"cultural_analysis": json.dumps(data) if data else resp.content}

async def final_scoring_node(state: EvaluationState):
    skill_graph = state['assessment_details'].get('skill_graph', {})
    passing_score = float(state['assessment_details'].get('passing_score', 70))

    skill_evaluations = state.get('skill_scores', {})

    weighted_tech_score = 0.0
    evaluated_weight_sum = 0.0
    total_weight_sum = 0.0

 
    for skill_id, weight in skill_graph.items():
        try:
            w_val = float(str(weight).replace('%', '')) / 100.0 if '%' in str(weight) else float(weight)
        except (ValueError, TypeError):
            continue

        total_weight_sum += w_val

        eval_data = skill_evaluations.get(skill_id)
        if eval_data and eval_data.get('score') is not None:
            try:
                score = float(eval_data['score'])
                weighted_tech_score += score * w_val
                evaluated_weight_sum += w_val
            except (ValueError, TypeError):
                continue

    if evaluated_weight_sum > 0:
        normalized_score = weighted_tech_score / evaluated_weight_sum
    else:
        normalized_score = 0.0

    coverage_ratio = (
        evaluated_weight_sum / total_weight_sum
        if total_weight_sum > 0 else 0.0
    )

    final_technical_score = normalized_score * coverage_ratio
    final_technical_score = min(5.0, max(0.0, final_technical_score))

    comm_data = extract_json(state.get('communication_analysis') or "{}") or {}
    cult_data = extract_json(state.get('cultural_analysis') or "{}") or {}

    try:
        comm_score = float(comm_data.get('communication_score', 0))
        conf_score = float(comm_data.get('confidence_score', 0))
        cult_score = float(cult_data.get('cultural_fit_score', 0))
    except (ValueError, TypeError):
        comm_score = conf_score = cult_score = 0.0

  
    final_total_score = (
        (final_technical_score * 0.7) +
        (comm_score * 0.1) +
        (conf_score * 0.1) +
        (cult_score * 0.1)
    )

    final_total_score = min(5.0, max(0.0, final_total_score))
    total_score_100 = final_total_score * 20


    transcript_text = "\n".join(
        [f"{t.get('role','unknown')}: {t.get('text','')}" for t in state.get("transcript", [])]
    )

    llm = get_llm(temperature=0.1)

    prompt = PromptManager.get_final_synthesis_prompt(
        state.get('technical_analysis') or "None",
        state.get('communication_analysis') or "None",
        state.get('cultural_analysis') or "None",
        transcript_text,
        total_score_100,
        coverage_ratio,
        passing_score
    )

    resp = await llm.ainvoke([
        SystemMessage(content="You are a strict hiring decision maker."),
        HumanMessage(content=prompt)
    ])

    data = extract_json(resp.content) or {}
    llm_recommendation = data.get("recommendation", "REJECT")

 
    if total_score_100 < passing_score:
        final_recommendation = "REJECT"
    else:
        final_recommendation = llm_recommendation

    if coverage_ratio < 0.5:
        final_recommendation = "REJECT"


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
