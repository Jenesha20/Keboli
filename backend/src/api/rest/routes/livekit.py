from fastapi import APIRouter, HTTPException, Query, Depends
from livekit import api as livekit_api
from uuid import UUID, uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.api.rest.dependencies import get_db
from src.config.settings import settings
from src.data.models.invitation import Invitation
from src.data.models.interview_session import InterviewSession
from src.constants.enums import InterviewSessionStatus
from datetime import datetime

from sqlalchemy.orm import joinedload

router = APIRouter(prefix="/livekit", tags=["livekit"])

@router.post("/token")
async def get_token(
    invitation_token: str = Query(..., description="The invitation token"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Invitation).options(joinedload(Invitation.assessment)).where(Invitation.token == invitation_token)
    result = await db.execute(query)
    invitation = result.scalar_one_or_none()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

  
    query = select(InterviewSession).where(
        InterviewSession.invitation_id == invitation.id,
        InterviewSession.status == InterviewSessionStatus.IN_PROGRESS
    )
    result = await db.execute(query)
    session = result.scalar_one_or_none()

    if not session:
        duration_mins = 60
        if invitation.assessment:
            duration_mins = invitation.assessment.duration_minutes

        session = InterviewSession(
            id=uuid4(),
            invitation_id=invitation.id,
            candidate_id=invitation.candidate_id,
            status=InterviewSessionStatus.IN_PROGRESS,
            remaining_seconds=duration_mins * 60,
            started_at=datetime.utcnow()
        )
        db.add(session)
        await db.commit()
    
    room_name = f"room_{session.id}_{invitation.assessment_id}"
    participant_identity = f"candidate_{session.id.hex[:8]}"

    livekit_url = settings.LIVEKIT_URL
    api_key = settings.LIVEKIT_API_KEY
    api_secret = settings.LIVEKIT_API_SECRET

    if not api_key or not api_secret:
         raise HTTPException(status_code=500, detail="LiveKit credentials not configured")

    try:
        token = livekit_api.AccessToken(api_key, api_secret) \
            .with_identity(participant_identity) \
            .with_name("Candidate") \
            .with_grants(livekit_api.VideoGrants(
                room_join=True,
                room=room_name,
            ))
        
        return {
            "token": token.to_jwt(),
            "url": livekit_url,
            "room_name": room_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate LiveKit token: {str(e)}")