"use client";

import { type FormEvent, type MouseEvent, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type LadderLevel = {
  path?: "Individual" | "Managerial" | string;
  level: string;
  title: string;
  scope: string;
  responsibilities: string[];
  skills: string[];
  typicalExperience: string;
};

type LadderResponse = {
  input: {
    industry: string;
    companySize: string;
    revenueRange: string;
    functionName: string;
    role: string;
    jobLevels: string;
    individualTrackJobLevels: string;
    managerialTrackJobLevels: string;
    startingJobLevel: string;
    highestJobLevel: string;
    dualPath: "Yes" | "No";
  };
  ladder: {
    summary?: string;
    benchmarkedCompanies?: string[];
    benchmarkAssumptions?: string[];
    levels?: LadderLevel[];
  };
};

export function LadderWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LadderResponse | null>(null);

  const [form, setForm] = useState({
    industry: "",
    companySize: "",
    revenueRange: "",
    functionName: "HR",
    role: "HR Business Partner",
    jobLevels: "Associate, Senior, Lead, Director",
    individualTrackJobLevels: "IC1, IC2, IC3, IC4, IC5",
    managerialTrackJobLevels: "M1, M2, M3, M4",
    startingJobLevel: "Associate",
    highestJobLevel: "Director, HR Business Partner",
    dualPath: "Yes" as "Yes" | "No"
  });

  const hasLevels = useMemo(() => (result?.ladder.levels?.length ?? 0) > 0, [result]);
  const groupedLevels = useMemo(() => {
    const levels = result?.ladder.levels ?? [];
    return {
      individual: levels.filter((level) => (level.path || "Individual") === "Individual"),
      managerial: levels.filter((level) => level.path === "Managerial")
    };
  }, [result]);

  function goBack(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    setStep((current) => Math.max(1, current - 1));
  }

  function goNext(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    setStep((current) => Math.min(2, current + 1));
  }

  async function generate(event?: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/mvp/generate-ladder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = (await res.json()) as LadderResponse | { error: string };

      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Unable to generate ladder.");
      }

      setResult(data as LadderResponse);
      setStep(2);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function exportPdf() {
    if (!result) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    const width = doc.internal.pageSize.getWidth() - margin * 2;
    let y = margin;
    const pageBottom = 790;
    const levels = result.ladder.levels ?? [];
    const individualLevels = levels.filter((level) => (level.path || "Individual") === "Individual");
    const managerialLevels = levels.filter((level) => level.path === "Managerial");

    const columns = [
      { label: "Level", width: 72 },
      { label: "Title", width: 150 },
      { label: "Scope", width: 185 },
      { label: "Experience", width: 93 }
    ];

    const ensureSpace = (requiredHeight: number) => {
      if (y + requiredHeight <= pageBottom) return;
      doc.addPage();
      y = margin;
      drawPageHeader();
    };

    const drawPageHeader = () => {
      doc.setFillColor(14, 110, 99);
      doc.roundedRect(margin, y, width, 36, 8, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text("Career Ladder", margin + 12, y + 23);
      y += 50;
    };

    const drawTrackHeader = (label: string) => {
      ensureSpace(26);
      doc.setFillColor(244, 238, 228);
      doc.rect(margin, y, width, 22, "F");
      doc.setTextColor(61, 53, 42);
      doc.setFontSize(11);
      doc.text(label, margin + 8, y + 15);
      y += 24;
    };

    const drawTableHeader = () => {
      ensureSpace(24);
      doc.setFillColor(232, 244, 242);
      doc.rect(margin, y, width, 22, "F");
      doc.setTextColor(34, 34, 34);
      doc.setFontSize(10);
      let x = margin + 6;
      for (const column of columns) {
        doc.text(column.label, x, y + 15);
        x += column.width;
      }
      y += 24;
    };

    const drawLevelRow = (level: LadderLevel, rowIndex: number) => {
      const rowValues = [level.level, level.title, level.scope, level.typicalExperience];
      const wrapped = rowValues.map((value, idx) => doc.splitTextToSize(value || "", columns[idx].width - 10));
      const rowHeight = Math.max(...wrapped.map((lines) => lines.length)) * 12 + 8;

      ensureSpace(rowHeight + 30);
      doc.setDrawColor(215, 206, 190);
      doc.setFillColor(rowIndex % 2 === 0 ? 255 : 250, rowIndex % 2 === 0 ? 255 : 249, rowIndex % 2 === 0 ? 255 : 245);
      doc.rect(margin, y, width, rowHeight, "FD");

      doc.setTextColor(41, 39, 36);
      doc.setFontSize(10);
      let x = margin + 6;
      for (let idx = 0; idx < columns.length; idx += 1) {
        doc.text(wrapped[idx], x, y + 14);
        x += columns[idx].width;
      }
      y += rowHeight;

      doc.setTextColor(82, 74, 63);
      doc.setFontSize(9);
      const responsibilities = doc.splitTextToSize(`Responsibilities: ${level.responsibilities.join("; ")}`, width - 12);
      const skills = doc.splitTextToSize(`Skills: ${level.skills.join("; ")}`, width - 12);
      const detailHeight = (responsibilities.length + skills.length) * 11 + 8;
      ensureSpace(detailHeight);
      doc.rect(margin, y, width, detailHeight);
      doc.text(responsibilities, margin + 6, y + 12);
      doc.text(skills, margin + 6, y + 12 + responsibilities.length * 11);
      y += detailHeight + 6;
    };

    drawPageHeader();

    const renderTrack = (label: string, trackLevels: LadderLevel[]) => {
      if (!trackLevels.length) return;
      drawTrackHeader(label);
      drawTableHeader();
      trackLevels.forEach((level, idx) => drawLevelRow(level, idx));
      y += 6;
    };

    renderTrack("Individual Track", individualLevels);
    renderTrack("Managerial Track", managerialLevels);

    doc.save("career-ladder.pdf");
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Guided Ladder Builder</h2>
          <p className="text-sm text-[#6b6152]">Step {step} of 2</p>
        </div>

        {step === 1 ? (
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={generate}>
            <div>
              <label className="label">Industry</label>
              <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} required />
            </div>
            <div>
              <label className="label">Company Size</label>
              <Input value={form.companySize} onChange={(e) => setForm({ ...form, companySize: e.target.value })} required />
            </div>
            <div>
              <label className="label">Revenue Range</label>
              <Input value={form.revenueRange} onChange={(e) => setForm({ ...form, revenueRange: e.target.value })} required />
            </div>
            <div>
              <label className="label">Function</label>
              <Input value={form.functionName} onChange={(e) => setForm({ ...form, functionName: e.target.value })} required />
            </div>
            <div>
              <label className="label">Role</label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
            </div>
            <div>
              {form.dualPath === "Yes" ? (
                <>
                  <label className="label">Individual Track Job Levels (comma-separated)</label>
                  <Input
                    value={form.individualTrackJobLevels}
                    onChange={(e) => setForm({ ...form, individualTrackJobLevels: e.target.value })}
                    required
                  />
                </>
              ) : (
                <>
                  <label className="label">Job Levels (comma-separated)</label>
                  <Input value={form.jobLevels} onChange={(e) => setForm({ ...form, jobLevels: e.target.value })} required />
                </>
              )}
            </div>
            {form.dualPath === "Yes" ? (
              <div>
                <label className="label">Managerial Track Job Levels (comma-separated)</label>
                <Input
                  value={form.managerialTrackJobLevels}
                  onChange={(e) => setForm({ ...form, managerialTrackJobLevels: e.target.value })}
                  required
                />
              </div>
            ) : null}
            <div>
              <label className="label">Starting Job Level</label>
              <Input
                value={form.startingJobLevel}
                onChange={(e) => setForm({ ...form, startingJobLevel: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Highest Job Level / Head of Role</label>
              <Input
                value={form.highestJobLevel}
                onChange={(e) => setForm({ ...form, highestJobLevel: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Dual Path (Individual + Managerial)</label>
              <div className="mt-2 flex items-center gap-5 rounded-xl border border-[#d7ccba] bg-white px-3 py-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="dualPath"
                    checked={form.dualPath === "Yes"}
                    onChange={() => setForm({ ...form, dualPath: "Yes" })}
                  />
                  Yes
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="dualPath"
                    checked={form.dualPath === "No"}
                    onChange={() => setForm({ ...form, dualPath: "No" })}
                  />
                  No
                </label>
              </div>
            </div>

            <div className="md:col-span-2 mt-2 flex items-center gap-3">
              <Button type="submit" disabled={loading}>{loading ? "Generating..." : "Generate Career Ladder"}</Button>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
          </form>
        ) : null}

        {step === 2 ? (
          <div className="mt-5 space-y-5 text-sm text-[#2c2a26]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">Career Ladder Output</h3>
              <Button type="button" onClick={exportPdf}>Export PDF</Button>
            </div>

            {result?.ladder.summary ? (
              <div>
                <h4 className="label">Summary</h4>
                <p className="mt-2 leading-6">{result.ladder.summary}</p>
              </div>
            ) : null}

            {result?.ladder.benchmarkAssumptions?.length ? (
              <div>
                <h4 className="label">Benchmark Assumptions</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {result.ladder.benchmarkAssumptions.map((item, idx) => (
                    <li key={`${item}-${idx}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result?.ladder.benchmarkedCompanies?.length ? (
              <div>
                <h4 className="label">Companies Benchmarked</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {result.ladder.benchmarkedCompanies.map((item, idx) => (
                    <li key={`${item}-${idx}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {hasLevels ? (
              <div>
                <h4 className="label">Level Framework</h4>
                {groupedLevels.individual.length ? (
                  <div className="mt-3">
                    <h5 className="font-semibold text-[#3f372b]">Individual Track</h5>
                    <div className="mt-2 space-y-3">
                      {groupedLevels.individual.map((level, idx) => (
                        <article key={`individual-${level.level}-${idx}`} className="rounded-xl border border-[#e1d6c4] bg-[#fdfaf5] p-4">
                          <h5 className="text-xl font-semibold">
                            {level.level} - {level.title}
                          </h5>
                          <p className="mt-2">{level.scope}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.06em] text-[#6a5f4f]">
                            Typical experience: {level.typicalExperience}
                          </p>
                          <p className="mt-2">
                            <span className="font-semibold">Responsibilities:</span> {level.responsibilities.join("; ")}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">Skills:</span> {level.skills.join("; ")}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}

                {form.dualPath === "Yes" && groupedLevels.managerial.length ? (
                  <div className="mt-5">
                    <h5 className="font-semibold text-[#3f372b]">Managerial Track</h5>
                    <div className="mt-2 space-y-3">
                      {groupedLevels.managerial.map((level, idx) => (
                        <article key={`managerial-${level.level}-${idx}`} className="rounded-xl border border-[#e1d6c4] bg-[#fdfaf5] p-4">
                          <h5 className="text-xl font-semibold">
                            {level.level} - {level.title}
                          </h5>
                          <p className="mt-2">{level.scope}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.06em] text-[#6a5f4f]">
                            Typical experience: {level.typicalExperience}
                          </p>
                          <p className="mt-2">
                            <span className="font-semibold">Responsibilities:</span> {level.responsibilities.join("; ")}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">Skills:</span> {level.skills.join("; ")}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
        ) : null}

        <div className="mt-6 flex items-center gap-3">
          <Button type="button" onClick={goBack} className="bg-[#6b6152] hover:bg-[#4f473c]" disabled={step === 1 || loading}>
            Back
          </Button>
          <Button type="button" onClick={goNext} disabled={step === 2 || loading}>
            Next
          </Button>
          {step === 2 ? (
            <Button type="button" onClick={(e) => {
              setStep(1);
              generate(e);
            }} disabled={loading}>
              {loading ? "Regenerating..." : "Regenerate"}
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
