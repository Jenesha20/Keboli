import api from '../../../lib/axios';
import type { AssessmentCreate, AssessmentResponse, AssessmentUpdate } from '../types';

export const assessmentService = {
  getOrgAssessments: async (): Promise<AssessmentResponse[]> => {
    const response = await api.get<AssessmentResponse[]>('/assessment/org-assessments');
    return response.data;
  },

  createAssessment: async (data: AssessmentCreate): Promise<AssessmentResponse> => {
    const response = await api.post<AssessmentResponse>('/assessment/', data);
    return response.data;
  },

  createAssessmentWithFile: async (params: {
    title: string;
    duration_minutes: number;
    passing_score: number;
    difficulty_level: string;
    max_attempts: number;
    is_active: boolean;
    file?: File | null;
    raw_text?: string | null;
  }): Promise<AssessmentResponse> => {
    const form = new FormData();
    form.append('title', params.title);
    form.append('duration_minutes', String(params.duration_minutes));
    form.append('passing_score', String(params.passing_score));
    form.append('difficulty_level', params.difficulty_level);
    form.append('max_attempts', String(params.max_attempts));
    form.append('is_active', String(params.is_active));

    if (params.file) {
      form.append('file', params.file);
    } else if (params.raw_text) {
      form.append('raw_text', params.raw_text);
    }

    const response = await api.post<AssessmentResponse>('/assessment/create-with-file', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateAssessment: async (id: string, data: AssessmentUpdate): Promise<AssessmentResponse> => {
    const response = await api.put<AssessmentResponse>(`/assessment/${id}`, data);
    return response.data;
  },

  toggleAssessmentStatus: async (id: string, isActive: boolean): Promise<AssessmentResponse> => {
    const response = await api.patch<AssessmentResponse>(`/assessment/${id}/toggle`, null, {
      params: { is_active: isActive },
    });
    return response.data;
  },

  deleteAssessment: async (id: string): Promise<AssessmentResponse> => {
    const response = await api.delete<AssessmentResponse>(`/assessment/${id}`);
    return response.data;
  },
};
