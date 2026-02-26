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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jdMode === 'file') {
      onSubmit(formData, { file: jdFile, raw_text: null });
      return;
    }
    onSubmit(formData, { file: null, raw_text: formData.job_description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {initialData ? 'Edit Assessment' : 'Create New Assessment'}
      </h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Job Description</label>

        <div className="mt-2 flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="jdMode"
              checked={jdMode === 'text'}
              onChange={() => {
                setJdMode('text');
                setJdFile(null);
              }}
            />
            Paste text
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="jdMode"
              checked={jdMode === 'file'}
              onChange={() => setJdMode('file')}
            />
            Upload file (PDF/DOCX/TXT)
          </label>
        </div>

        {jdMode === 'text' ? (
        <textarea
          name="job_description"
          value={formData.job_description}
          onChange={handleChange}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        ) : (
          <div className="mt-2">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              required
              onChange={(e) => setJdFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm"
            />
            <div className="mt-1 text-xs text-gray-500">
              If you upload a file, the backend will extract and store the text.
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
          <input
            type="number"
            name="duration_minutes"
            value={formData.duration_minutes}
            onChange={handleChange}
            min="1"
            max="300"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Passing Score (%)</label>
          <input
            type="number"
            name="passing_score"
            value={formData.passing_score}
            onChange={handleChange}
            min="0"
            max="100"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
          <select
            name="difficulty_level"
            value={formData.difficulty_level}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Attempts</label>
          <input
            type="number"
            name="max_attempts"
            value={formData.max_attempts}
            onChange={handleChange}
            min="1"
            max="5"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default AssessmentForm;
