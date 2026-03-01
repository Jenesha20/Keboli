import api from '../../../lib/axios';

export interface Candidate {
    id: string;
    email: string;
    name: string;
    resume_url?: string;
    created_at: string;
}

export interface CandidateCreate {
    email: string;
    name: string;
}

export const candidateService = {
    getCandidates: async (): Promise<Candidate[]> => {
        const response = await api.get<Candidate[]>('/candidate/org-candidates');
        return response.data;
    },
    createCandidate: async (data: CandidateCreate): Promise<Candidate> => {
        const response = await api.post<Candidate>('/candidate/', data);
        return response.data;
    },
    bulkUpload: async (file: File): Promise<{ created_count: number; errors: string[] }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/candidate/bulk-upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    deleteCandidate: async (id: string): Promise<void> => {
        await api.delete(`/candidate/${id}`);
    }
};
