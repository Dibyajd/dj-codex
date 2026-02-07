import Link from "next/link";

export default async function HistoryPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-8 md:px-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Framework History</h1>
        <Link href="/dashboard" className="rounded-xl border border-[#d7ccba] bg-white px-4 py-2 text-sm font-semibold">Back to Builder</Link>
      </div>
      <section className="panel">
        <p className="text-sm text-[#5f5446]">
          Stateless mode is enabled. Generated ladders are not stored, so history is intentionally empty.
        </p>
      </section>
    </main>
  );
}
