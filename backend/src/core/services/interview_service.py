import json
from typing import Optional
from fastapi import WebSocket

from src.handlers.audio.ffmpeg_pipe import PCMTranscoder
from src.handlers.audio.deepgram_tts import deepgram_tts_bytes
from src.handlers.audio.deepgram_stt import DeepgramSTT
from src.handlers.audio.silence_detector import silence_notifier
from src.core.ai.llm.groq_client import GroqLLMClient


class InterviewService:

    def __init__(self):
        self.transcoder = PCMTranscoder()
        self.transcoder.start()
        self.llm = GroqLLMClient()
        self.stt = DeepgramSTT(self.transcoder)

    async def start(self, ws: WebSocket):

        async def handle_final(full: str, confidence: Optional[float]):
            await ws.send_text(json.dumps({
                "type": "final",
                "text": full,
                "confidence": confidence
            }))

            try:
                llm_text = await self.llm.generate(full)
            except Exception:
                llm_text = f"I heard: {full}"

            await ws.send_text(json.dumps({"type": "tts_start"}))
            audio = await deepgram_tts_bytes(llm_text)
            await ws.send_bytes(audio)
            await ws.send_text(json.dumps({"type": "tts_end"}))

        await self.stt.connect(ws, handle_final)

    def write_audio(self, chunk: bytes):
        self.transcoder.write(chunk)

    def close(self):
        self.transcoder.close()