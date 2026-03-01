import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AssessmentResponse, AssessmentCreate, AssessmentUpdate } from '../types';
import { assessmentService } from '../services/assessmentService';

interface AssessmentState {
  assessments: AssessmentResponse[];
  loading: boolean;
  error: string | null;
  currentAssessment: AssessmentResponse | null;
}

const initialState: AssessmentState = {
  assessments: [],
  loading: false,
  error: null,
  currentAssessment: null,
};

export const fetchAssessments = createAsyncThunk(
  'assessment/fetchAssessments',
  async (_, { rejectWithValue }) => {
    try {
      return await assessmentService.getOrgAssessments();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch assessments');
    }
  }
);

export const createAssessment = createAsyncThunk(
  'assessment/createAssessment',
  async (data: AssessmentCreate, { rejectWithValue }) => {
    try {
      return await assessmentService.createAssessment(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create assessment');
    }
  }
);

export const updateAssessment = createAsyncThunk(
  'assessment/updateAssessment',
  async ({ id, data }: { id: string; data: AssessmentUpdate }, { rejectWithValue }) => {
    try {
      return await assessmentService.updateAssessment(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update assessment');
    }
  }
);

export const toggleAssessmentStatus = createAsyncThunk(
  'assessment/toggleStatus',
  async ({ id, isActive }: { id: string; isActive: boolean }, { rejectWithValue }) => {
    try {
      return await assessmentService.toggleAssessmentStatus(id, isActive);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to toggle status');
    }
  }
);

export const deleteAssessment = createAsyncThunk(
  'assessment/deleteAssessment',
  async (id: string, { rejectWithValue }) => {
    try {
      return await assessmentService.deleteAssessment(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete assessment');
    }
  }
);

const assessmentSlice = createSlice({
  name: 'assessment',
  initialState,
  reducers: {
    setCurrentAssessment: (state, action: PayloadAction<AssessmentResponse | null>) => {
      state.currentAssessment = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Assessments
      .addCase(fetchAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Assessment
      .addCase(createAssessment.fulfilled, (state, action) => {
        state.assessments.unshift(action.payload);
      })
      // Update Assessment
      .addCase(updateAssessment.fulfilled, (state, action) => {
        const index = state.assessments.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.assessments[index] = action.payload;
        }
        if (state.currentAssessment?.id === action.payload.id) {
          state.currentAssessment = action.payload;
        }
      })
      // Toggle Status
      .addCase(toggleAssessmentStatus.fulfilled, (state, action) => {
        const index = state.assessments.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.assessments[index] = action.payload;
        }
      })
      // Delete Assessment (Soft Delete)
      .addCase(deleteAssessment.fulfilled, (state, action) => {
        const index = state.assessments.findIndex((a) => a.id === (action.payload as AssessmentResponse).id);
        if (index !== -1) {
          state.assessments[index] = action.payload as AssessmentResponse;
        }
      });
  },
});

export const { setCurrentAssessment, clearError } = assessmentSlice.actions;
export default assessmentSlice.reducer;
