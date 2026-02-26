from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession 
from sqlalchemy.orm.attributes import flag_modified
from src.data.models.transcript import Transcript as InterviewTranscript

class InterviewTranscriptRepository:
    def __init__(self, db: AsyncSession): 
        self.db = db

    async def get_or_create(self, session_id: UUID) -> InterviewTranscript:
        stmt = select(InterviewTranscript).where(InterviewTranscript.session_id == session_id)
        result = await self.db.execute(stmt)
        transcript = result.scalar_one_or_none()

        if not transcript:
            transcript = InterviewTranscript(session_id=session_id, full_transcript=[], turn_count=0)
            self.db.add(transcript)
            await self.db.commit()
            await self.db.refresh(transcript)

        return transcript

    async def append_turn(self, session_id: UUID, role: str, text: str):
        try:
            transcript = await self.get_or_create(session_id)
            
            if transcript.full_transcript is None:
                transcript.full_transcript = []
                
            transcript.full_transcript.append({"role": role, "text": text})
            flag_modified(transcript, "full_transcript")

            transcript.turn_count += 1
            
            await self.db.commit()
            print(f"Successfully saved {role} turn.")
        except Exception as e:
            await self.db.rollback()
            print(f"Database error in append_turn: {e}")
            raise e