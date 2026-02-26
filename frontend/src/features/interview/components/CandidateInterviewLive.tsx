import React, { useMemo, useRef, useState } from 'react';
import { createChunkedRecorder } from '../../../lib/mediaRecorder';
import { createInterviewWebSocket, type WSMessage } from '../../../lib/websocket';

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

const CandidateInterviewLive: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [partial, setPartial] = useState('');
  const [finals, setFinals] = useState<string[]>([]);
  const [silenceMs, setSilenceMs] = useState<number | null>(null);
  const [lastChunkBytes, setLastChunkBytes] = useState<number | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const ttsChunksRef = useRef<Uint8Array[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const debouncedPartial = useDebouncedValue(partial, 500);

  const wsUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_WS_URL || 'ws://localhost:8000/api/ws/interview';
    return base;
  }, []);

  const connect = async () => {
    if (wsRef.current) return;

    setClientError(null);

    const ws = createInterviewWebSocket(wsUrl, {
      onOpen: () => {
        setConnected(true);
        setSilenceMs(null);
      },
      onClose: () => {
        setConnected(false);
        wsRef.current = null;
      },
      onJsonMessage: (msg: WSMessage) => {
        if (msg.type === 'partial') {
          setPartial(msg.text);
          return;
        }
        if (msg.type === 'final') {
          setFinals((prev) => [...prev, msg.text]);
          setPartial('');
          return;
        }
        if (msg.type === 'SILENCE_DETECTED') {
          setSilenceMs(msg.silence_ms);
          return;
        }
        if (msg.type === 'tts_start') {
          ttsChunksRef.current = [];
          return;
        }
        if (msg.type === 'tts_end') {
          const bytes = concatUint8(ttsChunksRef.current);
          playAudio(bytes);
          ttsChunksRef.current = [];
          return;
        }
      },
      onBinaryMessage: (buf: ArrayBuffer) => {
        ttsChunksRef.current.push(new Uint8Array(buf));
      },
    });

    wsRef.current = ws;

    try {
      const recorder = await createChunkedRecorder({
        chunkMs: 1000,
        onChunk: async (blob: Blob) => {
          const arr = await blob.arrayBuffer();
          setLastChunkBytes(arr.byteLength);
          if (ws.readyState !== WebSocket.OPEN) return;
          ws.send(arr);
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
  };

  const playAudio = async (bytes: Uint8Array) => {
    if (!bytes.byteLength) return;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();

    // Deepgram TTS returns compressed audio (often mp3/wav depending on model/settings).
    // decodeAudioData can handle many formats.
    const ctx = audioCtxRef.current;
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const audioBuffer = await ctx.decodeAudioData(copy.buffer);
    const src = ctx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(ctx.destination);
    src.start();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">Live Interview</div>
          <div className="text-sm text-gray-600">
            Status: {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
            onClick={connect}
            disabled={connected}
          >
            Start
          </button>
          <button
            className="px-4 py-2 rounded border"
            onClick={disconnect}
            disabled={!connected}
          >
            Stop
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <div className="text-sm font-medium text-gray-700">Partial captions</div>
        <div className="mt-2 text-lg min-h-8">{debouncedPartial || '...'}</div>
        <div className="mt-2 text-xs text-gray-500">
          WS: {wsRef.current?.readyState ?? 'n/a'} | last chunk: {lastChunkBytes ?? 'n/a'} bytes
        </div>
        {silenceMs !== null && (
          <div className="mt-2 text-xs text-gray-500">Silence detected: {silenceMs}ms</div>
        )}
      </div>

      {clientError && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          {clientError}
        </div>
      )}

      <div className="bg-white rounded shadow p-4">
        <div className="text-sm font-medium text-gray-700">Confirmed transcript</div>
        <div className="mt-2 space-y-2">
          {finals.length === 0 ? (
            <div className="text-gray-500">No final transcript yet.</div>
          ) : (
            finals.map((t, i) => (
              <div key={i} className="border-b pb-2 last:border-b-0">
                {t}
              </div>
            ))
          )}
        </div>
      </div>
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
