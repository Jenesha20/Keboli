from fastapi import FastAPI, HTTPException
from .keboli_client import keboli_client
from .graph import evaluation_app
from .state import EvaluationState

app = FastAPI(title="Keboli Evaluation Agent", version="1.0.0")

@app.post("/api/v1/evaluate/{session_id}")
async def evaluate_candidate(session_id: str):
    try:
        transcript_data = await keboli_client.get_transcript(session_id)
        session_details = await keboli_client.get_session_details(session_id)
        
        initial_state: EvaluationState = {
            "session_id": session_id,
            "transcript": transcript_data,
            "assessment_details": session_details,
            "technical_analysis": None,
            "communication_analysis": None,
            "cultural_analysis": None,
            "skill_scores": {},
            "scores": {},
            "summary": None,
            "explanation": None,
            "recommendation": None,
            "tie_breaker_subscore": 0.0,
            "error": None
        }
        
        result = await evaluation_app.ainvoke(initial_state)
        
        if result.get("error"):
            raise HTTPException(status_code=500, detail=result["error"])
            
       
        recommendation = result.get("recommendation", "REJECT").lower()
        
        scale = 20.0
        evaluation_payload = {
            "technical_score": float(result["scores"]["technical"]) * scale,
            "communication_score": float(result["scores"]["communication"]) * scale,
            "confidence_score": float(result["scores"]["confidence"]) * scale,
            "cultural_alignment_score": float(result["scores"]["cultural_fit"]) * scale,
            "total_score": float(result["scores"]["total"]) * scale,
            "score_breakdown": {
                "technical": result["scores"]["technical"],
                "communication": result["scores"]["communication"],
                "confidence": result["scores"]["confidence"],
                "cultural_fit": result["scores"]["cultural_fit"],
                "tie_breaker": float(result.get("tie_breaker_subscore", 0.0)),
                "skill_evaluations": result.get("skill_scores", {})
            },
            "ai_summary": result["summary"],
            "ai_explanation": result["explanation"],
            "hiring_recommendation": recommendation,
            "admin_recommendation": None,
            "admin_notes": None,
            "is_tie_winner": False,
            "detailed_analysis": {
                "skill_scores": result.get("skill_scores", {}),
                "technical_analysis": result.get("technical_analysis"),
                "communication_analysis": result.get("communication_analysis"),
                "cultural_analysis": result.get("cultural_analysis")
            }
        }
        
        print(f"Pushing evaluation for session {session_id}: {recommendation}")
        try:
            resp = await keboli_client.post_evaluation(session_id, evaluation_payload)
            print("Successfully posted evaluation to backend.")
            return {"status": "success", "session_id": session_id, "recommendation": recommendation}
        except Exception as api_err:
            print(f"Failed to post evaluation: {api_err}")
            if hasattr(api_err, 'response') and api_err.response:
                print(f"Backend response: {api_err.response.text}")
            raise api_err
        
    except Exception as e:
        print(f"Evaluation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
