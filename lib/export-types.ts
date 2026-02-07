export type ExportLevel = {
  id?: string;
  levelOrder: number;
  levelCode: string;
  marketAlignedTitle: string;
  roleScopeVsMedian: string;
  responsibilities: string[];
  functionalCompetencies: string[];
  leadershipBehavioralSkills?: string[];
  businessImpact: string;
  decisionAuthority: string;
  technologyTools: string[];
  promotionBenchmarks: string[];
  experienceRangeYears: string;
  internalExternalCompetitive?: string;
  deviationNotes: string;
  riskFlags?: string[];
};

export type ExportLadder = {
  id?: string;
  function: string;
  roleFamily: string;
  versionNumber?: number;
  benchmarkConfidence: number;
  executiveSummary: string;
  levels: ExportLevel[];
};
