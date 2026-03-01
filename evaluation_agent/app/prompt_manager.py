class PromptManager:
    @staticmethod
    def get_technical_prompt(transcript: str, skill_graph: str) -> str:
        return f"""
        Analyze the technical competency of the candidate based on this interview transcript:
        {transcript}
        
        Focus on these required skills and their weights:
        {skill_graph}
        
        Provide a concise technical analysis.
        """

    @staticmethod
    def get_communication_prompt(transcript: str) -> str:
        return f"""
        Analyze the communication skills and clarity of the candidate:
        {transcript}
        
        Rate their confidence and ability to explain complex ideas.
        """

    @staticmethod
    def get_cultural_fit_prompt(transcript: str) -> str:
        return f"""
        Analyze the cultural alignment and professional attitude of the candidate:
        {transcript}
        
        Are they collaborative? Do they show passion?
        """

    @staticmethod
    def get_final_synthesis_prompt(tech: str, comm: str, culture: str) -> str:
        return f"""
        Synthesize the final evaluation for the candidate based on these analyses:
        
        TECHNICAL ANALYSIS: {tech}
        COMMUNICATION ANALYSIS: {comm}
        CULTURAL ANALYSIS: {culture}
        
        You must output a JSON object with exactly these fields:
        {{
            "technical_score": float (0-100),
            "communication_score": float (0-100),
            "confidence_score": float (0-100),
            "cultural_fit_score": float (0-100),
            "total_score": float (weighted average),
            "summary": "detailed summary string",
            "explanation": "why this score was given with evidence from transcript",
            "recommendation": "STRONG_HIRE" | "HIRE" | "REJECT",
            "tie_breaker_subscore": float (0-10) to help differentiate equal performers
        }}
        
        Strictly JSON output only.
        """
