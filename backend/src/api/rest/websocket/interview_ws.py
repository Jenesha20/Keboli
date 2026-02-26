# import asyncio
# import json
# import os
# import subprocess
# import time
# from typing import Optional

# import httpx
# import websockets
# from fastapi import APIRouter, WebSocket, WebSocketDisconnect

# from src.config.settings import settings
# from src.core.ai.llm.groq_client import GroqLLMClient

# router = APIRouter()


# def _now_ms() -> int:
#     return int(time.time() * 1000)


# class _PCMTranscoder:
#     def __init__(self) -> None:
#         self._proc: Optional[subprocess.Popen[bytes]] = None

#     def start(self) -> None:
#         if self._proc is not None:
#             return

#         cmd = [
#             "ffmpeg",
#             "-loglevel",
#             "quiet",
#             "-i",
#             "pipe:0",
#             "-ac",
#             "1",
#             "-ar",
#             "16000",
#             "-f",
#             "s16le",
#             "pipe:1",
#         ]
#         self._proc = subprocess.Popen(
#             cmd,
#             stdin=subprocess.PIPE,
#             stdout=subprocess.PIPE,
#             stderr=subprocess.DEVNULL,
#             bufsize=0,
#         )

#     def write(self, data: bytes) -> None:
#         if not self._proc or not self._proc.stdin:
#             return
#         self._proc.stdin.write(data)
#         self._proc.stdin.flush()

#     def read(self, n: int = 4096) -> bytes:
#         if not self._proc or not self._proc.stdout:
#             return b""
#         return self._proc.stdout.read(n)

#     def close(self) -> None:
#         if not self._proc:
#             return
#         try:
#             if self._proc.stdin:
#                 self._proc.stdin.close()
#         except Exception:
#             pass
#         try:
#             if self._proc.stdout:
#                 self._proc.stdout.close()
#         except Exception:
#             pass
#         try:
#             self._proc.terminate()
#         except Exception:
#             pass
#         self._proc = None


# async def _deepgram_tts_bytes(text: str) -> bytes:
#     model = os.getenv("DEEPGRAM_TTS_MODEL", "aura-helios-en")
#     url = f"https://api.deepgram.com/v1/speak?model={model}&encoding=mp3"

#     headers = {
#         "Authorization": f"Token {settings.DEEPGRAM_API_KEY}",
#         "Content-Type": "application/json",
#     }

#     start = _now_ms()
#     first_byte_ms: Optional[int] = None
#     out = bytearray()

#     async with httpx.AsyncClient(timeout=None) as client:
#         async with client.stream("POST", url, headers=headers, json={"text": text}) as r:
#             r.raise_for_status()
#             async for chunk in r.aiter_bytes():
#                 if not chunk:
#                     continue
#                 if first_byte_ms is None:
#                     first_byte_ms = _now_ms()
#                     print(f"TTS Time to First Byte (TTFB): {first_byte_ms - start}ms")
#                 out.extend(chunk)

#     return bytes(out)


# @router.websocket("/ws/interview")
# async def interview_ws(ws: WebSocket):
#     await ws.accept()
#     print("WS connected")

#     try:
#         llm = GroqLLMClient()
#     except Exception as e:
#         llm = None
#         print(f"Groq init error (LLM will fallback): {e}")

#     last_speech_ms: Optional[int] = None
#     last_silence_sent_ms: Optional[int] = None
#     async def handle_final_transcript(full: str, confidence: Optional[float]) -> None:
#         nonlocal last_silence_sent_ms
#         print(f"Human: {full}")
#         await ws.send_text(json.dumps({"type": "final", "text": full, "confidence": confidence}))

#         if llm is None:
#             llm_text = f"I heard: {full}"
#         else:
#             try:
#                 llm_text = await llm.generate(full)
#             except Exception as e:
#                 llm_text = f"I heard: {full}"
#                 print(f"Groq LLM error, using fallback: {e}")

#         await ws.send_text(json.dumps({"type": "tts_start"}))
#         try:
#             audio_bytes = await _deepgram_tts_bytes(llm_text)
#             await ws.send_bytes(audio_bytes)
#         finally:
#             await ws.send_text(json.dumps({"type": "tts_end"}))

#         last_silence_sent_ms = None

#     print("Listening...")

#     transcoder = _PCMTranscoder()
#     transcoder.start()

#     async def pump_pcm_to_deepgram(dg_socket) -> None:
#         try:
#             while True:
#                 chunk = await asyncio.to_thread(transcoder.read, 4096)
#                 if chunk:
#                     await dg_socket.send(chunk)
#                 else:
#                     await asyncio.sleep(0.01)
#         except Exception:
#             return

#     async def silence_notifier():
#         nonlocal last_silence_sent_ms
#         try:
#             while True:
#                 await asyncio.sleep(0.25)
#                 if last_speech_ms is None:
#                     continue
#                 silence_ms = _now_ms() - last_speech_ms
#                 if silence_ms < 500:
#                     continue
#                 if last_silence_sent_ms is not None and silence_ms - last_silence_sent_ms < 500:
#                     continue
#                 last_silence_sent_ms = silence_ms
#                 await ws.send_text(json.dumps({"type": "SILENCE_DETECTED", "silence_ms": silence_ms}))
#         except Exception:
#             return

#     silence_task = asyncio.create_task(silence_notifier())

#     model = os.getenv("DEEPGRAM_STT_MODEL", "nova-2")
#     language = os.getenv("DEEPGRAM_LANGUAGE", "en-US")
#     endpointing = str(int(os.getenv("DEEPGRAM_ENDPOINTING_MS", "300")))

#     dg_url = (
#         "wss://api.deepgram.com/v1/listen"
#         f"?model={model}"
#         f"&language={language}"
#         "&encoding=linear16"
#         "&sample_rate=16000"
#         "&channels=1"
#         "&punctuate=true"
#         "&smart_format=true"
#         "&interim_results=true"
#         f"&endpointing={endpointing}"
#     )

#     headers = {"Authorization": f"Token {settings.DEEPGRAM_API_KEY}"}
#     transcript_parts: list[str] = []

#     async with websockets.connect(dg_url, extra_headers=headers) as dg_ws:
#         async def pump_pcm_to_deepgram_ws() -> None:
#             try:
#                 while True:
#                     chunk = await asyncio.to_thread(transcoder.read, 4096)
#                     if chunk:
#                         await dg_ws.send(chunk)
#                     else:
#                         await asyncio.sleep(0.01)
#             except Exception:
#                 return

#         async def read_deepgram_ws() -> None:
#             nonlocal last_speech_ms
#             try:
#                 async for raw in dg_ws:
#                     if not isinstance(raw, str):
#                         continue
#                     data = json.loads(raw)
#                     ch = (data.get("channel") or {})
#                     alts = ch.get("alternatives") or []
#                     if not alts:
#                         continue
#                     alt = alts[0] or {}
#                     text = (alt.get("transcript") or "").strip()
#                     if not text:
#                         continue
#                     await ws.send_text(json.dumps({"type": "INTERRUPT"}))
#                     last_speech_ms = _now_ms()
#                     confidence = alt.get("confidence")

#                     speech_final = bool(data.get("speech_final"))
#                     is_final = bool(data.get("is_final"))

#                     if not (speech_final or is_final):
#                         await ws.send_text(json.dumps({"type": "partial", "text": text}))
#                         continue

#                     transcript_parts.append(text)
#                     full = " ".join(transcript_parts).strip()
#                     transcript_parts.clear()
#                     await handle_final_transcript(full, confidence)
#             except Exception:
#                 return

#         pcm_task = asyncio.create_task(pump_pcm_to_deepgram_ws())
#         dg_read_task = asyncio.create_task(read_deepgram_ws())

#         try:
#             while True:
#                 msg = await ws.receive()
#                 if msg.get("type") == "websocket.disconnect":
#                     raise WebSocketDisconnect
#                 b = msg.get("bytes")
#                 if b:
#                     transcoder.write(b)
#         except WebSocketDisconnect:
#             print("WS disconnected")
#         finally:
#             pcm_task.cancel()
#             dg_read_task.cancel()

#     silence_task.cancel()
#     transcoder.close()


from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from src.core.services.interview_service import InterviewService
import asyncio
router = APIRouter()


@router.websocket("/ws/interview")
async def interview_ws(ws: WebSocket):
    await ws.accept()
    service = InterviewService()
    stt_task = asyncio.create_task(service.start(ws))
    try:
        while True:
            msg = await ws.receive()

            if msg.get("type") == "websocket.disconnect":
                raise WebSocketDisconnect

            if msg.get("bytes"):
                service.write_audio(msg["bytes"])

    except WebSocketDisconnect:
        pass
    finally:
        service.close()