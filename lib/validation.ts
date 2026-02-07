import { z } from "zod";

export const generatePayloadSchema = z.object({
  organizationId: z.string().min(1),
  createdById: z.string().min(1),
  businessContext: z.object({
    industryPrimary: z.string().min(1),
    industrySecondary: z.string().optional(),
    revenueBand: z.string().min(1),
    growthStage: z.enum(["Seed", "Series", "Scale", "Public", "Enterprise"]),
    employeeSize: z.number().int().positive(),
    marketGeography: z.string().min(1),
    businessModel: z.enum(["B2B", "B2C", "SaaS", "Platform", "Services"])
  }),
  functionRole: z.object({
    function: z.string().min(1),
    roleFamily: z.string().min(1),
    specialization: z.string().optional()
  }),
  jobArchitecture: z.object({
    icStructure: z.string().min(1),
    managementStructure: z.string().min(1),
    directorMapping: z.string().min(1),
    headOfFunctionDefinition: z.string().min(1),
    trackType: z.enum(["Dual Track", "Single Track"]),
    customLevelNaming: z.record(z.string(), z.string())
  }),
  comparatorGroupIds: z.array(z.string()).optional(),
  comparatorCompanies: z.array(z.string()).optional()
});
