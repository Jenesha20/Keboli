import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { AssessmentResponse } from '../types';
import Pagination from '../../../components/ui/Pagination';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

interface AssessmentListProps {
  assessments: AssessmentResponse[];
  onEdit: (assessment: AssessmentResponse) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

export default function AssessmentList({
  assessments,
  onEdit,
  onToggleStatus,
  onDelete,
}: AssessmentListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentResponse | null>(null);
  const [isEditingSkillGraph, setIsEditingSkillGraph] = useState(false);
  const [editedSkillGraph, setEditedSkillGraph] = useState('');

  const itemsPerPage = 8;
  const totalPages = Math.ceil(assessments.length / itemsPerPage);

  const paginatedItems = assessments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenDetails = (assessment: AssessmentResponse) => {
    setSelectedAssessment(assessment);
    setEditedSkillGraph(JSON.stringify(assessment.skill_graph, null, 2) || '');
    setIsEditingSkillGraph(false);
  };

  const handleSaveSkillGraph = () => {
    if (!selectedAssessment) return;
    try {
      const parsedGraph = JSON.parse(editedSkillGraph);
      onEdit({ ...selectedAssessment, skill_graph: parsedGraph });
      setSelectedAssessment({ ...selectedAssessment, skill_graph: parsedGraph });
      setIsEditingSkillGraph(false);
    } catch (e) {
      alert('Invalid JSON format for Skill Graph');
    }
  };

  if (assessments.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-24 text-center shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
          <span className="material-symbols-outlined text-slate-300 text-4xl">folder_off</span>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No assessments found</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">Try adjusting your filters or create a new assessment to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 flex flex-col">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedItems.map((assessment) => (
          <div
            key={assessment.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 group flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                {assessment.title}
              </h3>
              <span className={`flex-shrink-0 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${assessment.difficulty_level === 'hard' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                assessment.difficulty_level === 'medium' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                  'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                {assessment.difficulty_level}
              </span>
            </div>

            <p className="text-sm font-medium text-slate-500 line-clamp-3 mb-6 flex-grow leading-relaxed">
              {assessment.job_description}
            </p>

            <div className="flex items-center gap-4 mb-6 py-4 border-y border-slate-50">
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900">{assessment.duration_minutes}m</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Duration</span>
              </div>
              <div className="w-px h-6 bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900">{assessment.passing_score}%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pass Score</span>
              </div>
              <div className="w-px h-6 bg-slate-100 ml-auto" />
              <div className="flex flex-col items-end">
                <button
                  onClick={() => onToggleStatus(assessment.id, !assessment.is_active)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${assessment.is_active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' : 'bg-slate-100 text-slate-400'
                    }`}
                >
                  <span className={`w-1 h-1 rounded-full ${assessment.is_active ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
                  {assessment.is_active ? 'Active' : 'Draft'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenDetails(assessment)}
                  className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                  title="View Details"
                >
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </button>
                <button
                  onClick={() => onEdit(assessment)}
                  className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="Edit Assessment"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                  onClick={() => onDelete(assessment.id)}
                  className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="Delete/Deactivate"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>

              <Link
                to={`/candidates?assessment=${encodeURIComponent(assessment.title)}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">monitoring</span>
                Performance
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={assessments.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Assessment Details Modal */}
      <Modal
        isOpen={!!selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
        title="Assessment Intelligence Blueprint"
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setSelectedAssessment(null)}>Close</Button>
            <Button variant="primary" onClick={() => { onEdit(selectedAssessment!); setSelectedAssessment(null); }}>Full Edit</Button>
          </div>
        }
      >
        {selectedAssessment && (
          <div className="space-y-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                <p className="text-lg font-black text-slate-900">{selectedAssessment.duration_minutes}m</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pass Score</p>
                <p className="text-lg font-black text-slate-900">{selectedAssessment.passing_score}%</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attempts</p>
                <p className="text-lg font-black text-slate-900">{selectedAssessment.max_attempts}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Complexity</p>
                <Badge variant={selectedAssessment.difficulty_level === 'hard' ? 'error' : selectedAssessment.difficulty_level === 'medium' ? 'active' : 'success'} className="mt-1">
                  {selectedAssessment.difficulty_level}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Job Description Intelligence</h4>
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
                {selectedAssessment.job_description}
              </div>
            </div>

            {selectedAssessment.skill_graph && (
              <div>
                <div className="flex items-center justify-between mb-3 ml-1">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skill Evolution Graph</h4>
                  <button
                    onClick={() => setIsEditingSkillGraph(!isEditingSkillGraph)}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    {isEditingSkillGraph ? 'Cancel Edit' : 'Edit Graph'}
                  </button>
                </div>

                {isEditingSkillGraph ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <textarea
                      className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-6 rounded-2xl border border-slate-800 min-h-[200px] outline-none focus:ring-4 focus:ring-primary/10"
                      value={editedSkillGraph}
                      onChange={(e) => setEditedSkillGraph(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button variant="primary" size="sm" onClick={handleSaveSkillGraph}>Save Graph Changes</Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 overflow-x-auto">
                    <pre className="text-emerald-400 font-mono text-xs">
                      {JSON.stringify(selectedAssessment.skill_graph, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
