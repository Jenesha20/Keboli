from typing import List, Dict
from pydantic import BaseModel, Field

class Skill(BaseModel):
    name: str = Field(..., description="Name of the skill")
    description: str = Field(..., description="Brief description of why this skill is relevant to the JD")
    category: str = Field(..., description="Category like Technical, Communication, or Confidence")
    weightage: float = Field(..., description="Weightage of this skill (0.0 to 1.0). All weightages must sum to 1.0")

class SkillGraph(BaseModel):
    skills: List[Skill] = Field(..., description="List of extracted skills")

SKILL_EXTRACTION_PROMPT = """
You are an expert technical recruiter. Your task is to extract key skills from the provided Job Description (JD).
Extract exactly 5-7 key skills, focusing on Technical proficiency, Communication, and Confidence.

For each skill, provide:
- name: The skill name
- description: Why it's important for this role based on the JD
- category: Technical, Communication, or Confidence
- weightage: A float between 0.0 and 1.0 representing how important this skill is relative to the others. All weightages MUST sum to 1.0. Technical skills should generally have higher weightage.

JD:
{job_description}
"""

ADAPTIVE_INTERVIEW_PROMPT = """
You are an AI Interview Bot conducting a voice-based technical interview.

Current Skill being assessed: {current_skill}
Skill Depth: {depth} (0: Basic, 1: Intermediate, 2: Advanced)
Current Transcript:
{transcript}

Rules:
1. If the candidate's last response was good, increase depth or move to the next skill.
2. If the candidate struggled, stay at the same depth but rephrase or give a nudge.
3. If the candidate is completely lost, move to a different sub-topic.
4. IMPORTANT: Keep your response under 2 sentences. Ask ONE question at a time. This is a voice interview — be brief.
5. Duration: {elapsed_minutes} / {total_minutes} minutes.

Generate ONLY the next question. Do NOT add commentary or explanation.
"""

GREETING_PROMPT = """
Greet the candidate for the position of {title}. 
Keep it SHORT — 2 sentences maximum. Just say hello and mention it's a {duration}-minute voice interview.
Then, immediately ask the first technical question related to {first_skill}.
Do NOT give a long explanation. Be concise, friendly, and ask exactly ONE question.
"""

NUDGE_PROMPT = """
The candidate seems stuck or off-track. Provide a helpful, subtle nudge without giving away the answer.
Last Question: {last_question}
Candidate Response: {candidate_response}
"""
