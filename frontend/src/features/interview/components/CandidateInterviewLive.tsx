import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  useRoomContext,
  VideoTrack,
  useTracks,
  useTranscriptions,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import api from '../../../lib/axios';


// --- Styling ---
const glassmorphism =
  'bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]';

const InterviewStage: React.FC<{ onDisconnect: () => void, sessionId: string | null }> = ({ onDisconnect, sessionId }) => {
  const room = useRoomContext();
  const voiceAssistant = useVoiceAssistant();
  const isAgentSpeaking = voiceAssistant.state === 'speaking';
  const isListening = voiceAssistant.state === 'listening';

  // --- Heartbeat Logic ---
  useEffect(() => {
    if (!sessionId || room.state !== 'connected') return;

    const interval = setInterval(async () => {
      try {
        await api.post(`/livekit/session/heartbeat/${sessionId}`);
      } catch (err) {
        console.error('Heartbeat failed:', err);
      }
    }, 5000); // 5 seconds, matching backend logic

    return () => clearInterval(interval);
  }, [sessionId, room.state]);

  // Get the agent's video track (BeyondPresence avatar)
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { onlySubscribed: true }
  );

  // Find the agent's video track (not the candidate's)
  const agentVideoTrack = tracks.find(
    (t) => t.participant.identity !== room.localParticipant.identity
  ) as any; // Cast as any or specific type to bypass placeholder mismatch

  const segments = useTranscriptions();

  // Get the latest transcription from anyone (agent or candidate)
  // or specifically the local participant if we want to show what the user is saying
  const lastSegment = segments[segments.length - 1];
  const activeTranscript = lastSegment?.text || (isListening ? 'Listening...' : 'Waiting...');

  return (
    <>
      {/* Glassy Header */}
      <header
        className={`fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 p-4 rounded-2xl flex justify-between items-center ${glassmorphism}`}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div
              className={`w-3 h-3 rounded-full ${room.state === 'connected'
                ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]'
                : 'bg-rose-500'
                }`}
            />
            {room.state === 'connected' && (
              <div className="absolute w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            )}
          </div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-60">
            {room.state === 'connected' ? 'Live Assessment' : 'Connecting...'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Agent state badge */}
          <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400 opacity-70">
            {voiceAssistant.state}
          </span>
          <button
            onClick={onDisconnect}
            className="px-6 py-2 rounded-lg bg-rose-500/10 border border-rose-500/50 hover:bg-rose-500 transition-all font-bold text-sm"
          >
            End Session
          </button>
        </div>
      </header>

      {/* Main Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mt-20">
        {/* Interviewer (Agent) Side */}
        <section className="flex flex-col items-center gap-6">
          <div className="relative group">
            {/* Ambient Aura */}
            <div
              className={`absolute -inset-8 rounded-full bg-blue-500/20 blur-3xl transition-opacity duration-1000 ${isAgentSpeaking ? 'opacity-100 animate-pulse' : 'opacity-0'
                }`}
            />

            {/* Avatar Video or Placeholder */}
            <div
              className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full p-1 overflow-hidden transition-all duration-500 ${isAgentSpeaking
                ? 'scale-105 shadow-[0_0_60px_rgba(59,130,246,0.3)]'
                : 'grayscale opacity-60 scale-95'
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-cyan-400 rotate-45" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#020617] bg-slate-900 flex items-center justify-center">
                {agentVideoTrack ? (
                  <VideoTrack
                    trackRef={agentVideoTrack}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-1/2 h-1/2 text-blue-400 opacity-80"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M12 8V4m0 0H8m4 0h4m-9 4h10c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="9" cy="13" r="1" fill="currentColor" />
                    <circle cx="15" cy="13" r="1" fill="currentColor" />
                  </svg>
                )}
              </div>
            </div>

            {/* Speaking Indicator */}
            <div
              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-500 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isAgentSpeaking ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
            >
              Interviewer
            </div>
          </div>

          {/* Agent Audio Visualizer */}
          <div
            className={`w-full max-w-md p-6 rounded-2xl min-h-[140px] transition-all duration-500 ${glassmorphism} ${isAgentSpeaking ? 'border-blue-400/30' : 'opacity-40'
              }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400">
                Response Console
              </span>
            </div>
            <BarVisualizer
              state={voiceAssistant.state}
              barCount={7}
              trackRef={voiceAssistant.audioTrack}
              className="h-16"
            />
          </div>
        </section>

        {/* Candidate Side */}
        <section className="flex flex-col items-center gap-6">
          <div className="relative">
            <div
              className={`absolute -inset-8 rounded-full bg-indigo-500/20 blur-3xl transition-opacity duration-1000 ${isListening ? 'opacity-100 animate-pulse' : 'opacity-0'
                }`}
            />

            <div
              className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full p-1 overflow-hidden transition-all duration-500 ${isListening
                ? 'scale-105 shadow-[0_0_60px_rgba(99,102,241,0.3)]'
                : 'grayscale opacity-60 scale-95'
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-400 rotate-45" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#020617] bg-slate-900 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-1/2 h-1/2 text-indigo-400 opacity-80"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div
              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-500 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isListening ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
            >
              Candidate
            </div>
          </div>

          <div
            className={`w-full max-w-md p-6 rounded-2xl min-h-[140px] transition-all duration-500 ${glassmorphism} ${isListening ? 'border-indigo-400/30' : 'opacity-40'
              }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">
                Transcript Feed
              </span>
            </div>
            <p className="text-lg font-medium leading-relaxed text-slate-200">
              {activeTranscript}
            </p>
          </div>
        </section>
      </div>

      {/* Renders all remote audio — required for hearing the agent */}
      <RoomAudioRenderer />
    </>
  );
};

// ---------------------------------------------------------
// Outer component — handles token fetching and LiveKitRoom
// ---------------------------------------------------------
const CandidateInterviewLive: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (!token) {
      setClientError('No invitation token found in URL.');
      return;
    }
    setIsValidating(true);
    setClientError(null);

    try {
      // Call our backend to validate & get a LiveKit token
      const response = await api.post(`/livekit/token`, null, {
        params: { invitation_token: token },
      });
      setLivekitToken(response.data.token);
      setLivekitUrl(response.data.url);
      setSessionId(response.data.session_id);
      setIsConnected(true);
    } catch (err: any) {
      setClientError(err.response?.data?.detail || 'Failed to start session.');
    } finally {
      setIsValidating(false);
    }
  }, [token]);

  const disconnect = useCallback(async () => {
    if (sessionId) {
      try {
        await api.post(`/livekit/session/${sessionId}/complete`, null, {
          params: { auto_evaluate: false }
        });
      } catch (err) {
        console.error('Failed to complete session on disconnect:', err);
      }
    }
    setLivekitToken(null);
    setLivekitUrl('');
    setSessionId(null);
    setIsConnected(false);
  }, [sessionId]);

  // --- Not yet connected: show the start screen ---
  if (!isConnected || !livekitToken) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 flex flex-col items-center justify-center font-sans">
        {/* Dynamic Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
        </div>

        <header
          className={`fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 p-4 rounded-2xl flex justify-between items-center ${glassmorphism}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-60">
              Service Disconnected
            </span>
          </div>

          <button
            onClick={connect}
            disabled={isValidating || !token}
            className={`px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all font-bold text-sm ${isValidating || !token ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {isValidating ? 'Connecting...' : 'Start Session'}
          </button>
        </header>

        {clientError && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-200 text-[10px] uppercase font-bold tracking-tighter">
            System Warning: {clientError}
          </div>
        )}
      </div>
    );
  }

  // --- Connected: render the LiveKit room ---
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 flex flex-col items-center justify-center font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <LiveKitRoom
        serverUrl={livekitUrl}
        token={livekitToken}
        connect={true}
        audio={true}
        video={false}
        onDisconnected={disconnect}
        className="w-full flex flex-col items-center"
      >
        <InterviewStage onDisconnect={disconnect} sessionId={sessionId} />
      </LiveKitRoom>
    </div>
  );
};

export default CandidateInterviewLive;
