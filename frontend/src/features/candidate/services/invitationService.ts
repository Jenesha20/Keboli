import api from '../../../lib/axios';
import type { Candidate } from './candidateService';
import type { AssessmentResponse } from '../../assessment/types';

export enum InvitationStatus {
    SENT = "sent",
    CLICKED = "clicked",
    COMPLETED = "completed",
    EXPIRED = "expired"
}

export interface Invitation {
    id: string;
    candidate_id: string;
    assessment_id: string;
    token: string;
    expires_at: string;
    status: InvitationStatus;
    sent_at: string;
    candidate?: Candidate;
    assessment?: AssessmentResponse;
}

export interface InvitationCreate {
    candidate_id: string;
    assessment_id: string;
    expires_in_hours?: number;
}

export const invitationService = {
    getInvitations: async (): Promise<Invitation[]> => {
        const response = await api.get<Invitation[]>('/invitation/org-invitations');
        return response.data;
    },
    createInvitation: async (data: InvitationCreate): Promise<{ invitation_id: string; token: string; expires_at: string; candidate_email: string }> => {
        const response = await api.post('/invitation/', data);
        return response.data;
    },
    revokeInvitation: async (id: string): Promise<void> => {
        await api.patch(`/invitation/${id}/revoke`);
    }
};
