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

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400";
  const labelClass = "block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-10 md:p-14 rounded-[2.5rem] shadow-xl relative overflow-hidden animate-in zoom-in-95 duration-500">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <svg className="w-32 h-32 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
      </div>

      <h2 className="text-4xl font-black mb-10 tracking-tight text-slate-900">
        {initialData ? 'Update' : 'Initialize'} <span className="text-primary">Project</span>
      </h2>

      <div className="space-y-10">
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
          <label className={labelClass}>Job Description Intelligence</label>

          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => { setJdMode('text'); setJdFile(null); }}
              className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${jdMode === 'text' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}
            >
              Raw Text
            </button>
            <button
              type="button"
              onClick={() => setJdMode('file')}
              className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${jdMode === 'file' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}
            >
              Document Upload
            </button>
          </div>

          {jdMode === 'text' ? (
            <textarea
              name="job_description"
              placeholder="Paste the Job Description here. Our AI will analyze it to generate relevant technical questions."
              value={formData.job_description}
              onChange={handleChange}
              required
              rows={6}
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
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-14 text-center group-hover:border-primary/50 transition-all">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-base font-bold text-slate-700">
                  {jdFile ? jdFile.name : 'Drop Assessment Specification'}
                </p>
                <p className="text-xs mt-3 text-slate-400 font-medium tracking-wide">PDF, DOCX, or TXT (Max 5MB)</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label className={labelClass}>Maximum Duration</label>
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
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">Mins</span>
            </div>
          </div>
          <div>
            <label className={labelClass}>Target Pass Score</label>
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
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label className={labelClass}>Evaluation Complexity</label>
            <select
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="easy">Elementary</option>
              <option value="medium">Professional</option>
              <option value="hard">Expert / Master</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Retake Policy</label>
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
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">Attempts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-end gap-5 mt-16 pt-10 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-10 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-sm font-bold uppercase tracking-widest transition-all border border-slate-200"
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-14 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white text-sm font-bold uppercase tracking-widest transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
        >
          {isSubmitting ? 'Syncing...' : initialData ? 'Commit Changes' : 'Deploy Assessment'}
        </button>
      </div>
    </form>
  );
};

export default AssessmentForm;
