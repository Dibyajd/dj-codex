import { generateLadderWithAI } from "@/lib/ai-client";
import type { GenerateLadderPayload } from "@/types/domain";

function newId() {
  return `ladder_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function createLadderVersion(payload: GenerateLadderPayload) {
  const output = await generateLadderWithAI(payload);
  const id = newId();

  return {
    id,
    organizationId: payload.organizationId,
    function: payload.functionRole.function,
    roleFamily: payload.functionRole.roleFamily,
    specialization: payload.functionRole.specialization || null,
    benchmarkConfidence: output.benchmarkConfidence,
    similarityScore: output.similarityScore,
    dataCoverage: output.dataCoverage,
    executiveSummary: output.executiveSummary,
    insights: output.insights,
    status: "DRAFT",
    versionNumber: 1,
    createdAt: new Date().toISOString(),
    levels: output.levels.map((level, index) => ({
      id: `${id}_level_${index + 1}`,
      ...level
    })),
    provenance: output.provenance.map((p, index) => ({
      id: `${id}_prov_${index + 1}`,
      ...p
    }))
  };
}
