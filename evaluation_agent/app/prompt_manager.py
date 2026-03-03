class PromptManager:
    @staticmethod
    def get_technical_prompt(transcript: str, skill_graph: str) -> str:
        return f"""
You are a rigorous technical interviewer evaluating a candidate based on their interview transcript.

# YOUR TASK:
Evaluate the candidate's technical abilities based ONLY on explicit evidence from the transcript.
Score each skill that was discussed using the rubric below.

# SCORING RUBRIC (0-5 scale, use decimals for precision):
- 0.0: No attempt or completely wrong answer
- 1.0: Vague awareness but no real understanding. Candidate mentioned buzzwords without substance
- 2.0: Basic/surface-level understanding. Correct general idea but lacks depth, details, or examples
- 3.0: Competent. Demonstrates working knowledge with some correct details. Could function in a junior role
- 3.5: Good. Solid understanding with specific examples or correct technical details. Minor gaps
- 4.0: Strong. Deep understanding with accurate details, real-world examples, and ability to reason about trade-offs
- 4.5: Very strong. Exceptional depth, handles follow-ups well, demonstrates expert-level thinking
- 5.0: Outstanding. Masters concepts, provides novel insights, handles edge cases, and demonstrates thought leadership

# ACCURACY RULES:
1. You MUST cite specific candidate quotes to justify each score
2. If a candidate gives a vague or one-word answer, score it 1.0-2.0 maximum regardless of topic
3. If a candidate says "I don't know" or is clearly guessing, score it 0.0-1.0
4. Short answers (under 15 words) cannot score above 2.5 unless exceptionally precise
5. Incorrect technical claims MUST reduce the score by at least 1.0 point
6. Do NOT inflate scores — most candidates should score between 2.0-4.0
7. Only score skills that were actually asked about in the interview
8. If a skill was not discussed at all, set score to null and note "Not evaluated in interview"

# SKILL GRAPH (skills to evaluate):
{skill_graph}

# INTERVIEW TRANSCRIPT:
{transcript}

# OUTPUT FORMAT (JSON only):
{{
    "skill_evaluations": {{
        "<exact_skill_name_from_graph>": {{
            "score": <float 0.0-5.0>,
            "depth_reached": "<basic|intermediate|advanced>",
            "evidence": ["<direct quote 1>", "<direct quote 2>"],
            "justification": "<why this score, referencing the rubric level>",
            "red_flags": ["<any incorrect statements or concerning patterns>"]
        }}
    }},
    "technical_summary": "<2-3 sentence overall technical assessment>",
    "strongest_area": "<skill name>",
    "weakest_area": "<skill name>",
    "answer_quality_notes": "<observations about answer length, specificity, and depth>"
}}
"""

    @staticmethod
    def get_communication_prompt(transcript: str) -> str:
        return f"""
You are an expert HR communication assessor. Evaluate the candidate's communication and confidence based ONLY on explicit evidence from the transcript.

# SCORING RUBRIC (0-5 scale):

## Communication Score:
- 0.0-1.0: Incoherent, cannot form complete thoughts, severe grammar/logic issues
- 1.5-2.0: Minimal communication. Very short answers, hard to follow reasoning
- 2.5-3.0: Adequate. Gets point across but lacks structure or clarity. Some rambling
- 3.5-4.0: Good. Clear, organized responses. Can explain technical concepts well
- 4.5-5.0: Excellent. Articulate, well-structured, adapts explanation to audience

## Confidence Score:
- 0.0-1.0: Extremely hesitant, constant "I don't know", avoids answering
- 1.5-2.0: Low confidence. Frequently uncertain, qualifies every statement excessively
- 2.5-3.0: Moderate. Some hesitation but engages with questions. Mixed confidence
- 3.5-4.0: Confident. Answers directly, owns their knowledge gaps gracefully
- 4.5-5.0: Very confident. Projects authority, handles uncertainty naturally

# ACCURACY RULES:
1. Cite specific transcript examples for each score
2. Count the number of "I don't know" / "I'm not sure" responses — each one reduces confidence score
3. Assess average answer LENGTH — consistently short (under 10 words) answers indicate low communication
4. Look for filler words, incomplete sentences, and topic avoidance
5. Do NOT confuse technical knowledge with communication skill

# TRANSCRIPT:
{transcript}

# OUTPUT (JSON only):
{{
    "communication_score": <float 0.0-5.0>,
    "communication_evidence": ["<quote showing communication quality>"],
    "communication_justification": "<rubric-based explanation>",
    "confidence_score": <float 0.0-5.0>,
    "confidence_evidence": ["<quote showing confidence level>"],
    "confidence_justification": "<rubric-based explanation>",
    "avg_answer_length": "<short|medium|detailed>",
    "uncertainty_count": <number of times candidate expressed uncertainty>
}}
"""

    @staticmethod
    def get_cultural_fit_prompt(transcript: str) -> str:
        return f"""
You are a company culture specialist. Evaluate the candidate's cultural alignment and professional attitude based ONLY on evidence from the transcript.

# SCORING RUBRIC (0-5 scale):
- 0.0-1.0: Negative attitude, dismissive, unprofessional behavior
- 1.5-2.0: Neutral/minimal engagement. No negative signals but no positive ones either
- 2.5-3.0: Adequate. Shows basic professionalism and willingness to engage
- 3.5-4.0: Good. Demonstrates enthusiasm, curiosity, collaborative mindset
- 4.5-5.0: Excellent. Shows growth mindset, team orientation, passion for learning

# ACCURACY RULES:
1. In a short voice interview, cultural fit evidence is LIMITED — acknowledge this
2. If the transcript is primarily Q&A with little personality shown, score conservatively (2.5-3.5)
3. Do NOT inflate cultural fit just because the candidate was polite — politeness is baseline
4. Look for: enthusiasm about the role, questions asked, growth mindset indicators
5. Cite specific examples from the transcript

# TRANSCRIPT:
{transcript}

# OUTPUT (JSON only):
{{
    "cultural_fit_score": <float 0.0-5.0>,
    "cultural_fit_evidence": ["<supporting quotes>"],
    "cultural_fit_justification": "<rubric-based explanation>",
    "engagement_level": "<low|moderate|high>",
    "red_flags": ["<any concerning behavioral patterns>"]
}}
"""

    @staticmethod
    def get_final_synthesis_prompt(tech, comm, culture, transcript, total_score, coverage_ratio, passing_score):
        return f"""
You are a strict but fair hiring decision maker. Your recommendation MUST align with the numeric evidence.

# DECISION FRAMEWORK:

## Hard Rules (cannot be overridden):
- If Total Score < {passing_score} → MUST be REJECT
- If Coverage Ratio < 0.5 → MUST be REJECT (too few skills evaluated)

## Score-Based Guidelines:
- Total Score 0-39: REJECT (below minimum threshold)
- Total Score 40-54: REJECT (below average, insufficient evidence of competence)
- Total Score 55-64: REJECT or HIRE (borderline — only HIRE if communication and cultural fit are strong)
- Total Score 65-79: HIRE (meets expectations)
- Total Score 80-89: HIRE or STRONG_HIRE (above average — STRONG_HIRE requires exceptional evidence)
- Total Score 90-100: STRONG_HIRE (exceptional across all dimensions)

## Important: Do NOT default to STRONG_HIRE
- STRONG_HIRE should be rare (top 10% of candidates)
- Most good candidates should receive HIRE
- If in doubt between HIRE and STRONG_HIRE, choose HIRE

# NUMERIC METRICS:
- Total Score (0-100): {total_score}
- Coverage Ratio (0.0-1.0): {coverage_ratio}
- Passing Score Threshold: {passing_score}

# TECHNICAL ANALYSIS:
{tech}

# COMMUNICATION ANALYSIS:
{comm}

# CULTURAL ANALYSIS:
{culture}

# TRANSCRIPT:
{transcript}

# YOUR TASK:
1. Review ALL evidence and metrics
2. Verify your recommendation aligns with the score ranges above
3. Write a concise, evidence-based summary
4. Explain your reasoning citing specific transcript evidence

# OUTPUT (JSON only):
{{
    "summary": "<3-4 sentence executive summary covering strengths and weaknesses>",
    "explanation": "<detailed justification referencing specific transcript evidence and scores>",
    "recommendation": "<STRONG_HIRE|HIRE|REJECT>",
    "hiring_confidence": <float 0.0-1.0>,
    "score_alignment_check": "<confirm that recommendation matches the score range guidelines>"
}}
"""