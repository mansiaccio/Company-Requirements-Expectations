
export interface CompanyIntelligence {
  oneLiner: string;
  expandedDescription: string;
  industry: string;
  productCategory: string;
  scale: 'Startup' | 'Growth' | 'Enterprise';
  indiaPresence: string;
  customersUseCases: string[];
  orientation: 'Engineering-led' | 'Business-led' | 'Balanced';
}

export interface JDBreakdown {
  coreResponsibilities: string[];
  toolsActuallyUsed: string[];
  toolsListedButLessUsed: string[];
  fresherExpectations: string[];
  first90DayOutcomes: string[];
  dayToDaySplit: { activity: string; percentage: number }[];
}

export interface RejectionAnalysis {
  toolLevelGaps: string[];
  thinkingGaps: string[];
  communicationGaps: string[];
  resumeMismatch: string[];
  brutalHonesty: string;
}

export interface FullAnalysisResponse {
  intelligence: CompanyIntelligence;
  jdBreakdown: JDBreakdown;
  rejectionAnalyzer: RejectionAnalysis;
}

export interface InterviewInputs {
  companyName: string;
  websiteUrl: string;
  linkedinUrl: string;
  jobDescription: string;
  techRoundsInfo: string;
  additionalContext?: string;
}
