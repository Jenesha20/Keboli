import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { AssessmentResponse } from '../types';

interface AssessmentListProps {
  assessments: AssessmentResponse[];
  onEdit: (assessment: AssessmentResponse) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

export default function AssessmentList({
  assessments,
  onEdit,
  onToggleStatus,
}: AssessmentListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(assessments.length / itemsPerPage);

  const paginatedItems = assessments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Assessment Detail</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Duration</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Target</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Created</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedItems.map((assessment) => (
              <tr key={assessment.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-base leading-tight group-hover:text-primary transition-colors cursor-default">{assessment.title}</span>
                    <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{assessment.difficulty_level} • AI Verified</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <button
                    onClick={() => onToggleStatus(assessment.id, !assessment.is_active)}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border transition-all ${assessment.is_active
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}
                  >
                    {assessment.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                    <span className="material-symbols-outlined text-slate-300 text-lg">timer</span>
                    {assessment.duration_minutes}m
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">grade</span>
                    {assessment.passing_score}%
                  </div>
                </td>
                <td className="px-8 py-6 text-slate-500 font-medium text-xs">
                  {assessment.created_at ? new Date(assessment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/interview?assessmentId=${assessment.id}`}
                      className="px-4 py-2 bg-primary/5 hover:bg-primary text-primary hover:text-white text-xs font-bold rounded-xl transition-all mr-2"
                    >
                      Start Session
                    </Link>
                    <div className="h-8 w-[1px] bg-slate-100 mx-2" />
                    <button
                      onClick={() => onEdit(assessment)}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all" title="Delete">
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-8 py-5 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Showing {Math.min(paginatedItems.length, itemsPerPage)} of {assessments.length} assessments
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 text-slate-400 hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="flex items-center gap-1.5">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 text-xs font-black rounded-lg transition-all ${currentPage === i + 1
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 text-slate-400 hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
