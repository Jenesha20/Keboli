export enum DifficultyLevel {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export interface AssessmentBase {
  title: string;
  job_description: string;
  duration_minutes: number;
  passing_score: number;
  difficulty_level: DifficultyLevel;
  max_attempts: number;
  is_active: boolean;
  skill_graph?: any;
}

export interface AssessmentCreate extends AssessmentBase { }

export interface AssessmentUpdate extends Partial<AssessmentBase> { }

export interface AssessmentResponse extends AssessmentBase {
  id: string;
  org_id: string;
  created_at: string;
  updated_at: string;
}
