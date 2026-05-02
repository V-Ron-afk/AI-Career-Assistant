/**
 * Shared TypeScript types for the AI Career Assistant Platform.
 * Mirrors the backend Pydantic schemas for type safety end-to-end.
 */

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  full_name: string
  target_role?: string
  target_industry?: string
  created_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

// ─── Resume ───────────────────────────────────────────────────────────────────

export interface Resume {
  id: string
  title: string
  original_filename: string
  version: number
  created_at: string
}

export interface ResumeAnalysis {
  analysis_id: string
  resume_id: string
  ats_score: number
  overall_score: number
  result_data: ResumeAnalysisData
  created_at: string
}

export interface ResumeAnalysisData {
  ats_score: number
  overall_score: number
  executive_summary: string
  scores: {
    contact_info: number
    work_experience: number
    skills: number
    education: number
    formatting: number
    keywords: number
    quantified_achievements: number
    readability: number
  }
  strengths: Array<{ title: string; detail: string }>
  critical_issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low'
    issue: string
    location: string
    fix: string
  }>
  missing_elements: string[]
  keyword_analysis: {
    present: string[]
    missing_common: string[]
    overused: string[]
  }
  section_feedback: {
    summary?: string
    experience: string
    skills: string
    education: string
    projects?: string
  }
  rewritten_summary: string
  top_3_priority_fixes: [string, string, string]
}

// ─── Job Match ────────────────────────────────────────────────────────────────

export type MatchVerdict = 'strong_match' | 'good_match' | 'partial_match' | 'poor_match'

export interface JobMatch {
  match_id: string
  match_score: number
  verdict: MatchVerdict
  result_data: JobMatchData
  created_at: string
}

export interface JobMatchData {
  match_score: number
  verdict: MatchVerdict
  verdict_reason: string
  matched_skills: Array<{
    skill: string
    resume_evidence: string
    jd_requirement: string
  }>
  missing_skills: Array<{
    skill: string
    importance: 'must_have' | 'nice_to_have'
    how_to_address: string
  }>
  keyword_gaps: string[]
  experience_gap: {
    required_years: number | null
    candidate_years: number | null
    gap: string
  }
  tailoring_suggestions: Array<{
    section: string
    current: string
    suggested: string
  }>
  cover_letter_hooks: string[]
  interview_likelihood: 'high' | 'medium' | 'low'
  interview_likelihood_reason: string
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export interface PortfolioReview {
  review_id: string
  overall_score: number
  result_data: PortfolioReviewData
  created_at: string
}

export interface PortfolioReviewData {
  overall_score: number
  technical_depth_score: number
  market_relevance_score: number
  code_quality_indicators: number
  project_complexity_score: number
  strengths: string[]
  weaknesses: string[]
  project_analysis: Array<{
    name: string
    complexity: 'beginner' | 'intermediate' | 'advanced'
    tech_stack_assessment: string
    real_world_usefulness: 'high' | 'medium' | 'low'
    standout_features: string[]
    missing_elements: string[]
    suggested_improvements: string[]
  }>
  recommended_new_projects: Array<{
    title: string
    description: string
    tech_stack: string[]
    why_impactful: string
    difficulty: 'intermediate' | 'advanced'
    estimated_weeks: number
  }>
  github_profile_tips: string[]
  hiring_manager_impression: string
  top_priorities: [string, string, string]
}

// ─── Interview ────────────────────────────────────────────────────────────────

export interface InterviewPrep {
  analysis_id: string
  result_data: InterviewPrepData
  created_at: string
}

export interface InterviewPrepData {
  technical_questions: Array<{
    question: string
    difficulty: 'easy' | 'medium' | 'hard'
    topic: string
    what_interviewer_is_testing: string
    ideal_answer_hints: string[]
    follow_up: string
  }>
  behavioral_questions: Array<{
    question: string
    competency: string
    why_asked: string
    ideal_structure: string
  }>
  project_deep_dive_questions: Array<{
    project: string
    questions: string[]
    red_flags_to_avoid: string[]
  }>
  situational_questions: Array<{
    scenario: string
    question: string
    what_good_looks_like: string
  }>
  questions_to_ask_interviewer: Array<{
    question: string
    why_impressive: string
  }>
  preparation_roadmap: Array<{
    day: number
    focus: string
    resources: string[]
  }>
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatSession {
  id: string
  title: string
  message_count: number
  updated_at: string
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_resumes: number
  total_analyses: number
  total_job_matches: number
  latest_ats_score?: number
  latest_match_score?: number
  recent_analyses: Array<{
    id: string
    type: string
    score?: number
    created_at: string
  }>
}
