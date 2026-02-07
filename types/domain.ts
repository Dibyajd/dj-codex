export type BusinessContext = {
  industryPrimary: string;
  industrySecondary?: string;
  revenueBand: string;
  growthStage: "Seed" | "Series" | "Scale" | "Public" | "Enterprise";
  employeeSize: number;
  marketGeography: string;
  businessModel: "B2B" | "B2C" | "SaaS" | "Platform" | "Services";
};

export type FunctionRoleInput = {
  function: string;
  roleFamily: string;
  specialization?: string;
};

export type JobArchitectureInput = {
  icStructure: string;
  managementStructure: string;
  directorMapping: string;
  headOfFunctionDefinition: string;
  trackType: "Dual Track" | "Single Track";
  customLevelNaming: Record<string, string>;
};

export type LadderLevelOutput = {
  levelOrder: number;
  levelCode: string;
  marketAlignedTitle: string;
  roleScopeVsMedian: string;
  responsibilities: string[];
  functionalCompetencies: string[];
  leadershipBehavioralSkills: string[];
  businessImpact: string;
  decisionAuthority: string;
  technologyTools: string[];
  promotionBenchmarks: string[];
  experienceRangeYears: string;
  internalExternalCompetitive: string;
  deviationNotes: string;
  riskFlags: string[];
};

export type Provenance = {
  sourceType: string;
  sourceName: string;
  sourceUrl?: string;
  relevanceScore: number;
  excerpt: string;
};

export type LadderGenerationOutput = {
  benchmarkConfidence: number;
  similarityScore: number;
  dataCoverage: number;
  executiveSummary: string;
  levels: LadderLevelOutput[];
  insights: {
    levelCompressionRisk: string;
    leadershipDensity: string;
    icManagerRatio: string;
    competitivenessGaps: string[];
    companyVsMarketMedian: string;
    careerVelocity: string;
  };
  provenance: Provenance[];
};

export type GenerateLadderPayload = {
  organizationId: string;
  createdById: string;
  businessContext: BusinessContext;
  functionRole: FunctionRoleInput;
  jobArchitecture: JobArchitectureInput;
  comparatorGroupIds?: string[];
  comparatorCompanies?: string[];
};
