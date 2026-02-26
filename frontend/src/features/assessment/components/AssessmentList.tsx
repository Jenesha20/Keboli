import React from 'react';
import type { AssessmentResponse } from '../types';

interface AssessmentListProps {
  assessments: AssessmentResponse[];
  onEdit: (assessment: AssessmentResponse) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

const AssessmentList: React.FC<AssessmentListProps> = ({
  assessments,
  onEdit,
  onToggleStatus,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Level
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {assessments.map((assessment) => (
            <tr key={assessment.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{assessment.title}</div>
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {assessment.job_description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${assessment.difficulty_level === 'easy' ? 'bg-green-100 text-green-800' : 
                    assessment.difficulty_level === 'hard' ? 'bg-red-100 text-red-800' : 
                    'bg-blue-100 text-blue-800'}`}>
                  {assessment.difficulty_level}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {assessment.duration_minutes}m
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {assessment.passing_score}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onToggleStatus(assessment.id, !assessment.is_active)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    assessment.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {assessment.is_active ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(assessment)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
          {assessments.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                No assessments found. Create your first one!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssessmentList;
