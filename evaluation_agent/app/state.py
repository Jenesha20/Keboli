from typing import TypedDict, List, Dict, Any, Optional

class EvaluationState(TypedDict):
    session_id: str
    transcript: List[Dict[str, Any]]
    assessment_details: Dict[str, Any]
    
    # Analysis results
    technical_analysis: Optional[str]
    communication_analysis: Optional[str]
    cultural_analysis: Optional[str]
    
    # Final outputs
    scores: Dict[str, float]
    summary: Optional[str]
    explanation: Optional[str]
    recommendation: Optional[str]
    tie_breaker_subscore: float
    
    # Error management
    error: Optional[str]
