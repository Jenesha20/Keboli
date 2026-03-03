import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../lib/axios';
import type { Invitation } from '../../candidate/services/invitationService';

const InterviewInstructionsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';

    const [invitation, setInvitation] = useState<Invitation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await api.get(`/invitation/validate/${token}`);
                setInvitation(response.data);
            } catch (err) {
                navigate(`/candidate/welcome?token=${token}`);
            } finally {
                setLoading(false);
            }
        };
        validateToken();
    }, [token, navigate]);

    const handleNext = () => {
        navigate(`/candidate/tech-check?token=${token}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const assessmentTitle = invitation?.assessment?.title || 'Technical Assessment';

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
                                className={`size-12 rounded-full flex items-center justify-center font-black border-4 transition-all duration-500 ${step === 2
                                    ? 'bg-blue-600 border-white shadow-xl shadow-blue-500/30 text-white scale-110'
                                    : step < 2
                                        ? 'bg-emerald-500 border-white text-white'
                                        : 'bg-white border-slate-200 text-slate-300'
                                    }`}
                            >
                                {step < 2 ? <span className="material-symbols-outlined font-black">check</span> : step}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between max-w-md mx-auto mt-4 px-2">
                        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500/70">Welcome</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-blue-600">Instructions</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-300">Tech Check</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-300">Interview</span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
                    <div className="p-8 md:p-14">
                        <header className="mb-12 border-l-8 border-blue-600 pl-8">
                            <h1 className="text-4xl font-black text-slate-900 mb-3">Instructions & Rules</h1>
                            <p className="text-slate-500 text-lg font-medium">Please review the following requirements for <span className="text-blue-600">{assessmentTitle}</span>.</p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <section className="space-y-6">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <span className="material-symbols-outlined font-bold text-xl">gavel</span>
                                    </div>
                                    Mandatory Rules
                                </h2>
                                <div className="space-y-4">
                                    {[
                                        "Position yourself in a quiet, distraction-free environment.",
                                        "Maintain stable lighting on your face for fair evaluation.",
                                        "External assistance or browser-switching is strictly prohibited.",
                                        "Keep your recording devices active for the entire duration.",
                                        "Ensure no other voices are audible in your background."
                                    ].map((rule, i) => (
                                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                                            <span className="font-black text-blue-600 text-lg">0{i + 1}</span>
                                            <p className="text-slate-600 text-sm font-semibold leading-relaxed">{rule}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <span className="material-symbols-outlined font-bold text-xl">explore</span>
                                    </div>
                                    Next Steps
                                </h2>
                                <div className="space-y-4">
                                    <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-5">
                                            <span className="material-symbols-outlined text-6xl">settings</span>
                                        </div>
                                        <p className="text-sm font-black text-blue-900 mb-2 uppercase tracking-widest">Step 01: Tech Check</p>
                                        <p className="text-xs text-blue-700/80 font-bold leading-relaxed">We'll calibrate your camera, mic, and bandwidth to ensure a smooth streaming experience.</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                        <p className="text-sm font-black text-slate-400 mb-2 uppercase tracking-widest">Step 02: AI Interview</p>
                                        <p className="text-xs text-slate-500 font-bold leading-relaxed">You will enter the live room to interact with our adaptive AI interviewer.</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                        <p className="text-sm font-black text-slate-400 mb-2 uppercase tracking-widest">Step 03: Submission</p>
                                        <p className="text-xs text-slate-500 font-bold leading-relaxed">Your performance analytics will be generated instantly upon completion.</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-slate-100">
                            <button
                                onClick={() => navigate(-1)}
                                className="order-2 sm:order-1 flex items-center gap-2 group"
                            >
                                <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600 transition-all">
                                    <span className="material-symbols-outlined font-bold">arrow_back</span>
                                </div>
                                <span className="text-slate-500 font-black tracking-widest uppercase text-xs">Previous Stage</span>
                            </button>
                            <button
                                onClick={handleNext}
                                className="order-1 sm:order-2 w-full sm:w-auto flex items-center justify-center gap-4 py-5 px-12 bg-blue-600 hover:bg-blue-700 text-white text-xl font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
                            >
                                <span>Proceed to Check</span>
                                <span className="material-symbols-outlined font-black">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewInstructionsPage;
