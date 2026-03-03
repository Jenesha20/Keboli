import React, { useState } from 'react';
import type { AssessmentCreate, DifficultyLevel } from '../types';

interface AssessmentFormProps {
  initialData?: Partial<AssessmentCreate>;
  onSubmit: (data: AssessmentCreate, extra?: { file?: File | null; raw_text?: string | null }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [jdMode, setJdMode] = useState<'text' | 'file'>('text');
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<AssessmentCreate>({
    title: initialData?.title || '',
    job_description: initialData?.job_description || '',
    duration_minutes: initialData?.duration_minutes || 30,
    passing_score: initialData?.passing_score || 60,
    difficulty_level: (initialData?.difficulty_level || 'medium') as DifficultyLevel,
    max_attempts: initialData?.max_attempts || 1,
    is_active: initialData?.is_active ?? true,
    skill_graph: initialData?.skill_graph,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jdMode === 'file') {
      onSubmit(formData, { file: jdFile, raw_text: null });
    } else {
      onSubmit(formData, { file: null, raw_text: formData.job_description });
    }
  };

  const inputClass = "w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all placeholder:text-slate-400";
  const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 ml-0.5";

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 p-8 md:p-10 rounded-2xl shadow-sm relative overflow-hidden animate-in zoom-in-[0.98] duration-400">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-violet-500" />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-xl">{initialData ? 'edit_note' : 'add_circle'}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {initialData ? 'Update Assessment' : 'Create Assessment'}
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Fill in the details below to configure your assessment</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className={labelClass}>Assessment Title</label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Senior Fullstack Engineer Phase 1"
            value={formData.title}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Job Description</label>

          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => { setJdMode('text'); setJdFile(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${jdMode === 'text' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:border-slate-300'}`}
            >
              Paste Text
            </button>
            <button
              type="button"
              onClick={() => setJdMode('file')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${jdMode === 'file' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:border-slate-300'}`}
            >
              Upload Document
            </button>
          </div>

          {jdMode === 'text' ? (
            <textarea
              name="job_description"
              placeholder="Paste the Job Description here. Our AI will analyze it to generate relevant technical questions."
              value={formData.job_description}
              onChange={handleChange}
              required
              rows={5}
              className={`${inputClass} resize-none`}
            />
          ) : (
            <div className="relative group">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                required={!initialData}
                onChange={(e) => setJdFile(e.target.files?.[0] ?? null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="bg-slate-50/80 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center group-hover:border-primary/40 transition-all">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <span className="material-symbols-outlined text-slate-400 text-2xl">cloud_upload</span>
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  {jdFile ? jdFile.name : 'Drop your file here or click to browse'}
                </p>
                <p className="text-xs mt-2 text-slate-400 font-medium">PDF, DOCX, or TXT (Max 5MB)</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Duration</label>
            <div className="relative">
              <input
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                min="1"
                max="300"
                className={inputClass}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">mins</span>
            </div>
          </div>
          <div>
            <label className={labelClass}>Pass Score</label>
            <div className="relative">
              <input
                type="number"
                name="passing_score"
                value={formData.passing_score}
                onChange={handleChange}
                min="0"
                max="100"
                className={inputClass}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Difficulty Level</label>
            <select
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="easy">Elementary</option>
              <option value="medium">Professional</option>
              <option value="hard">Expert</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Max Attempts</label>
            <div className="relative">
              <input
                type="number"
                name="max_attempts"
                value={formData.max_attempts}
                onChange={handleChange}
                min="1"
                max="5"
                className={inputClass}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">attempts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-end gap-3 mt-10 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-all border border-slate-200 hover:border-slate-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Assessment' : 'Create Assessment'}
        </button>
      </div>
    </form>
  );
};

export default AssessmentForm;
