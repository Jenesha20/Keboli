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

  const itemsPerPage = 9;
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

  const getDifficultyConfig = (level: string) => {
    switch (level) {
      case 'hard': return { label: 'Expert', color: 'bg-rose-50 text-rose-600 border-rose-200/80' };
      case 'medium': return { label: 'Professional', color: 'bg-amber-50 text-amber-600 border-amber-200/80' };
      default: return { label: 'Elementary', color: 'bg-emerald-50 text-emerald-600 border-emerald-200/80' };
    }
  };

  if (assessments.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-20 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-100">
          <span className="material-symbols-outlined text-slate-300 text-3xl">folder_off</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">No assessments found</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">Try adjusting your filters or create a new assessment to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {paginatedItems.map((assessment) => {
          const difficulty = getDifficultyConfig(assessment.difficulty_level);
          return (
            <div
              key={assessment.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 group flex flex-col"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3 gap-3">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                  {assessment.title}
                </h3>
                <span className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${difficulty.color}`}>
                  {difficulty.label}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-500 line-clamp-2 mb-5 flex-grow leading-relaxed">
                {assessment.job_description}
              </p>

              {/* Stats Row */}
              <div className="flex items-center gap-5 mb-5 py-3.5 border-y border-slate-100">
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-slate-900">{assessment.duration_minutes}m</span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Duration</span>
                </div>
                <div className="w-px h-5 bg-slate-100" />
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-slate-900">{assessment.passing_score}%</span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Pass Score</span>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => onToggleStatus(assessment.id, !assessment.is_active)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${assessment.is_active
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${assessment.is_active ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
                    {assessment.is_active ? 'Active' : 'Draft'}
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenDetails(assessment)}
                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    title="View Details"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                  <button
                    onClick={() => onEdit(assessment)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Edit Assessment"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(assessment.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    title="Delete/Deactivate"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                <Link
                  to={`/candidates?assessment=${encodeURIComponent(assessment.title)}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-all shadow-sm active:scale-[0.97]"
                >
                  <span className="material-symbols-outlined text-[14px]">monitoring</span>
                  Performance
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
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
        title="Assessment Details"
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setSelectedAssessment(null)}>Close</Button>
            <Button variant="primary" onClick={() => { onEdit(selectedAssessment!); setSelectedAssessment(null); }}>Edit Assessment</Button>
          </div>
        }
      >
        {selectedAssessment && (
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Duration', value: `${selectedAssessment.duration_minutes}m` },
                { label: 'Pass Score', value: `${selectedAssessment.passing_score}%` },
                { label: 'Attempts', value: selectedAssessment.max_attempts },
                { label: 'Difficulty', value: selectedAssessment.difficulty_level, isBadge: true },
              ].map((stat) => (
                <div key={stat.label} className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{stat.label}</p>
                  {stat.isBadge ? (
                    <Badge variant={selectedAssessment.difficulty_level === 'hard' ? 'error' : selectedAssessment.difficulty_level === 'medium' ? 'warning' : 'success'} className="mt-0.5">
                      {String(stat.value)}
                    </Badge>
                  ) : (
                    <p className="text-lg font-extrabold text-slate-900">{String(stat.value)}</p>
                  )}
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-0.5">Job Description</h4>
              <div className="bg-slate-50/80 border border-slate-100 p-5 rounded-xl text-sm text-slate-600 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto custom-scrollbar">
                {selectedAssessment.job_description}
              </div>
            </div>

            {selectedAssessment.skill_graph && (
              <div>
                <div className="flex items-center justify-between mb-3 ml-0.5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skill Graph</h4>
                  <button
                    onClick={() => setIsEditingSkillGraph(!isEditingSkillGraph)}
                    className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline"
                  >
                    {isEditingSkillGraph ? 'Cancel' : 'Edit JSON'}
                  </button>
                </div>

                {isEditingSkillGraph ? (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <textarea
                      className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-5 rounded-xl border border-slate-700 min-h-[180px] outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      value={editedSkillGraph}
                      onChange={(e) => setEditedSkillGraph(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button variant="primary" size="sm" onClick={handleSaveSkillGraph}>Save Changes</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                    {(() => {
                      const graph = selectedAssessment.skill_graph as any;
                      const skills = graph?.skills || (Array.isArray(graph) ? graph : []);

                      if (skills.length === 0) {
                        return (
                          <div className="text-center py-6 text-slate-400 text-sm">
                            <span className="material-symbols-outlined text-3xl text-slate-200 block mb-2">schema</span>
                            No skills configured
                          </div>
                        );
                      }

                      const categoryColors: Record<string, string> = {
                        'Technical': 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
                        'Communication': 'bg-cyan-50 text-cyan-600 border-cyan-200/80',
                        'Problem Solving': 'bg-amber-50 text-amber-600 border-amber-200/80',
                        'Leadership': 'bg-violet-50 text-violet-600 border-violet-200/80',
                        'Analytical': 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
                      };
                      const defaultCategoryColor = 'bg-slate-50 text-slate-600 border-slate-200/80';

                      return skills.map((skill: any, idx: number) => {
                        const weightPercent = Math.round((skill.weightage || 0) * 100);
                        const catColor = categoryColors[skill.category] || defaultCategoryColor;

                        return (
                          <div key={idx} className="bg-white border border-slate-200/80 rounded-xl p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2.5">
                                <span className="font-semibold text-sm text-slate-900">{skill.name}</span>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${catColor}`}>
                                  {skill.category}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-slate-700">{weightPercent}%</span>
                            </div>

                            {/* Weight progress bar */}
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2.5">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-500"
                                style={{ width: `${weightPercent}%` }}
                              />
                            </div>

                            {skill.description && (
                              <p className="text-xs text-slate-500 leading-relaxed">{skill.description}</p>
                            )}
                          </div>
                        );
                      });
                    })()}
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
