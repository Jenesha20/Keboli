export type RecorderControls = {
  start: () => Promise<void>;
  stop: () => void;
  getState: () => RecordingState;
};

export async function createChunkedRecorder(params: {
  chunkMs?: number;
  onChunk: (blob: Blob) => void;
}): Promise<RecorderControls> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000, 
    }
  });
  if (!stream.getAudioTracks().length) {
    throw new Error('No audio tracks available from getUserMedia');
  }

  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : '';

  const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunkMs = params.chunkMs ?? 100;

  mr.onerror = (e) => {
    // eslint-disable-next-line no-console
    console.error('MediaRecorder error', e);
  };

  // eslint-disable-next-line no-console
  console.log('MediaRecorder created', { mimeType: mr.mimeType, chunkMs });

  mr.ondataavailable = (e) => {
    // eslint-disable-next-line no-console
    console.log('MediaRecorder chunk', { size: e.data?.size, type: e.data?.type });
    if (e.data && e.data.size > 0) params.onChunk(e.data);
  };

  const start = async () => {
    if (mr.state !== 'inactive') return;
    mr.start(chunkMs);
  };

  const stop = () => {
    if (mr.state === 'inactive') return;
    mr.stop();
    stream.getTracks().forEach((t) => t.stop());
  };

  return {
    start,
    stop,
    getState: () => mr.state,
  };
}
