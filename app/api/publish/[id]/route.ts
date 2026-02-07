import { NextResponse } from "next/server";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return NextResponse.json({
    id,
    status: "PUBLISHED",
    persisted: false,
    note: "Stateless mode enabled. Nothing was stored."
  });
}
