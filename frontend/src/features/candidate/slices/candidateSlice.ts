import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { type Candidate, candidateService, type CandidateCreate } from '../services/candidateService';
import { type Invitation, invitationService, type InvitationCreate } from '../services/invitationService';

interface CandidateState {
    candidates: Candidate[];
    invitations: Invitation[];
    loading: boolean;
    error: string | null;
}

const initialState: CandidateState = {
    candidates: [],
    invitations: [],
    loading: false,
    error: null,
};

export const fetchCandidates = createAsyncThunk(
    'candidate/fetchCandidates',
    async (_, { rejectWithValue }) => {
        try {
            return await candidateService.getCandidates();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to fetch candidates');
        }
    }
);

export const addCandidate = createAsyncThunk(
    'candidate/addCandidate',
    async (data: CandidateCreate, { rejectWithValue }) => {
        try {
            return await candidateService.createCandidate(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to add candidate');
        }
    }
);

export const bulkUploadCandidates = createAsyncThunk(
    'candidate/bulkUpload',
    async (file: File, { rejectWithValue }) => {
        try {
            return await candidateService.bulkUpload(file);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to bulk upload candidates');
        }
    }
);

export const fetchInvitations = createAsyncThunk(
    'candidate/fetchInvitations',
    async (_, { rejectWithValue }) => {
        try {
            return await invitationService.getInvitations();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to fetch invitations');
        }
    }
);

export const createInvitation = createAsyncThunk(
    'candidate/createInvitation',
    async (data: InvitationCreate, { rejectWithValue }) => {
        try {
            return await invitationService.createInvitation(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to create invitation');
        }
    }
);

export const revokeInvitation = createAsyncThunk(
    'candidate/revokeInvitation',
    async (id: string, { rejectWithValue }) => {
        try {
            await invitationService.revokeInvitation(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to revoke invitation');
        }
    }
);

export const deleteCandidate = createAsyncThunk(
    'candidate/deleteCandidate',
    async (id: string, { rejectWithValue }) => {
        try {
            await candidateService.deleteCandidate(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to delete candidate');
        }
    }
);


const candidateSlice = createSlice({
    name: 'candidate',
    initialState,
    reducers: {
        clearCandidateError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCandidates.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCandidates.fulfilled, (state, action) => {
                state.loading = false;
                state.candidates = action.payload;
            })
            .addCase(fetchCandidates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addCandidate.fulfilled, (state, action) => {
                state.candidates.unshift(action.payload);
            })
            .addCase(bulkUploadCandidates.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(bulkUploadCandidates.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(bulkUploadCandidates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchInvitations.fulfilled, (state, action) => {
                state.invitations = action.payload;
            })
            .addCase(revokeInvitation.fulfilled, (state, action) => {
                const invitation = state.invitations.find(i => i.id === action.payload);
                if (invitation) {
                    invitation.status = "expired" as any;
                }
            })
            .addCase(deleteCandidate.fulfilled, (state, action) => {
                state.candidates = state.candidates.filter(c => c.id !== action.payload);
            });

    }
});

export const { clearCandidateError } = candidateSlice.actions;
export default candidateSlice.reducer;
