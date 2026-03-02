from typing import TypedDict, List, Dict, Any, Optional

class EvaluationState(TypedDict):
    session_id: str
    transcript: List[Dict[str, Any]]
    assessment_details: Dict[str, Any]
    
    technical_analysis: Optional[str]
    communication_analysis: Optional[str]
    cultural_analysis: Optional[str]
    
    skill_scores: Dict[str, Dict[str, Any]]
    
    scores: Dict[str, float]
    summary: Optional[str]
    explanation: Optional[str]
    recommendation: Optional[str]
    tie_breaker_subscore: float
    
    error: Optional[str]
