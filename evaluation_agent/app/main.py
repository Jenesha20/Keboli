from fastapi import FastAPI, HTTPException
from .keboli_client import keboli_client
from .graph import evaluation_app
from .state import EvaluationState

app = FastAPI(title="Keboli Evaluation Agent", version="1.0.0")

@app.post("/api/v1/evaluate/{session_id}")
async def evaluate_candidate(session_id: str):
    try:
        # 1. Fetch transcript and session/assessment details from main backend
        transcript_data = await keboli_client.get_transcript(session_id)
        session_details = await keboli_client.get_session_details(session_id)
        
        # 2. Prepare state for LangGraph
        initial_state: EvaluationState = {
            "session_id": session_id,
            "transcript": transcript_data,
            "assessment_details": session_details,
            "technical_analysis": None,
            "communication_analysis": None,
            "cultural_analysis": None,
            "scores": {},
            "summary": None,
            "explanation": None,
            "recommendation": None,
            "tie_breaker_subscore": 0.0,
            "error": None
        }
        
        # 3. Run evaluation through LangGraph pipeline
        result = await evaluation_app.ainvoke(initial_state)
        
        if result.get("error"):
            raise HTTPException(status_code=500, detail=result["error"])
            
        # 4. Push results back to main backend
        # Ensure recommendation is in lowercase to match backend Enums
        recommendation = result.get("recommendation", "REJECT").lower()
        
        evaluation_payload = {
            "technical_score": float(result["scores"]["technical"]),
            "communication_score": float(result["scores"]["communication"]),
            "confidence_score": float(result["scores"]["confidence"]),
            "cultural_alignment_score": float(result["scores"]["cultural_fit"]),
            "total_score": float(result["scores"]["total"]),
            "score_breakdown": {
                "technical": result["scores"]["technical"],
                "communication": result["scores"]["communication"],
                "confidence": result["scores"]["confidence"],
                "cultural_fit": result["scores"]["cultural_fit"],
                "tie_breaker": float(result.get("tie_breaker_subscore", 0.0))
            },
            "ai_summary": result["summary"],
            "ai_explanation": result["explanation"],
            "hiring_recommendation": recommendation,
            "admin_recommendation": None,
            "admin_notes": None,
            "is_tie_winner": False
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
