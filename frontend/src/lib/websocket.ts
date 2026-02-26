export type WSMessage =
  | { type: 'partial'; text: string }
  | { type: 'final'; text: string; confidence?: number | null }
  | { type: 'SILENCE_DETECTED'; silence_ms: number }
  | { type: 'heartbeat'; ts: number }
  | { type: 'tts_start' }
  | { type: 'INTERRUPT' }
  | { type: 'tts_end' };

export type WSHandlers = {
  onJsonMessage?: (msg: WSMessage) => void;
  onBinaryMessage?: (data: ArrayBuffer) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (e: Event) => void;
};

export function createInterviewWebSocket(url: string, handlers: WSHandlers) {
  const ws = new WebSocket(url);
  ws.binaryType = 'arraybuffer';

  ws.onopen = () => handlers.onOpen?.();
  ws.onclose = () => handlers.onClose?.();
  ws.onerror = (e) => handlers.onError?.(e);

  ws.onmessage = (event) => {
    if (typeof event.data === 'string') {
      try {
        handlers.onJsonMessage?.(JSON.parse(event.data));
      } catch {
        // ignore
      }
      return;
    }

    if (event.data instanceof ArrayBuffer) {
      handlers.onBinaryMessage?.(event.data);
      return;
    }

    if (event.data instanceof Blob) {
      event.data.arrayBuffer().then((buf: ArrayBuffer) => handlers.onBinaryMessage?.(buf));
    }
  };

  return ws;
}
