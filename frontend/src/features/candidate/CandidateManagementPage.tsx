import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCandidates,
    fetchInvitations,
    bulkUploadCandidates,
    addCandidate,
    revokeInvitation,
    deleteCandidate
} from './slices/candidateSlice';
import { fetchAssessments } from '../assessment/slices/assessmentSlice';
import type { AppDispatch, RootState } from '../../app/store';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import { invitationService, InvitationStatus } from './services/invitationService';
import { apiClient } from '../../services/apiClient';

export default function CandidateManagementPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { candidates, invitations, loading } = useSelector((state: RootState) => state.candidate);
    const { assessments } = useSelector((state: RootState) => state.assessment);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [assessmentFilter, setAssessmentFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [showAddModal, setShowAddModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

    // Evaluation modal state
    const [evalModal, setEvalModal] = useState<{ open: boolean; sessionId: string; candidateName: string }>({ open: false, sessionId: '', candidateName: '' });
    const [evalReport, setEvalReport] = useState<any>(null);
    const [evalLoading, setEvalLoading] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);
    const [triggeringEval, setTriggeringEval] = useState(false);

    const [addForm, setAddForm] = useState({ name: '', email: '', resume_url: '' });
    const [inviteForm, setInviteForm] = useState({ candidate_id: '', assessment_id: '' });
    const fileRef = useRef<HTMLInputElement>(null);

    const location = useLocation();

    useEffect(() => {
        dispatch(fetchCandidates());
        dispatch(fetchInvitations());
        dispatch(fetchAssessments());
    }, [dispatch]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const assessmentToken = params.get('assessment');
        if (assessmentToken) {
            setAssessmentFilter(assessmentToken);
        }
    }, [location.search]);

    // Fetch evaluation report when modal opens
    useEffect(() => {
        if (evalModal.open && evalModal.sessionId) {
            setEvalLoading(true);
            setEvalReport(null);
            setShowTranscript(false);
            apiClient.get(`/evaluation/report/${evalModal.sessionId}`)
                .then((r: { data: any }) => setEvalReport(r.data))
                .catch(() => setEvalReport(null))
                .finally(() => setEvalLoading(false));
        }
    }, [evalModal.open, evalModal.sessionId]);

    const openEvalModal = (sessionId: string, candidateName: string) => {
        setEvalModal({ open: true, sessionId, candidateName });
    };

    const handleGenerateReport = async (sessionId: string) => {
        setTriggeringEval(true);
        try {
            await apiClient.post(`/evaluation/trigger/${sessionId}`);
            // Wait a bit then refresh
            setTimeout(() => {
                apiClient.get(`/evaluation/report/${sessionId}`)
                    .then((r: { data: any }) => setEvalReport(r.data))
                    .catch(() => setEvalReport(null))
                    .finally(() => setTriggeringEval(false));
            }, 3000);
        } catch (err) {
            alert("Failed to trigger evaluation agent. Please try again.");
            setTriggeringEval(false);
        }
    };


    const unifiedData = useMemo(() => {
        return candidates.map((c: any) => {
            const candidateInvitations = invitations.filter((inv: any) => inv.candidate_id === c.id);
            candidateInvitations.sort((a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
            const latestInv = candidateInvitations[0];

            const linkedAssessment = latestInv
                ? assessments.find(a => a.id === latestInv.assessment_id)
                : null;

            return {
                ...c,
                all_invitations: candidateInvitations,
                latest_status: latestInv?.status,
                latest_invitation_id: latestInv?.id,
                latest_session_id: (latestInv as any)?.latest_session_id,
                latest_session_status: (latestInv as any)?.latest_session_status,
                latest_assessment_title: linkedAssessment?.title,
                score: (latestInv as any)?.total_score,
                recommendation: (latestInv as any)?.hiring_recommendation
            };
        });
    }, [candidates, invitations, assessments]);

    const filteredData = useMemo(() => {
        let data = unifiedData;

        if (search) {
            const s = search.toLowerCase();
            data = data.filter((c: any) => c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s));
        }

        if (statusFilter !== 'All') {
            data = data.filter((c: any) => {
                if (statusFilter === 'Not Invited') return !c.latest_status;
                return c.latest_status?.toUpperCase() === statusFilter.toUpperCase();
            });
        }

        if (assessmentFilter !== 'All') {
            data = data.filter((c: any) => c.latest_assessment_title === assessmentFilter);
        }

        return data;
    }, [unifiedData, search, statusFilter, assessmentFilter]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedItems = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleAdd = async () => {
        await dispatch(addCandidate(addForm));
        setShowAddModal(false);
        setAddForm({ name: '', email: '', resume_url: '' });
    };

    const handleSendInvite = async () => {
        try {
            await invitationService.createInvitation({
                candidate_id: inviteForm.candidate_id,
                assessment_id: inviteForm.assessment_id
            });
            setShowInviteModal(false);
            setInviteForm({ candidate_id: '', assessment_id: '' });
            dispatch(fetchInvitations());
        } catch (e) {
            console.error("Invite failed", e);
        }
    };

    const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const result = await dispatch(bulkUploadCandidates(file)).unwrap();
            let message = `Successfully imported ${result.created_count} candidates.`;
            if (result.errors && result.errors.length > 0) {
                message += `\n\nErrors encountered:\n- ` + result.errors.join('\n- ');
            }
            alert(message);
            dispatch(fetchCandidates());
        } catch (error: any) {
            console.error("Bulk upload error:", error);
            const errorMsg = typeof error === 'string' ? error : JSON.stringify(error, null, 2);
            alert("Bulk upload failed:\n" + errorMsg);
        } finally {
            if (e.target) e.target.value = '';
        }
    };

    const handleRevoke = async (invitationId: string) => {
        if (window.confirm('Are you sure you want to revoke this invitation? The link will be immediately invalidated.')) {
            await dispatch(revokeInvitation(invitationId)).unwrap();
            dispatch(fetchInvitations());
        }
    };

    const handleDelete = async (candidateId: string) => {
        if (window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
            await dispatch(deleteCandidate(candidateId)).unwrap();
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Invitation link copied!');
    };

    const getStatusConfig = (status?: string) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED': return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200/80' };
            case 'CLICKED': return { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200/80' };
            case 'SENT': return { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', border: 'border-indigo-200/80' };
            case 'EXPIRED': return { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-200/80' };
            default: return { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200/80' };
        }
    };

    // Evaluation modal helper
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-rose-600';
    };

    const getScoreBarColor = (score: number) => {
        if (score >= 80) return 'from-emerald-400 to-emerald-500';
        if (score >= 60) return 'from-amber-400 to-amber-500';
        return 'from-rose-400 to-rose-500';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Candidates</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Manage and track your recruitment pipeline.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Add
                    </button>
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px]">upload_file</span>
                        Bulk Upload
                    </button>
                    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />

                    <button
                        onClick={() => {
                            setInviteForm({ candidate_id: '', assessment_id: '' });
                            setShowInviteModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        Send Invitation
                    </button>
                </div>
            </div>

            {/* Filter Row */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div className="relative flex-1 min-w-[280px] group">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[18px] group-focus-within:text-primary transition-colors">search</span>
                    <input
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/15 focus:border-primary/50 outline-none transition-all placeholder:text-slate-400 font-medium"
                        placeholder="Search by name or email..."
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select
                        className="bg-white border border-slate-200 text-sm font-medium rounded-xl py-2 pl-3 pr-8 outline-none cursor-pointer hover:border-slate-300 transition-all"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Not Invited">Pending</option>
                        <option value="SENT">Sent</option>
                        <option value="CLICKED">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="EXPIRED">Expired</option>
                    </select>

                    <select
                        className="bg-white border border-slate-200 text-sm font-medium rounded-xl py-2 pl-3 pr-8 outline-none cursor-pointer hover:border-slate-300 transition-all w-44"
                        value={assessmentFilter}
                        onChange={(e) => setAssessmentFilter(e.target.value)}
                    >
                        <option value="All">All Assessments</option>
                        {assessments.map(a => <option key={a.id} value={a.title}>{a.title}</option>)}
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Total Score</th>
                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommendation</th>
                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading && candidates.length === 0 ? (
                            <tr><td colSpan={6} className="py-20 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
                                    <span className="text-xs font-medium text-slate-400">Loading candidates...</span>
                                </div>
                            </td></tr>
                        ) : paginatedItems.length === 0 ? (
                            <tr><td colSpan={6} className="py-20 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-200 text-4xl">person_search</span>
                                    <span className="text-sm font-medium text-slate-400">No candidates found matching your criteria.</span>
                                </div>
                            </td></tr>
                        ) : (
                            paginatedItems.map(c => {
                                const initials = c.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                                const statusConfig = getStatusConfig(c.latest_status);
                                return (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-xl bg-gradient-to-br from-primary/10 to-indigo-100 flex items-center justify-center text-primary font-bold text-xs border border-primary/10">
                                                    {initials}
                                                </div>
                                                <span className="font-semibold text-slate-900 text-sm">{c.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium text-xs">{c.email}</td>
                                        <td className="px-6 py-4 text-center">
                                            {c.score !== null ? (
                                                <span className={`text-sm font-extrabold ${getScoreColor(c.score)}`}>{Math.round(c.score)}</span>
                                            ) : (
                                                <span className="text-slate-300 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {c.recommendation ? (
                                                <Badge variant={c.recommendation === 'STRONG_HIRE' ? 'success' : c.recommendation === 'REJECT' ? 'error' : 'active'} className="text-[10px]">
                                                    {c.recommendation.replace(/_/g, ' ')}
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-300 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {c.latest_status ? (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                                    <span className={`size-1.5 rounded-full ${statusConfig.dot}`}></span>
                                                    {c.latest_status}
                                                </span>
                                            ) : (
                                                <Badge variant="secondary" className="text-[10px]">Not Invited</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => {
                                                    setSelectedCandidate(c);
                                                    if (c.latest_session_id) openEvalModal(c.latest_session_id, c.name);
                                                }} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="View Report & History">
                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                </button>

                                                {!c.latest_status && (
                                                    <button onClick={() => { setInviteForm({ candidate_id: c.id, assessment_id: '' }); setShowInviteModal(true); }} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Send Invite">
                                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                                    </button>
                                                )}

                                                {c.latest_status === InvitationStatus.SENT && c.latest_invitation_id && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                const inv = invitations.find(i => i.id === c.latest_invitation_id);
                                                                if (inv) copyToClipboard(`${window.location.origin}/interview?token=${inv.token}`);
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                            title="Copy Link"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">link</span>
                                                        </button>
                                                        <button onClick={() => handleRevoke(c.latest_invitation_id!)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Revoke">
                                                            <span className="material-symbols-outlined text-[18px]">block</span>
                                                        </button>
                                                    </>
                                                )}

                                                <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>

            {/* Add Candidate Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Candidate"
                footer={<Button variant="primary" onClick={handleAdd}>Save Candidate</Button>}
            >
                <div className="space-y-4 py-2">
                    <Input label="Full Name" placeholder="John Doe" value={addForm.name} onChange={(e: any) => setAddForm(p => ({ ...p, name: e.target.value }))} />
                    <Input label="Email Address" type="email" placeholder="john@example.com" value={addForm.email} onChange={(e: any) => setAddForm(p => ({ ...p, email: e.target.value }))} />
                </div>
            </Modal>

            {/* Invite Modal */}
            <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Send Invitation"
                footer={<Button variant="primary" onClick={handleSendInvite} disabled={!inviteForm.candidate_id || !inviteForm.assessment_id}>Send Invitation</Button>}
            >
                <div className="space-y-5 py-2">
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold uppercase text-slate-400 ml-0.5 tracking-wider">Candidate</label>
                        <select className="w-full bg-slate-50/80 border border-slate-200 text-sm font-medium rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50"
                            value={inviteForm.candidate_id} onChange={(e) => setInviteForm(p => ({ ...p, candidate_id: e.target.value }))}>
                            <option value="">Select candidate...</option>
                            {candidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold uppercase text-slate-400 ml-0.5 tracking-wider">Assessment</label>
                        <select className="w-full bg-slate-50/80 border border-slate-200 text-sm font-medium rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50"
                            value={inviteForm.assessment_id} onChange={(e) => setInviteForm(p => ({ ...p, assessment_id: e.target.value }))}>
                            <option value="">Select assessment...</option>
                            {assessments.filter(a => a.is_active).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                        </select>
                    </div>
                </div>
            </Modal>

            {/* Unified Modal: Progress Timeline + Evaluation Report */}
            <Modal
                isOpen={!!selectedCandidate}
                onClose={() => setSelectedCandidate(null)}
                title={`Candidate View — ${selectedCandidate?.name}`}
                size="xl"
            >
                <div className="space-y-8 py-2">
                    {/* Top Row: Info & Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Candidate Summary */}
                        <div className="md:col-span-1 space-y-4">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Candidate Info</h4>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-medium text-slate-400">Name</p>
                                        <p className="text-sm font-bold text-slate-900">{selectedCandidate?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium text-slate-400">Email</p>
                                        <p className="text-xs font-semibold text-slate-600">{selectedCandidate?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* History Timeline */}
                        <div className="md:col-span-2">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Journey Timeline</h4>
                            <div className="space-y-4 relative ml-2">
                                <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-slate-100" />
                                {selectedCandidate?.all_invitations?.map((inv: any) => {
                                    const config = getStatusConfig(inv.status);
                                    return (
                                        <div key={inv.id} className="relative pl-6">
                                            <div className={`absolute left-0 top-1.5 size-2.5 rounded-full border border-white ring-2 ring-slate-50 ${config.dot}`} />
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{inv.status.toUpperCase()}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{assessments.find(a => a.id === inv.assessment_id)?.title}</p>
                                                </div>
                                                <span className="text-[10px] font-medium text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">
                                                    {new Date(inv.sent_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 mx-[-24px]" />

                    {/* Report Section */}
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Evaluation Report</h4>
                        {evalLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <div className="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
                                <span className="text-xs font-medium text-slate-400">Loading evaluation...</span>
                            </div>
                        ) : !evalReport?.evaluation ? (
                            <div className="p-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <div className="inline-flex items-center justify-center size-12 rounded-full bg-slate-100 text-slate-400 mb-4">
                                    <span className="material-symbols-outlined text-2xl">analytics</span>
                                </div>
                                {(() => {
                                    const isCompleted = selectedCandidate?.latest_session_status?.toUpperCase() === 'COMPLETED';
                                    const isAbandoned = selectedCandidate?.latest_session_status?.toUpperCase() === 'ABANDONED';
                                    const isInProgress = selectedCandidate?.latest_session_status?.toUpperCase() === 'IN_PROGRESS';

                                    return (
                                        <>
                                            <p className="text-sm font-bold text-slate-800 mb-1">
                                                {isCompleted ? "Report Pending Generation" : isAbandoned ? "Interview Abandoned" : isInProgress ? "Interview in Progress" : "No Session Yet"}
                                            </p>
                                            <p className="text-xs font-medium text-slate-400 mb-6 max-w-[240px] mx-auto">
                                                {isCompleted
                                                    ? "The interview is finished. You can generate the AI report now."
                                                    : isAbandoned
                                                        ? "The candidate left early. You can still generate a partial report."
                                                        : "The candidate is currently in the interview or hasn't finished yet."
                                                }
                                            </p>

                                            {(isCompleted || isAbandoned) && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleGenerateReport(selectedCandidate.latest_session_id)}
                                                    loading={triggeringEval}
                                                >
                                                    Generate AI Report
                                                </Button>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        ) : (() => {
                            const ev = evalReport.evaluation;
                            const transcript = evalReport.transcript;
                            const recommendation = ev?.hiring_recommendation?.toUpperCase();
                            const recColor = recommendation === 'STRONG_HIRE' ? 'success' : recommendation === 'HIRE' ? 'active' : recommendation === 'REJECT' ? 'error' : 'secondary';
                            const recLabel = ev?.hiring_recommendation?.replace(/_/g, ' ').toUpperCase() || 'Pending';

                            const scoreCategories = [
                                { label: 'Technical', score: ev?.technical_score, icon: 'code' },
                                { label: 'Communication', score: ev?.communication_score, icon: 'forum' },
                                { label: 'Confidence', score: ev?.confidence_score, icon: 'psychology' },
                                { label: 'Cultural Fit', score: ev?.cultural_alignment_score, icon: 'diversity_3' },
                            ];

                            return (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row gap-5">
                                        <div className="flex-shrink-0 bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col items-center justify-center min-w-[170px] shadow-sm">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Overall Score</p>
                                            <div className="relative inline-flex items-center justify-center w-24 h-24">
                                                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 120 120">
                                                    <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                                    <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8"
                                                        strokeDasharray={`${(ev?.total_score || 0) * 3.27} 327`}
                                                        strokeLinecap="round"
                                                        className={`transition-all duration-1000 ${(ev?.total_score || 0) >= 80 ? 'text-emerald-500' : (ev?.total_score || 0) >= 60 ? 'text-amber-500' : 'text-rose-500'}`}
                                                    />
                                                </svg>
                                                <span className={`absolute text-2xl font-extrabold ${getScoreColor(ev?.total_score || 0)}`}>
                                                    {ev?.total_score ? Math.round(ev.total_score) : '—'}
                                                </span>
                                            </div>
                                            <div className="mt-4">
                                                <Badge variant={recColor as any} className="text-[10px]">{recLabel}</Badge>
                                            </div>
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {scoreCategories.map((cat) => {
                                                const s = cat.score ?? 0;
                                                return (
                                                    <div key={cat.label} className="bg-white border border-slate-200/80 rounded-xl p-3.5 hover:shadow-sm transition-shadow">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-primary text-[15px]">{cat.icon}</span>
                                                                <span className="text-xs font-bold text-slate-700">{cat.label}</span>
                                                            </div>
                                                            <span className={`text-xs font-extrabold ${getScoreColor(s)}`}>{cat.score ? Math.round(cat.score) : '—'}</span>
                                                        </div>
                                                        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                                            <div
                                                                className={`h-full bg-gradient-to-r ${getScoreBarColor(s)} rounded-full shadow-sm shadow-primary/10`}
                                                                style={{ width: `${s}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {ev?.ai_summary && (
                                        <div className="bg-slate-50/50 rounded-2xl border border-slate-200/80 p-5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                                                <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">AI Analysis</span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">{ev.ai_summary}</p>
                                        </div>
                                    )}

                                    <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                                        <button
                                            className="w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100"
                                            onClick={() => setShowTranscript(!showTranscript)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-[18px]">chat_bubble_outline</span>
                                                <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Interview Transcript</span>
                                            </div>
                                            <span className={`material-symbols-outlined text-slate-400 transition-transform duration-200 text-[18px] ${showTranscript ? 'rotate-180' : ''}`}>expand_more</span>
                                        </button>
                                        {showTranscript && (
                                            <div className="bg-white p-2">
                                                {transcript?.full_transcript?.length > 0 ? (
                                                    <div className="max-h-72 overflow-y-auto space-y-3 p-3 custom-scrollbar">
                                                        {transcript.full_transcript.map((turn: any, i: number) => {
                                                            const isInterviewer = turn.role?.toLowerCase() === 'interviewer';
                                                            return (
                                                                <div key={i} className={`flex ${isInterviewer ? 'justify-start' : 'justify-end'}`}>
                                                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs shadow-sm ${isInterviewer
                                                                        ? 'bg-slate-50 text-slate-900 border border-slate-100 rounded-tl-none'
                                                                        : 'bg-primary text-white rounded-tr-none'
                                                                        }`}>
                                                                        <p className={`text-[8px] font-bold uppercase tracking-widest mb-1 ${isInterviewer ? 'text-primary' : 'text-white/70'}`}>
                                                                            {isInterviewer ? 'AI Interviewer' : 'Candidate'}
                                                                        </p>
                                                                        <p className="font-semibold leading-relaxed">{turn.text || turn.content}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-400 text-center py-8">Transcript unavailable</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
