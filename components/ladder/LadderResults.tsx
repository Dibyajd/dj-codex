"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function LadderResults({ ladder }: { ladder: any }) {
  async function downloadPdf() {
    const res = await fetch("/api/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ladder, brandingName: "Northstar Labs", watermark: "INTERNAL" })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `career-ladder-${ladder.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPpt() {
    const res = await fetch("/api/export/pptx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ladder, brandingName: "Northstar Labs" })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `career-ladder-${ladder.id}.pptx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label">Generated Output</p>
            <h3 className="font-display text-2xl">{ladder.function} / {ladder.roleFamily}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Confidence {Math.round(ladder.benchmarkConfidence * 100)}%</Badge>
            <Badge>Coverage {Math.round(ladder.dataCoverage * 100)}%</Badge>
            <Badge>Similarity {Math.round(ladder.similarityScore * 100)}%</Badge>
          </div>
        </div>

        <p className="mt-4 text-sm text-[#5f5446]">{ladder.executiveSummary}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Card className="bg-[#f9f5ec]">
            <p className="label">Company vs Market Median</p>
            <p className="mt-2 text-sm">{ladder.insights.companyVsMarketMedian}</p>
          </Card>
          <Card className="bg-[#f9f5ec]">
            <p className="label">Leadership Density</p>
            <p className="mt-2 text-sm">{ladder.insights.leadershipDensity}</p>
          </Card>
          <Card className="bg-[#f9f5ec]">
            <p className="label">Career Velocity</p>
            <p className="mt-2 text-sm">{ladder.insights.careerVelocity}</p>
          </Card>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl">Level Framework</h3>
          <div className="flex items-center gap-2">
            <Button onClick={downloadPdf}>Export PDF</Button>
            <Button onClick={downloadPpt} className="bg-accent2 hover:bg-[#a95522]">Export PPT</Button>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-[#d7ccba] bg-[#f9f6ef] p-3 text-xs text-[#5f5446]">
          Stateless mode: ladder data is generated on demand and not saved server-side.
        </div>

        <div className="mt-4 space-y-4">
          {ladder.levels
            .sort((a: any, b: any) => a.levelOrder - b.levelOrder)
            .map((level: any) => (
              <details key={level.id || `${level.levelCode}-${level.levelOrder}`} className="rounded-xl border border-[#d7ccba] bg-white p-4">
                <summary className="cursor-pointer list-none font-semibold">
                  {level.levelCode} - {level.marketAlignedTitle}
                </summary>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="label">Responsibilities</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {(level.responsibilities as string[]).map((v) => <li key={v}>- {v}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="label">Functional Competencies</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {(level.functionalCompetencies as string[]).map((v) => <li key={v}>- {v}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="label">Decision Authority</p>
                    <p className="mt-2 text-sm">{level.decisionAuthority}</p>
                  </div>
                  <div>
                    <p className="label">Promotion Benchmarks</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {(level.promotionBenchmarks as string[]).map((v) => <li key={v}>- {v}</li>)}
                    </ul>
                  </div>
                </div>
                <p className="mt-3 text-xs text-[#7a6f62]">Deviation note: {level.deviationNotes}</p>
              </details>
            ))}
        </div>
      </Card>

    </div>
  );
}
