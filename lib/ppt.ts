import PptxGenJS from "pptxgenjs";
import type { ExportLadder } from "@/lib/export-types";

export async function buildLadderPpt(params: {
  ladder: ExportLadder;
  brand?: string;
}) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  const title = pptx.addSlide();
  title.background = { color: "F5F2EB" };
  title.addText(params.brand || "Career Ladder Intelligence", { x: 0.4, y: 0.6, w: 12.2, h: 0.6, fontSize: 24, bold: true, color: "0E6E63" });
  title.addText(`${params.ladder.function} | ${params.ladder.roleFamily} | v${params.ladder.versionNumber || 1}`, {
    x: 0.4,
    y: 1.3,
    w: 12,
    h: 0.5,
    fontSize: 14,
    color: "1A1A1A"
  });
  title.addText(params.ladder.executiveSummary, {
    x: 0.4,
    y: 2.1,
    w: 12,
    h: 2.5,
    fontSize: 12,
    color: "333333"
  });

  params.ladder.levels
    .sort((a, b) => a.levelOrder - b.levelOrder)
    .forEach((level) => {
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };
      slide.addText(`${level.levelCode} - ${level.marketAlignedTitle}`, { x: 0.4, y: 0.4, w: 12, h: 0.6, fontSize: 20, bold: true, color: "0E6E63" });
      slide.addText(`Scope: ${level.roleScopeVsMedian}`, { x: 0.4, y: 1.1, w: 12, h: 0.4, fontSize: 12 });
      slide.addText(`Impact: ${level.businessImpact}`, { x: 0.4, y: 1.5, w: 12, h: 0.4, fontSize: 12 });
      const responsibilities = level.responsibilities.slice(0, 6).map((s) => `- ${s}`).join("\n");
      slide.addText(responsibilities, { x: 0.4, y: 2.1, w: 5.8, h: 3.8, fontSize: 11, color: "333333" });
      const competencies = level.functionalCompetencies.slice(0, 6).map((s) => `- ${s}`).join("\n");
      slide.addText(competencies, { x: 6.4, y: 2.1, w: 5.8, h: 3.8, fontSize: 11, color: "333333" });
    });

  const arrayBuffer = (await pptx.write({ outputType: "arraybuffer" })) as ArrayBuffer;
  return Buffer.from(new Uint8Array(arrayBuffer));
}
