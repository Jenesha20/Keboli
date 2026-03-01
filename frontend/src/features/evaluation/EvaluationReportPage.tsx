import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { apiClient } from '../../services/apiClient';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

export default function EvaluationReportPage() {
    const { sessionId } = useParams();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showTranscript, setShowTranscript] = useState(false);
    const [showSummary, setShowSummary] = useState(true);

    useEffect(() => {
        if (!sessionId) return;
        apiClient.get(`/evaluations/report/${sessionId}`)
            .then((r: { data: any }) => setReport(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [sessionId]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-slate-100 rounded w-48"></div>
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="h-64 bg-slate-100 rounded-xl"></div>
                    <div className="lg:col-span-2 h-64 bg-slate-100 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No report found</h3>
                <p className="text-sm text-slate-500">This evaluation report does not exist or hasn't been generated yet.</p>
            </div>
        );
    }

    const ev = report.evaluation;
    const transcript = report.transcript;

    const radarData = [
        { subject: 'Technical', score: ev.technical_score || 0, fullMark: 100 },
        { subject: 'Communication', score: ev.communication_score || 0, fullMark: 100 },
        { subject: 'Confidence', score: ev.confidence_score || 0, fullMark: 100 },
        { subject: 'Cultural Fit', score: ev.cultural_alignment_score || 0, fullMark: 100 },
    ];

    const recColor = ev.hiring_recommendation === 'STRONG_HIRE' ? 'success' : ev.hiring_recommendation === 'HIRE' ? 'active' : 'error';
    const recLabel = ev.hiring_recommendation?.replace('_', ' ') || 'Pending';

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">Evaluation Report</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Session {sessionId?.slice(0, 8)}…</p>
                </div>
                <Button variant="outline"
                    icon={<span className="material-symbols-outlined text-[18px]">download</span>}
                >
                    Download PDF
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="text-center">
                    <div className="py-4">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Overall Score</p>
                        <div className="relative inline-flex items-center justify-center w-32 h-32 mx-auto">
                            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8"
                                    strokeDasharray={`${(ev.total_score || 0) * 3.27} 327`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 text-primary"
                                />
                            </svg>
                            <span className="absolute text-3xl font-black text-slate-900">{ev.total_score ?? '—'}</span>
                        </div>
                        <div className="mt-8">
                            <Badge variant={recColor as any}>{recLabel}</Badge>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 mt-6 space-y-4">
                        {[
                            { label: 'Technical', score: ev.technical_score },
                            { label: 'Communication', score: ev.communication_score },
                            { label: 'Confidence', score: ev.confidence_score },
                            { label: 'Cultural Fit', score: ev.cultural_alignment_score },
                        ].map(s => (
                            <div key={s.label} className="flex items-center justify-between text-sm">
                                <span className="font-bold text-slate-500">{s.label}</span>
                                <span className="font-black text-slate-900">{s.score ?? '—'}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Competency Mapping</CardTitle></CardHeader>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#f1f5f9" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Score" dataKey="score" stroke="#197fe6" fill="#197fe6" fillOpacity={0.15} strokeWidth={3} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="w-full flex items-center justify-between cursor-pointer" onClick={() => setShowSummary(!showSummary)}>
                    <CardTitle>AI Analysis Summary</CardTitle>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${showSummary ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
                {showSummary && (
                    <div className="mt-6 text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-6 rounded-xl border border-slate-100">
                        {ev.ai_summary || 'Analysis engine is still processing this session.'}
                    </div>
                )}
            </Card>

            <Card>
                <div className="w-full flex items-center justify-between cursor-pointer" onClick={() => setShowTranscript(!showTranscript)}>
                    <CardTitle>Session Transcript</CardTitle>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${showTranscript ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
                {showTranscript && transcript?.full_transcript && (
                    <div className="mt-6 max-h-96 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {transcript.full_transcript.map((turn: any, i: number) => (
                            <div key={i} className={`flex ${turn.role === 'interviewer' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm shadow-sm ${turn.role === 'interviewer'
                                    ? 'bg-slate-50 text-slate-900 border border-slate-100 rounded-tl-none'
                                    : 'bg-primary text-white rounded-tr-none'
                                    }`}>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${turn.role === 'interviewer' ? 'text-primary' : 'text-white/70'}`}>
                                        {turn.role}
                                    </p>
                                    <p className="font-medium leading-relaxed">{turn.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {showTranscript && !transcript?.full_transcript?.length && (
                    <p className="mt-6 text-sm font-bold text-slate-400 italic text-center py-4 uppercase tracking-widest">Transcript not available</p>
                )}
            </Card>
        </div>
    );
}
