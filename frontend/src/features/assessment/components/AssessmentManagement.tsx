import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAssessments, 
  createAssessment, 
  updateAssessment, 
  toggleAssessmentStatus,
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

  useEffect(() => {
    dispatch(fetchAssessments());
  }, [dispatch]);

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

  const handleEditClick = (assessment: AssessmentResponse) => {
    dispatch(setCurrentAssessment(assessment));
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    dispatch(setCurrentAssessment(null));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Assessment Management</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
          >
            Create Assessment
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      {showForm ? (
        <div className="max-w-2xl mx-auto">
          <AssessmentForm
            initialData={currentAssessment || undefined}
            onSubmit={currentAssessment ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            isSubmitting={loading}
          />
        </div>
      ) : (
        <>
          {loading && assessments.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Loading assessments...</div>
          ) : (
            <AssessmentList
              assessments={assessments}
              onEdit={handleEditClick}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AssessmentManagement;
