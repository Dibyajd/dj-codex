import { NextResponse } from "next/server";
import { buildLadderPdf } from "@/lib/pdf";

export async function POST(request: Request) {
  const body = await request.json();
  const ladder = body.ladder;
  if (!ladder || !Array.isArray(ladder.levels)) {
    return NextResponse.json({ error: "Missing ladder payload." }, { status: 400 });
  }

  const pdf = await buildLadderPdf({
    ladder,
    brandingName: body.brandingName,
    watermark: body.watermark || process.env.WATERMARK_TEXT
  });

  const id = ladder.id || "ladder";
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=career-ladder-${id}.pdf`
    }
  });
}
