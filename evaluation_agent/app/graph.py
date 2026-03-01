from typing import List, Dict, Any
from langgraph.graph import StateGraph, END
from .state import EvaluationState
from .llm import get_llm
from langchain_core.messages import HumanMessage, SystemMessage

from .prompt_manager import PromptManager

# Nodes
async def analyze_technical_node(state: EvaluationState):
    llm = get_llm()
    transcript_text = "\n".join([f"{t['role']}: {t['text']}" for t in state['transcript']])
    skill_graph = str(state['assessment_details'].get('skill_graph', {}))
    
    prompt = PromptManager.get_technical_prompt(transcript_text, skill_graph)
    
    resp = await llm.ainvoke([SystemMessage(content="You are a technical expert interviewer."), HumanMessage(content=prompt)])
    return {"technical_analysis": resp.content}

async def analyze_communication_node(state: EvaluationState):
    llm = get_llm()
    transcript_text = "\n".join([f"{t['role']}: {t['text']}" for t in state['transcript']])
    
    prompt = PromptManager.get_communication_prompt(transcript_text)
    
    resp = await llm.ainvoke([SystemMessage(content="You are an expert HR professional."), HumanMessage(content=prompt)])
    return {"communication_analysis": resp.content}

async def analyze_cultural_fit_node(state: EvaluationState):
    llm = get_llm()
    transcript_text = "\n".join([f"{t['role']}: {t['text']}" for t in state['transcript']])
    
    prompt = PromptManager.get_cultural_fit_prompt(transcript_text)
    
    resp = await llm.ainvoke([SystemMessage(content="You are a company culture specialist."), HumanMessage(content=prompt)])
    return {"cultural_analysis": resp.content}

async def final_scoring_node(state: EvaluationState):
    llm = get_llm(temperature=0.1)
    
    prompt = PromptManager.get_final_synthesis_prompt(
        state['technical_analysis'] or "None available",
        state['communication_analysis'] or "None available",
        state['cultural_analysis'] or "None available"
    )
    
    resp = await llm.ainvoke([SystemMessage(content="You are a final hiring decision maker."), HumanMessage(content=prompt)])
    import json
    import re
    
    content = resp.content
    match = re.search(r'\{.*\}', content, re.DOTALL)
    if match:
        content = match.group(0)
    
    try:
        data = json.loads(content)
        return {
            "scores": {
                "technical": data.get("technical_score", 0),
                "communication": data.get("communication_score", 0),
                "confidence": data.get("confidence_score", 0),
                "cultural_fit": data.get("cultural_fit_score", 0),
                "total": data.get("total_score", 0)
            },
            "summary": data.get("summary", ""),
            "explanation": data.get("explanation", ""),
            "recommendation": data.get("recommendation", "REJECT"),
            "tie_breaker_subscore": data.get("tie_breaker_subscore", 0.0)
        }
    except Exception as e:
        print(f"Error parsing final AI response: {e}")
        return {"error": f"Failed to parse AI scoring: {str(e)}"}

# Build Graph
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
