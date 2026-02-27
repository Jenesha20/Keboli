from app.state import InterviewState
from app.llm import llm
from app.prompt_manager import GREETING_PROMPT, ADAPTIVE_INTERVIEW_PROMPT, NUDGE_PROMPT
from langchain_core.messages import AIMessage, HumanMessage

async def greeting_node(state: InterviewState):
    skills = state.get("skill_graph", {}).get("skills", [])
    first_skill = skills[0]["name"] if skills else "your background"
    
    prompt = GREETING_PROMPT.format(
        title=state.get("title", "this position"),
        duration=state.get("total_duration_minutes", 5),
        first_skill=first_skill
    )
    
    response = await llm.ainvoke(prompt)
    
    return {
        "messages": [AIMessage(content=response.content)],
        "current_skill_index": 0,
        "current_skill_depth": 1
    }

async def interview_node(state: InterviewState):
    messages = state.get("messages", [])
    skills = state.get("skill_graph", {}).get("skills", [])
    current_idx = state.get("current_skill_index", 0)
    current_depth = state.get("current_skill_depth", 0)
    
    if current_idx >= len(skills):
        return {"is_completed": True}

    current_skill = skills[current_idx]["name"]
    
    transcript = ""
    for m in messages[-4:]:
        role = "AI" if isinstance(m, AIMessage) else "Candidate"
        transcript += f"{role}: {m.content}\n"

    prompt = ADAPTIVE_INTERVIEW_PROMPT.format(
        current_skill=current_skill,
        depth=current_depth,
        transcript=transcript,
        elapsed_minutes=state.get("elapsed_time_seconds", 0) // 60,
        total_minutes=state.get("total_duration_minutes", 30)
    )
    

    last_human_message = ""
    for m in reversed(messages):
        if isinstance(m, HumanMessage):
            last_human_message = m.content
            break
            
    if last_human_message and (len(last_human_message.split()) < 5 or "i don't know" in last_human_message.lower()):
        nudge_prompt = NUDGE_PROMPT.format(
            last_question=messages[-2].content if len(messages) > 1 else "",
            candidate_response=last_human_message
        )
        response = await llm.ainvoke(nudge_prompt)
        return {
            "messages": [AIMessage(content=response.content)],
            "should_nudge": True
        }

    elapsed_minutes = state.get("elapsed_time_seconds", 0) // 60
    if elapsed_minutes >= state.get("total_duration_minutes", 30):
        return {
            "messages": [AIMessage(content="We have reached the end of our allotted time. Thank you for your time today.")],
            "is_completed": True
        }

    response = await llm.ainvoke(prompt)
    
    next_depth = current_depth + 1
    next_idx = current_idx
    if next_depth > 2:
        next_depth = 0
        next_idx = current_idx + 1

    return {
        "messages": [AIMessage(content=response.content)],
        "current_skill_index": next_idx,
        "current_skill_depth": next_depth,
        "should_nudge": False 
    }
