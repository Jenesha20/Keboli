import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../lib/axios';

const InterviewTechCheckPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';

    const [loading, setLoading] = useState(true);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [micLevel, setMicLevel] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const validateToken = async () => {
            try {
                await api.get(`/invitation/validate/${token}`);
            } catch (err) {
                navigate(`/candidate/welcome?token=${token}`);
            } finally {
                setLoading(false);
            }
        };
        validateToken();

        return () => {
            stopMedia();
        };
    }, [token, navigate]);

    const startMedia = async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true
            });
            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            // Audio analysis
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(mediaStream);
            analyzerRef.current = audioContextRef.current.createAnalyser();
            analyzerRef.current.fftSize = 256;
            source.connect(analyzerRef.current);

            const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
            const updateLevel = () => {
                if (analyzerRef.current) {
                    analyzerRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((src, val) => src + val, 0) / dataArray.length;
                    setMicLevel(average);
                    animationFrameRef.current = requestAnimationFrame(updateLevel);
                }
            };
            updateLevel();

        } catch (err: any) {
            console.error("Media access error:", err);
            setError(err.message || "Could not access camera or microphone. Please ensure permissions are granted.");
        }
    };

    const stopMedia = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };

    const handleNext = () => {
        stopMedia();
        navigate(`/candidate/room?token=${token}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans py-12 px-6 text-slate-900">
            <div className="max-w-4xl mx-auto">
                {/* Progress Stepper */}
                <div className="mb-16">
                    <div className="flex items-center justify-between max-w-md mx-auto relative px-4">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 -z-10"></div>
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className={`size-12 rounded-full flex items-center justify-center font-black border-4 transition-all duration-500 ${step === 3
                                    ? 'bg-blue-600 border-white shadow-xl shadow-blue-500/30 text-white scale-110'
                                    : step < 3
                                        ? 'bg-emerald-500 border-white text-white'
                                        : 'bg-white border-slate-200 text-slate-300'
                                    }`}
                            >
                                {step < 3 ? <span className="material-symbols-outlined font-black">check</span> : step}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between max-w-md mx-auto mt-4 px-2">
                        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500/70">Welcome</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500/70">Instructions</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-blue-600">Tech Check</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-300">Interview</span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
                    <div className="p-8 md:p-14">
                        <header className="mb-12 text-center">
                            <h1 className="text-4xl font-black text-slate-900 mb-3">System Calibration</h1>
                            <p className="text-slate-500 text-lg font-medium">Ensuring your hardware is optimized for the session.</p>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Video Preview */}
                            <div className="space-y-6">
                                <div className="relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]">
                                    {!stream ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-6 p-8 text-center bg-slate-50 border-4 border-dashed border-slate-200 m-2 rounded-[2rem]">
                                            <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-4xl">sensors_off</span>
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 uppercase tracking-widest text-xs mb-2">Sensors Inactive</p>
                                                <p className="text-xs font-bold leading-relaxed">Please grant camera and microphone access to proceed.</p>
                                            </div>
                                            <button
                                                onClick={startMedia}
                                                className="py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                                            >
                                                Initialize Devices
                                            </button>
                                        </div>
                                    ) : (
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    {stream && (
                                        <div className="absolute top-6 left-6 flex gap-2">
                                            <div className="px-4 py-1.5 bg-blue-600/90 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                <div className="size-1.5 rounded-full bg-white animate-pulse"></div>
                                                Optic Feed Live
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="p-5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-4">
                                        <div className="size-10 rounded-full bg-white flex items-center justify-center text-red-500 shadow-sm shrink-0">
                                            <span className="material-symbols-outlined font-bold">report</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-red-700 uppercase tracking-tight mb-1">Authorization Failed</p>
                                            <p className="text-xs text-red-600 font-bold leading-relaxed">{error}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status Check List */}
                            <div className="flex flex-col justify-center space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Hardware Diagnostics</h3>

                                    {/* Camera Check */}
                                    <div className={`p-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${stream ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`size-12 rounded-xl flex items-center justify-center transition-colors ${stream ? 'bg-white text-emerald-500 shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                                                <span className="material-symbols-outlined font-bold">videocam</span>
                                            </div>
                                            <span className={`font-black text-lg ${stream ? 'text-emerald-700' : 'text-slate-400'}`}>Imaging System</span>
                                        </div>
                                        {stream ? (
                                            <div className="size-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                <span className="material-symbols-outlined font-black text-sm">check</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Pending</span>
                                        )}
                                    </div>

                                    {/* Mic Check */}
                                    <div className={`p-6 rounded-2xl border-2 transition-all duration-300 space-y-5 ${stream ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`size-12 rounded-xl flex items-center justify-center transition-colors ${stream ? 'bg-white text-emerald-500 shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                                                    <span className="material-symbols-outlined font-bold">mic</span>
                                                </div>
                                                <span className={`font-black text-lg ${stream ? 'text-emerald-700' : 'text-slate-400'}`}>Audio Capture</span>
                                            </div>
                                            {stream && (
                                                <div className="size-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                    <span className="material-symbols-outlined font-black text-sm">check</span>
                                                </div>
                                            )}
                                        </div>
                                        {stream && (
                                            <div className="relative h-3 bg-emerald-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                                                <div
                                                    className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-75 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                    style={{ width: `${Math.min(100, (micLevel / 128) * 100)}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bandwidth Check */}
                                    <div className="p-6 rounded-2xl bg-emerald-50/50 border-2 border-emerald-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-xl bg-white text-emerald-500 flex items-center justify-center shadow-sm">
                                                <span className="material-symbols-outlined font-bold">speed</span>
                                            </div>
                                            <span className="font-black text-lg text-emerald-700">Connectivity</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Stable 5G/Fiber</span>
                                            <div className="size-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                <span className="material-symbols-outlined font-black text-sm">check</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-slate-100">
                            <button
                                onClick={() => navigate(-1)}
                                className="order-2 sm:order-1 flex items-center gap-2 group"
                            >
                                <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600 transition-all">
                                    <span className="material-symbols-outlined font-bold">arrow_back</span>
                                </div>
                                <span className="text-slate-500 font-black tracking-widest uppercase text-xs">Back to Rules</span>
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!stream}
                                className={`order-1 sm:order-2 w-full sm:w-auto flex items-center justify-center gap-4 py-5 px-12 text-white text-xl font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] ${stream
                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                <span>Enter Room</span>
                                <span className="material-symbols-outlined font-black">rocket_launch</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewTechCheckPage;
