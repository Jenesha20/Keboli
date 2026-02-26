import json
import asyncio
from typing import Optional
from fastapi import WebSocket
from uuid import UUID

from src.handlers.audio.ffmpeg_pipe import PCMTranscoder
from src.handlers.audio.deepgram_tts import deepgram_tts_bytes
from src.handlers.audio.deepgram_stt import DeepgramSTT
from src.core.ai.llm.groq_client import GroqLLMClient
from src.data.repositories.interview_transcript_repo import InterviewTranscriptRepository


class InterviewService:

    def __init__(self, db, session_id: UUID):
        self.db = db
        self.session_id = session_id
        self.transcript_repo = InterviewTranscriptRepository(db)

        self.transcoder = PCMTranscoder()
        self.transcoder.start()

        self.llm = GroqLLMClient()
        self.stt = DeepgramSTT(self.transcoder)

    async def start(self, ws: WebSocket):

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
            print("saved candidate turn, now calling LLM...")
            try:
                print("Calling LLM...")
                llm_text = await self.llm.generate(full)
                print("LLM returned:", llm_text)
            except Exception:
                llm_text = f"I heard: {full}"
            print("Saving interviewer turn to db...")
            await self.transcript_repo.append_turn(
            self.session_id,
            "interviewer",
            llm_text
        )
            print("Saved interviewer turn, now calling TTS...")
            await ws.send_text(json.dumps({"type": "tts_start"}))
            audio = await deepgram_tts_bytes(llm_text)
            await ws.send_bytes(audio)
            await ws.send_text(json.dumps({"type": "tts_end"}))

        await self.stt.connect(ws, handle_final)

    def write_audio(self, chunk: bytes):
        self.transcoder.write(chunk)

    def close(self):
        self.transcoder.close()