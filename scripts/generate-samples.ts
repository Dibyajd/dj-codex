import fs from "node:fs";
import path from "node:path";
import { buildLadderPdf } from "../lib/pdf";
import { buildLadderPpt } from "../lib/ppt";

async function run() {
  const sampleLadder = {
    id: "sample-ladder",
    organizationId: "demo-org",
    function: "Engineering",
    roleFamily: "Backend Engineer",
    specialization: "Platform",
    icStructure: "IC1-IC6",
    managementStructure: "M1-M4",
    directorMapping: "Director -> VP -> CTO",
    headOfFunctionDefinition: "Owns functional strategy and talent health",
    trackType: "Dual Track",
    customLevelNaming: {},
    benchmarkConfidence: 0.84,
    similarityScore: 0.81,
    dataCoverage: 0.67,
    insights: {},
    executiveSummary:
      "Sample generated ladder balancing platform ownership, production reliability, and leadership progression benchmarks.",
    status: "DRAFT",
    versionNumber: 1,
    createdById: "demo-user",
    createdAt: new Date(),
    updatedAt: new Date(),
    levels: [
      {
        id: "l1",
        ladderVersionId: "sample-ladder",
        levelOrder: 1,
        levelCode: "IC2",
        marketAlignedTitle: "Software Engineer II",
        roleScopeVsMedian: "Owns medium-complexity services at market median scope.",
        responsibilities: ["Deliver production-ready code", "Participate in on-call", "Contribute to design reviews"],
        functionalCompetencies: ["API design", "Testing strategy", "Observability"],
        leadershipBehavioralSkills: ["Collaboration", "Ownership", "Communication"],
        businessImpact: "Improves service reliability and release cadence.",
        decisionAuthority: "Autonomous in sprint-level execution.",
        technologyTools: ["TypeScript", "PostgreSQL", "Kubernetes"],
        promotionBenchmarks: ["Two sustained high-impact cycles", "Cross-team influence evidence"],
        experienceRangeYears: "3-5 years",
        internalExternalCompetitive: "Competitive at market median",
        deviationNotes: "Slightly elevated expectation on reliability leadership.",
        riskFlags: ["Compression risk vs IC3 if promo bars are loose"]
      }
    ]
  };

  const pdf = await buildLadderPdf({ ladder: sampleLadder as any, brandingName: "Northstar Labs", watermark: "SAMPLE" });
  const ppt = await buildLadderPpt({ ladder: sampleLadder as any, brand: "Northstar Labs" });

  const outDir = path.join(process.cwd(), "docs", "samples");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "sample-career-ladder.pdf"), pdf);
  fs.writeFileSync(path.join(outDir, "sample-career-ladder.pptx"), ppt);

  console.log("Generated docs/samples/sample-career-ladder.pdf and .pptx");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
