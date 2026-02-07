import { LadderWizard } from "@/components/wizard/LadderWizard";

export default async function DashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label">AI Career Ladder Generator</p>
          <h1 className="font-display text-4xl">Career Ladder Intelligence Studio</h1>
          <p className="mt-2 text-sm text-[#6b6152]">Provide HR context, run the LLM prompt, and generate a role-specific ladder.</p>
        </div>
      </header>

      <LadderWizard />
    </main>
  );
}
