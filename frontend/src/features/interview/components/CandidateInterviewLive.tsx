import React, { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createChunkedRecorder } from '../../../lib/mediaRecorder';
import { createInterviewWebSocket } from '../../../lib/websocket';

// --- Types ---
export type WSMessage =
  | { type: 'partial'; text: string }
  | { type: 'final'; text: string; confidence?: number | null }
  | { type: 'SILENCE_DETECTED'; silence_ms: number }
  | { type: 'tts_start'; text?: string }
  | { type: 'tts_end' }
  | { type: 'INTERRUPT' };

// --- Styling Helpers ---
const glassmorphism = "bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]";

const CandidateInterviewLive: React.FC = () => {
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get('assessmentId') || '';

  const [connected, setConnected] = useState(false);
  const [humanText, setHumanText] = useState('');
  const [aiText, setAiText] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isHumanSpeaking, setIsHumanSpeaking] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const ttsChunksRef = useRef<Uint8Array[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);

  const wsUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_WS_URL || 'ws://localhost:8000/api/ws/interview';
    const glue = base.includes('?') ? '&' : '?';
    return `${base}${glue}assessment_id=${assessmentId}`;
  }, [assessmentId]);

  // Audio Playback Queue to prevent overlap
  const processAudioQueue = async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

    isPlayingRef.current = true;
    const ctx = audioCtxRef.current!;
    const audioBuffer = audioQueueRef.current.shift()!;

    const src = ctx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(ctx.destination);
    src.onended = () => {
      isPlayingRef.current = false;
      processAudioQueue();
    };
    src.start();
  };

  const playAudio = async (bytes: Uint8Array) => {
    if (!bytes.byteLength) return;
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    try {
      const copy = new Uint8Array(bytes.byteLength);
      copy.set(bytes);
      const audioBuffer = await audioCtxRef.current.decodeAudioData(copy.buffer);
      audioQueueRef.current.push(audioBuffer);
      processAudioQueue();
    } catch (e) {
      console.error("Audio Decode Error:", e);
    }
  };

  const connect = async () => {
    if (wsRef.current) return;
    setClientError(null);

    const ws = createInterviewWebSocket(wsUrl, {
      onOpen: () => {
        setConnected(true);
      },
      onClose: () => {
        setConnected(false);
        wsRef.current = null;
      },
      onJsonMessage: (msg: any) => {
        const m = msg as WSMessage;
        if (m.type === 'partial') {
          setHumanText(m.text);
          setIsHumanSpeaking(true);
          setIsAiSpeaking(false);
        } else if (m.type === 'final') {
          setHumanText(m.text);
          setIsHumanSpeaking(false);
        } else if (m.type === 'tts_start') {
          setAiText(m.text || '');
          setIsAiSpeaking(true);
          setIsHumanSpeaking(false);
          ttsChunksRef.current = [];
        } else if (m.type === 'tts_end') {
          const bytes = concatUint8(ttsChunksRef.current);
          if (bytes.length > 0) playAudio(bytes);
          ttsChunksRef.current = [];
          // Toggled back after some delay or audio ended
          setTimeout(() => setIsAiSpeaking(false), 3000);
        } else if (m.type === 'INTERRUPT') {
          setIsAiSpeaking(false);
          setIsHumanSpeaking(true);
        }
      },
      onBinaryMessage: (buf: ArrayBuffer) => {
        ttsChunksRef.current.push(new Uint8Array(buf));
      },
    });

    wsRef.current = ws;

    try {
      // Small chunk size for better real-time updates
      const recorder = await createChunkedRecorder({
        chunkMs: 250,
        onChunk: async (blob: Blob) => {
          const arr = await blob.arrayBuffer();
          if (ws.readyState === WebSocket.OPEN) ws.send(arr);
        },
      });
      await recorder.start();
    } catch (e: any) {
      setClientError(e?.message || 'Failed to start microphone');
      ws.close();
    }
  };

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
    setIsAiSpeaking(false);
    setIsHumanSpeaking(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 flex flex-col items-center justify-center font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Glassy Header */}
      <header className={`fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 p-4 rounded-2xl flex justify-between items-center ${glassmorphism}`}>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-rose-500'}`} />
            {connected && <div className="absolute w-3 h-3 rounded-full bg-emerald-500 animate-ping" />}
          </div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-60">
            {connected ? 'Live Assessment' : 'Service Disconnected'}
          </span>
        </div>

        <div className="flex gap-4">
          {!connected ? (
            <button
              onClick={connect}
              className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all font-bold text-sm"
            >
              Start Session
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="px-6 py-2 rounded-lg bg-rose-500/10 border border-rose-500/50 hover:bg-rose-500 transition-all font-bold text-sm"
            >
              End Session
            </button>
          )}
        </div>
      </header>

      {/* Interaction Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mt-20">

        {/* Interviewer Side */}
        <section className="flex flex-col items-center gap-6">
          <div className="relative group">
            {/* Ambient Aura */}
            <div className={`absolute -inset-8 rounded-full bg-blue-500/20 blur-3xl transition-opacity duration-1000 ${isAiSpeaking ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />

            <div className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full p-1 overflow-hidden transition-all duration-500 ${isAiSpeaking ? 'scale-105 shadow-[0_0_60px_rgba(59,130,246,0.3)]' : 'grayscale opacity-60 scale-95'}`}>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-cyan-400 rotate-45" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#020617] bg-slate-900 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-1/2 h-1/2 text-blue-400 opacity-80" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 8V4m0 0H8m4 0h4m-9 4h10c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2z" stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="9" cy="13" r="1" fill="currentColor" />
                  <circle cx="15" cy="13" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Speaking Indicator */}
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-500 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isAiSpeaking ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
              Interviewer
            </div>
          </div>

          <div className={`w-full max-w-md p-6 rounded-2xl min-h-[140px] transition-all duration-500 ${glassmorphism} ${isAiSpeaking ? 'border-blue-400/30' : 'opacity-40'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400">Response Console</span>
            </div>
            <p className="text-lg font-medium leading-relaxed text-slate-200">
              {aiText || (connected ? "Waiting for response..." : "Connect to begin...")}
            </p>
          </div>
        </section>

        {/* Candidate Side */}
        <section className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className={`absolute -inset-8 rounded-full bg-indigo-500/20 blur-3xl transition-opacity duration-1000 ${isHumanSpeaking ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />

            <div className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full p-1 overflow-hidden transition-all duration-500 ${isHumanSpeaking ? 'scale-105 shadow-[0_0_60px_rgba(99,102,241,0.3)]' : 'grayscale opacity-60 scale-95'}`}>
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-400 rotate-45" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#020617] bg-slate-900 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-1/2 h-1/2 text-indigo-400 opacity-80" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>

            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-500 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isHumanSpeaking ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
              Candidate
            </div>
          </div>

          <div className={`w-full max-w-md p-6 rounded-2xl min-h-[140px] transition-all duration-500 ${glassmorphism} ${isHumanSpeaking ? 'border-indigo-400/30' : 'opacity-40'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">Transcript Feed</span>
            </div>
            <p className="text-lg font-medium leading-relaxed text-slate-200">
              {humanText || (connected ? (isHumanSpeaking ? "Capturing voice..." : "Awaiting input...") : "Microphone inactive")}
            </p>
          </div>
        </section>

      </div>

      {clientError && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-200 text-[10px] uppercase font-bold tracking-tighter">
          System Warning: {clientError}
        </div>
      )}
    </div>
  );
};

function concatUint8(chunks: Uint8Array[]) {
  const total = chunks.reduce((sum, c) => sum + c.byteLength, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.byteLength;
  }
  return out;
}

export default CandidateInterviewLive;
