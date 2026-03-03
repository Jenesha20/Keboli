import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../lib/axios';
import type { Invitation } from '../../candidate/services/invitationService';

const InterviewWelcomePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';

    const [invitation, setInvitation] = useState<Invitation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError("No invitation token found. Please check your link.");
            setLoading(false);
            return;
        }

        const validateToken = async () => {
            try {
                const response = await api.get(`/invitation/validate/${token}`);
                setInvitation(response.data);
            } catch (err: any) {
                setError(err.response?.data?.detail || "Invalid or expired invitation.");
            } finally {
                setLoading(false);
            }
        };

        validateToken();
    }, [token]);

    const handleStart = () => {
        navigate(`/candidate/instructions?token=${token}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-red-100 text-center">
                    <div className="text-red-500 mb-4">
                        <span className="material-symbols-outlined text-5xl">warning</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 px-6 bg-slate-100 text-slate-900 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const candidateName = invitation?.candidate?.name || 'Candidate';
    const assessmentTitle = invitation?.assessment?.title || 'Technical Assessment';
    const duration = invitation?.assessment?.duration_minutes || 45;

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col font-sans bg-slate-50 text-slate-900">
            <div className="layout-container flex h-full grow flex-col">
                {/* Header */}
                <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 px-6 py-4 md:px-10 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-3 text-slate-900">
                        <div className="flex items-center justify-center size-8 bg-blue-600 rounded-lg text-white">
                            <span className="material-symbols-outlined text-xl font-bold">psychology</span>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-tight">AI Interview Pro</h2>
                    </div>
                    <div className="flex flex-1 justify-end gap-4 items-center">
                        <span className="text-sm font-semibold text-slate-600 hidden sm:block">{candidateName}</span>
                        <div
                            className="bg-slate-200 bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-slate-300"
                            style={{ backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName)}&background=197fe6&color=fff")` }}
                        ></div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-[720px] bg-white rounded-2xl shadow-2xl shadow-blue-900/5 border border-slate-200 overflow-hidden">
                        {/* Hero Image */}
                        <div
                            className="w-full h-52 bg-slate-100 bg-center bg-cover relative"
                            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000")' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                        </div>

                        <div className="p-8 md:p-12 -mt-6 relative z-10">
                            {/* Assessment Title */}
                            <div className="mb-10 text-center sm:text-left">
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 mb-4 uppercase tracking-widest border border-blue-100">
                                    Technical Assessment
                                </span>
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                                    {assessmentTitle}
                                </h1>
                            </div>

                            {/* Assessment Details */}
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                                        <div className="flex items-center justify-center size-12 rounded-xl bg-white text-blue-600 shadow-sm border border-blue-50">
                                            <span className="material-symbols-outlined font-bold">schedule</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-blue-600/60 uppercase tracking-widest">Duration</p>
                                            <p className="text-xl font-black text-slate-900">{duration} Minutes</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center justify-center size-12 rounded-xl bg-white text-slate-600 shadow-sm border border-slate-100">
                                            <span className="material-symbols-outlined font-bold">verified_user</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500/60 uppercase tracking-widest">Type</p>
                                            <p className="text-xl font-black text-slate-900">AI Managed</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-slate max-w-none">
                                    <p className="text-slate-600 text-lg leading-relaxed">
                                        Welcome to your AI-powered technical interview. This assessment is designed to evaluate your proficiency in modern web technologies, system design, and problem-solving skills.
                                    </p>

                                    <div className="mt-8 grid grid-cols-1 gap-4">
                                        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                            <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                                <span className="material-symbols-outlined text-xl">videocam</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">Camera & Microphone</p>
                                                <p className="text-slate-500 text-sm">Ensure your devices are connected and you have a quiet spot.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                            <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                                <span className="material-symbols-outlined text-xl">wifi</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">Stable Connection</p>
                                                <p className="text-slate-500 text-sm">A steady internet connection is required for real-time interaction.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="pt-6">
                                    <button
                                        onClick={handleStart}
                                        className="w-full flex items-center justify-center gap-3 py-5 px-8 bg-blue-600 hover:bg-blue-700 text-white text-xl font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] outline-none focus:ring-4 focus:ring-blue-600/30"
                                    >
                                        <span>Start Interview</span>
                                        <span className="material-symbols-outlined font-black">arrow_forward</span>
                                    </button>
                                    <p className="mt-6 text-center text-xs text-slate-400 font-medium">
                                        By clicking start, you agree to our <a className="text-blue-600 font-bold underline underline-offset-4 hover:text-blue-700" href="#">Rules & Regulations</a>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="footer-area px-6 py-10 bg-white border-t border-slate-100">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex flex-wrap items-center justify-center gap-8">
                            <a className="text-slate-400 hover:text-blue-600 text-xs font-bold tracking-widest uppercase transition-colors" href="#">Privacy</a>
                            <a className="text-slate-400 hover:text-blue-600 text-xs font-bold tracking-widest uppercase transition-colors" href="#">Terms</a>
                            <a className="text-slate-400 hover:text-blue-600 text-xs font-bold tracking-widest uppercase transition-colors" href="#">Support</a>
                        </div>
                        <p className="text-slate-300 text-xs font-bold tracking-wider uppercase">© 2024 AI Interview Pro. Platform</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default InterviewWelcomePage;
