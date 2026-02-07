import PDFDocument from "pdfkit";
import type { ExportLadder } from "@/lib/export-types";

export function buildLadderPdf(params: {
  ladder: ExportLadder;
  brandingName?: string;
  watermark?: string;
}) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk as Buffer));

  const { ladder, brandingName, watermark } = params;

  if (watermark) {
    doc.save();
    doc.fillColor("#DADADA").fontSize(58).rotate(-40, { origin: [250, 350] }).text(watermark, 70, 330, {
      align: "center",
      width: 450
    });
    doc.restore();
  }

  doc.fillColor("#0E6E63").fontSize(24).text(brandingName || "Career Ladder Intelligence", { align: "left" });
  doc.moveDown(0.5);
  doc.fillColor("#1A1A1A").fontSize(18).text(`${ladder.function} - ${ladder.roleFamily}`);
  doc.fontSize(11).fillColor("#4A4A4A").text(`Version ${ladder.versionNumber || 1} | Confidence ${Math.round(ladder.benchmarkConfidence * 100)}%`);
  doc.moveDown();

  doc.fontSize(14).fillColor("#C96A2A").text("Executive Summary");
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#1A1A1A").text(ladder.executiveSummary, { lineGap: 4 });

  for (const level of ladder.levels.sort((a, b) => a.levelOrder - b.levelOrder)) {
    doc.addPage();
    doc.fillColor("#0E6E63").fontSize(20).text(`${level.levelCode} - ${level.marketAlignedTitle}`);
    doc.moveDown(0.5);
    doc.fillColor("#1A1A1A").fontSize(11).text(`Role Scope vs Median: ${level.roleScopeVsMedian}`);
    doc.text(`Business Impact: ${level.businessImpact}`);
    doc.text(`Decision Authority: ${level.decisionAuthority}`);
    doc.text(`Experience Range: ${level.experienceRangeYears}`);
    doc.moveDown(0.5);

    doc.fillColor("#C96A2A").fontSize(13).text("Responsibilities");
    level.responsibilities.forEach((item) => doc.fillColor("#1A1A1A").fontSize(11).text(`- ${item}`));

    doc.moveDown(0.5);
    doc.fillColor("#C96A2A").fontSize(13).text("Competencies");
    level.functionalCompetencies.forEach((item) => doc.fillColor("#1A1A1A").fontSize(11).text(`- ${item}`));

    doc.moveDown(0.5);
    doc.fillColor("#C96A2A").fontSize(13).text("Promotion Benchmarks");
    level.promotionBenchmarks.forEach((item) => doc.fillColor("#1A1A1A").fontSize(11).text(`- ${item}`));

    doc.moveDown(0.5);
    doc.fillColor("#4A4A4A").fontSize(10).text(`Deviation Note: ${level.deviationNotes}`);
  }

  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
