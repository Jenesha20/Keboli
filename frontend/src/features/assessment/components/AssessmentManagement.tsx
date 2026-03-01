import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAssessments,
  createAssessment,
  updateAssessment,
  toggleAssessmentStatus,
  deleteAssessment,
  setCurrentAssessment
} from '../slices/assessmentSlice';
import type { AppDispatch, RootState } from '../../../app/store';
import AssessmentList from './AssessmentList';
import AssessmentForm from './AssessmentForm';
import type { AssessmentCreate, AssessmentResponse } from '../types';
import { assessmentService } from '../services/assessmentService';

const AssessmentManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { assessments, loading, error, currentAssessment } = useSelector(
    (state: RootState) => state.assessment
  );
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    dispatch(fetchAssessments());
  }, [dispatch]);

  const filteredAssessments = useMemo(() => {
    let result = [...assessments];

    if (searchTerm) {
      result = result.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.job_description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      const active = statusFilter === 'active';
      result = result.filter(a => a.is_active === active);
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'score') return b.passing_score - a.passing_score;
      return 0;
    });

    return result;
  }, [assessments, searchTerm, statusFilter, sortBy]);

  const handleCreate = async (data: AssessmentCreate, extra?: { file?: File | null; raw_text?: string | null }) => {
    try {
      if (extra?.file) {
        await assessmentService.createAssessmentWithFile({
          title: data.title,
          duration_minutes: data.duration_minutes,
          passing_score: data.passing_score,
          difficulty_level: String(data.difficulty_level),
          max_attempts: data.max_attempts,
          is_active: data.is_active,
          file: extra.file,
          raw_text: null,
        });
        await dispatch(fetchAssessments()).unwrap();
      } else {
        await dispatch(createAssessment(data)).unwrap();
      }
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create assessment:', err);
    }
  };

  const handleUpdate = async (data: AssessmentCreate) => {
    if (currentAssessment) {
      try {
        await dispatch(updateAssessment({ id: currentAssessment.id, data })).unwrap();
        setShowForm(false);
        dispatch(setCurrentAssessment(null));
      } catch (err) {
        console.error('Failed to update assessment:', err);
      }
    }
  };

  const handleToggleStatus = (id: string, isActive: boolean) => {
    dispatch(toggleAssessmentStatus({ id, isActive }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to mark this assessment as Inactive?')) {
      dispatch(deleteAssessment(id));
    }
  };

  const handleEditClick = (assessment: AssessmentResponse) => {
    dispatch(setCurrentAssessment(assessment));
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    dispatch(setCurrentAssessment(null));
  };

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto py-4">
        <AssessmentForm
          initialData={currentAssessment || undefined}
          onSubmit={currentAssessment ? handleUpdate : handleCreate}
          onCancel={handleCancel}
          isSubmitting={loading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Assessment Management</h1>
          <p className="text-slate-500 font-medium mt-1">Configure and manage your AI-powered candidate screenings.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Create Assessment
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[300px] group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          <input
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium"
            placeholder="Filter by name, tags or description..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
            <select
              className="text-sm font-bold bg-white border border-slate-200 rounded-xl focus:ring-primary focus:border-primary py-2.5 pl-4 pr-10 outline-none cursor-pointer hover:border-slate-300 transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="draft">Inactive / Draft</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort By</label>
            <select
              className="text-sm font-bold bg-white border border-slate-200 rounded-xl focus:ring-primary focus:border-primary py-2.5 pl-4 pr-10 outline-none cursor-pointer hover:border-slate-300 transition-all"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Recently Created</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="score">Pass Score (High-Low)</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-medium flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          {error}
        </div>
      )}

      {/* Content */}
      <div className="relative">
        {loading && assessments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-32 text-center shadow-sm">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Querying recruitment intelligence...</p>
          </div>
        ) : (
          <AssessmentList
            assessments={filteredAssessments}
            onEdit={handleEditClick}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default AssessmentManagement;
