export interface SectionScores {
  skills: number;
  experience: number;
  education: number;
  projects: number;
  formatting: number;
}

export interface WeaknessFix {
  weakness: string;
  fix: string;
}

export interface RewriteSuggestion {
  context: string;
  before: string;
  after: string;
  impactNote: string;
}

export interface InterviewQuestion {
  question: string;
  focusArea: string;
  tip: string;
}

export interface ResumeAnalysisResult {
  jobTitle: string;
  overallScore: number;
  atsScore: number;
  atsExplanation: string;
  sectionScores: SectionScores;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  weaknessesAndFixes: WeaknessFix[];
  rewrites: RewriteSuggestion[];
  coverLetter: string;
  interviewQuestions: InterviewQuestion[];
  professionalSummary: string;
}

export interface HistoryItem {
  id: string;
  createdAt: string;
  resumePreview: string;
  resumeText: string;
  jobDescription: string;
  analysis: ResumeAnalysisResult;
}

export type AnalysisStep = 'idle' | 'reading' | 'matching' | 'scoring';
