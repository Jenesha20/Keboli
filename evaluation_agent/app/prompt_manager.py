class PromptManager:
    @staticmethod
    def get_technical_prompt(transcript: str, skill_graph: str) -> str:
        return f"""
        You are a structured technical evaluation bot. Your task is to analyze the candidate's interview transcript and provide a deterministic, skill-based score.

        # INSTRUCTIONS:
        1. Analyze the candidate's responses against the Skill Graph provided.
        2. For each skill in the graph, assign a score (0 to 5) and a justification.
        3. Only score skills that were actually evaluated in the transcript.
        4. If a skill was not evaluated, do NOT assign a score (or set it to null/0 with a justification that it was not covered).
        5. Consider: Conceptual correctness, Depth of explanation, Clarity, Real-world understanding, and Ability to handle follow-ups.
        6. You must ONLY use explicit evidence from the transcript.
        7. If evidence is missing, score low or null.
        8. Do NOT assume experience.
        9. Do NOT infer beyond transcript.
        10. You must cite specific transcript phrases in your justification.

        # Skill Graph (Format: skill_name: weight):
        {skill_graph}

        # Transcript:
        {transcript}

        # OUTPUT FORMAT:
        You must output a JSON object containing a 'skill_evaluations' field:
        {{
            "skill_evaluations": {{
                "skill_id_1": {{
                    "score": 4.2,
                    "justification": "..."
                }},
                ...
            }},
            "technical_summary": "Overall technical impressions..."
        }}
        """

    @staticmethod
    def get_communication_prompt(transcript: str) -> str:
        return f"""
        Analyze the communication skills and confidence of the candidate:
        {transcript}
        
        # INSTRUCTIONS:
        1. Assign a Communication score (0 to 5).
        2. Assign a Confidence score (0 to 5).
        3. Provide justifications for both.
        4. You must ONLY use explicit evidence from the transcript.
        5. Do NOT assume personality traits not shown.
        6. If evidence is insufficient, assign a conservative score.
        7. Cite transcript phrases in justification.
        
        # OUTPUT:
        You must output a JSON object:
        {{
            "communication_score": float,
            "communication_justification": "...",
            "confidence_score": float,
            "confidence_justification": "..."
        }}
        """

    @staticmethod
    def get_cultural_fit_prompt(transcript: str) -> str:
        return f"""
        Analyze the cultural alignment and professional attitude of the candidate:
        {transcript}
        
        # INSTRUCTIONS:
        1. Assign a Cultural Alignment score (0 to 5).
        2. Provide justification.
        3. You must ONLY use explicit evidence from the transcript.
        4. Do NOT assume personality traits not shown.
        5. If evidence is insufficient, assign a conservative score.
        6. Cite transcript phrases in justification.
        
        # OUTPUT:
        You must output a JSON object:
        {{
            "cultural_fit_score": float,
            "cultural_fit_justification": "..."
        }}
        """

    @staticmethod
    def get_final_synthesis_prompt(tech, comm, culture, transcript, total_score, coverage_ratio, passing_score):
        return f"""
        You are a strict hiring decision maker.

        Your decision MUST be grounded in:
        1. Transcript evidence
        2. Technical, communication, and cultural analysis
        3. Numeric total score
        4. Skill coverage ratio

        # NUMERIC METRICS:
        Total Score (0-100): {total_score}
        Coverage Ratio (0-1): {coverage_ratio}
        Passing Score Threshold: {passing_score}

        If Total Score < Passing Score → REJECT.
        If Coverage Ratio < 0.5 → REJECT.

        You MUST NOT ignore numeric constraints.

        # TECHNICAL ANALYSIS:
        {tech}

        # COMMUNICATION ANALYSIS:
        {comm}

        # CULTURAL ANALYSIS:
        {culture}

        # TRANSCRIPT:
        {transcript}

        # HIRING CRITERIA:
        - STRONG_HIRE: Exceptional evidence + strong numeric score
        - HIRE: Meets expectations numerically and evidentially
        - REJECT: Below threshold or insufficient evidence

        # OUTPUT:
        Return JSON only:
        {{
            "summary": "...",
            "explanation": "Evidence-based justification referencing transcript",
            "recommendation": "STRONG_HIRE | HIRE | REJECT",
            "hiring_confidence": float (0-1)
        }}
        """