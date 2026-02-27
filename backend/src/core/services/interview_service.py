import json
import asyncio
import httpx
from typing import Optional
from fastapi import WebSocket
from uuid import UUID

from src.handlers.audio.ffmpeg_pipe import PCMTranscoder
from src.handlers.audio.deepgram_tts import deepgram_tts_bytes
from src.handlers.audio.deepgram_stt import DeepgramSTT
from src.core.ai.llm.groq_client import GroqLLMClient 
from src.data.repositories.interview_transcript_repo import InterviewTranscriptRepository


class InterviewService:

    def __init__(self, db, session_id: UUID, assessment_id: str):
        self.db = db
        self.session_id = session_id
        self.assessment_id = assessment_id
        self.agent_state = None
        self.agent_url = "http://localhost:8001/chat"
        
        self.transcript_repo = InterviewTranscriptRepository(db)

        self.transcoder = PCMTranscoder()
        self.transcoder.start()

        self.llm = GroqLLMClient()
        self.stt = DeepgramSTT(self.transcoder)

    async def _get_agent_response(self, last_message: Optional[str] = None) -> str:
        payload = {
            "session_id": str(self.session_id),
            "assessment_id": str(self.assessment_id),
            "last_message": last_message,
            "state": self.agent_state
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.agent_url, json=payload, timeout=60.0)
                response.raise_for_status()
                data = response.json()
                self.agent_state = data.get("state")
                return data.get("response", "")
        except Exception as e:
            print(f"Agent error: {e}")
            if last_message:
                try:
                    return await self.llm.generate(last_message)
                except:
                    return f"I heard: {last_message}"
            return "Hello, I am having some trouble connecting to my brain. Let me try again later."

    async def start(self, ws: WebSocket):
        # 1. First, the AI should greet and ask the question
        print("Starting interview, getting greeting from agent...")
        greeting_text = await self._get_agent_response()
        print(f"Greeting: {greeting_text}")
        
        await self.transcript_repo.append_turn(
            self.session_id,
            "interviewer",
            greeting_text
        )
        
        await ws.send_text(json.dumps({"type": "tts_start", "text": greeting_text}))
        audio = await deepgram_tts_bytes(greeting_text)
        await ws.send_bytes(audio)
        await ws.send_text(json.dumps({"type": "tts_end"}))

        async def handle_final(full: str, confidence: Optional[float]):
            print("Triggered")
            await ws.send_text(json.dumps({
                "type": "final",
                "text": full,
                "confidence": confidence
            }))
            print("saving candiate turn to db...")
            await self.transcript_repo.append_turn(
                self.session_id,
                "candidate",
                full
            )
            print("saved candidate turn, now calling Agent...")
            
            llm_text = await self._get_agent_response(full)
            print("Agent returned:", llm_text)
            
            print("Saving interviewer turn to db...")
            await self.transcript_repo.append_turn(
                self.session_id,
                "interviewer",
                llm_text
            )
            print("Saved interviewer turn, now calling TTS...")
            await ws.send_text(json.dumps({"type": "tts_start", "text": llm_text}))
            audio = await deepgram_tts_bytes(llm_text)
            await ws.send_bytes(audio)
            await ws.send_text(json.dumps({"type": "tts_end"}))

        await self.stt.connect(ws, handle_final)

    def write_audio(self, chunk: bytes):
        self.transcoder.write(chunk)

    def close(self):
        self.transcoder.close()