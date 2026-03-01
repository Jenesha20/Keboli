import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
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

    const [addForm, setAddForm] = useState({ name: '', email: '', resume_url: '' });
    const [inviteForm, setInviteForm] = useState({ candidate_id: '', assessment_id: '' });
    const fileRef = useRef<HTMLInputElement>(null);

    const location = useLocation();

    // Initial Data Fetch
    useEffect(() => {
        dispatch(fetchCandidates());
        dispatch(fetchInvitations());
        dispatch(fetchAssessments());
    }, [dispatch]);

    // Handle URL Search Params for Assessment Filter
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const assessmentToken = params.get('assessment');
        if (assessmentToken) {
            setAssessmentFilter(assessmentToken);
        }
    }, [location.search]);

    // Map candidate objects to their most recent invitation details
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
                latest_assessment_title: linkedAssessment?.title,
                score: null // Future: link to real evaluation score if desired
            };
        });
    }, [candidates, invitations, assessments]);

    // Apply Client-Side Filtering
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

    // Handlers
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

    // UI Helpers
    const getStatusStyle = (status?: string) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
            case 'CLICKED': return 'bg-blue-100 text-blue-700';
            case 'SENT': return 'bg-indigo-100 text-indigo-700';
            case 'EXPIRED': return 'bg-rose-100 text-rose-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusDotColor = (status?: string) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED': return 'bg-emerald-500';
            case 'CLICKED': return 'bg-blue-500';
            case 'SENT': return 'bg-indigo-500';
            case 'EXPIRED': return 'bg-rose-500';
            default: return 'bg-slate-400';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white min-h-screen">
            {/* Top Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Candidate Management</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Manage and track your intelligence-led recruitment pipeline.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        Single Add
                    </button>
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                        Bulk Upload
                    </button>
                    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />

                    <button
                        onClick={() => {
                            setInviteForm({ candidate_id: '', assessment_id: '' });
                            setShowInviteModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[20px]">send</span>
                        Send Invitation
                    </button>
                </div>
            </div>

            {/* Filter Row */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div className="relative flex-1 min-w-[300px]">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold material-symbols-outlined text-[20px]">search</span>
                    <input
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium"
                        placeholder="Search candidates by name, email..."
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <select
                        className="bg-white border border-slate-200 text-sm font-bold rounded-xl py-2.5 pl-4 pr-10 outline-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Not Invited">Pending Invite</option>
                        <option value="SENT">Sent</option>
                        <option value="CLICKED">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="EXPIRED">Expired</option>
                    </select>

                    <select
                        className="bg-white border border-slate-200 text-sm font-bold rounded-xl py-2.5 pl-4 pr-10 outline-none cursor-pointer w-48"
                        value={assessmentFilter}
                        onChange={(e) => setAssessmentFilter(e.target.value)}
                    >
                        <option value="All">All Programs</option>
                        {assessments.map(a => <option key={a.id} value={a.title}>{a.title}</option>)}
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate Identity</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Benchmark</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Flow Status</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading && candidates.length === 0 ? (
                            <tr><td colSpan={5} className="py-24 text-center text-slate-400 uppercase tracking-widest text-xs">Syncing Intelligence...</td></tr>
                        ) : paginatedItems.length === 0 ? (
                            <tr><td colSpan={5} className="py-24 text-center font-bold text-slate-500">No candidates found matching criteria.</td></tr>
                        ) : (
                            paginatedItems.map(c => {
                                const initials = c.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                                return (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-sm border border-primary/10 transition-all">
                                                    {initials}
                                                </div>
                                                <span className="font-bold text-slate-900">{c.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-slate-500 font-medium text-xs">{c.email}</td>
                                        <td className="px-8 py-5 text-center">
                                            {c.latest_status === 'COMPLETED' && c.latest_session_id ? (
                                                <Link to={`/evaluation/${c.latest_session_id}`} className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black tracking-widest uppercase hover:bg-emerald-200 transition-colors">
                                                    View Performance
                                                </Link>
                                            ) : (
                                                <span className="text-slate-300 font-black">—</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            {c.latest_status ? (
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent ${getStatusStyle(c.latest_status)}`}>
                                                    <span className={`size-1.5 rounded-full ${getStatusDotColor(c.latest_status)}`}></span>
                                                    {c.latest_status}
                                                </span>
                                            ) : (
                                                <Badge variant="secondary" className="text-[10px]">Not Invited</Badge>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setSelectedCandidate(c)} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-xl" title="Track Progress">
                                                    <span className="material-symbols-outlined text-[20px]">hub</span>
                                                </button>
                                                {!c.latest_status && (
                                                    <button onClick={() => { setInviteForm({ candidate_id: c.id, assessment_id: '' }); setShowInviteModal(true); }} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl" title="Send Invite">
                                                        <span className="material-symbols-outlined text-[20px]">send</span>
                                                    </button>
                                                )}
                                                {c.latest_status === InvitationStatus.SENT && c.latest_invitation_id && (
                                                    <button onClick={() => handleRevoke(c.latest_invitation_id!)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl" title="Revoke Link">
                                                        <span className="material-symbols-outlined text-[20px]">block</span>
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl" title="Delete Profile">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
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

            {/* Modals */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register Profile"
                footer={<Button variant="primary" onClick={handleAdd}>Save Profile</Button>}
            >
                <div className="space-y-4 py-4">
                    <Input label="Name" placeholder="John Doe" value={addForm.name} onChange={(e: any) => setAddForm(p => ({ ...p, name: e.target.value }))} />
                    <Input label="Email" type="email" placeholder="john@example.com" value={addForm.email} onChange={(e: any) => setAddForm(p => ({ ...p, email: e.target.value }))} />
                </div>
            </Modal>

            <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Issue Screening Invitation"
                footer={<Button variant="primary" onClick={handleSendInvite} disabled={!inviteForm.candidate_id || !inviteForm.assessment_id}>Send invitation</Button>}
            >
                <div className="space-y-6 pt-2 pb-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Candidate Selection</label>
                        <select className="w-full bg-slate-50 border border-slate-200 text-sm font-bold rounded-xl p-3 outline-none"
                            value={inviteForm.candidate_id} onChange={(e) => setInviteForm(p => ({ ...p, candidate_id: e.target.value }))}>
                            <option value="">Select candidate...</option>
                            {candidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Assessment Module</label>
                        <select className="w-full bg-slate-50 border border-slate-200 text-sm font-bold rounded-xl p-3 outline-none"
                            value={inviteForm.assessment_id} onChange={(e) => setInviteForm(p => ({ ...p, assessment_id: e.target.value }))}>
                            <option value="">Select program...</option>
                            {assessments.filter(a => a.is_active).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                        </select>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!selectedCandidate} onClose={() => setSelectedCandidate(null)} title={`${selectedCandidate?.name}'s Progress`} size="lg">
                <div className="py-6 space-y-6">
                    <div className="space-y-4 relative ml-4">
                        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100" />
                        {selectedCandidate?.all_invitations?.map((inv: any) => (
                            <div key={inv.id} className="relative pl-8">
                                <div className={`absolute left-0 top-1.5 size-4 rounded-full border-2 border-white ring-4 ring-slate-50 ${getStatusDotColor(inv.status)}`} />
                                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs font-black text-slate-900 uppercase">Assessment {inv.status}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{new Date(inv.sent_at).toLocaleString()}</span>
                                    </div>
                                    <div className="text-sm font-bold text-slate-600">
                                        {assessments.find(a => a.id === inv.assessment_id)?.title}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
