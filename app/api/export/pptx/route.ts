import { NextResponse } from "next/server";
import { buildLadderPpt } from "@/lib/ppt";

export async function POST(request: Request) {
  const body = await request.json();
  const ladder = body.ladder;
  if (!ladder || !Array.isArray(ladder.levels)) {
    return NextResponse.json({ error: "Missing ladder payload." }, { status: 400 });
  }

  const ppt = await buildLadderPpt({ ladder, brand: body.brandingName });
  const id = ladder.id || "ladder";

  return new NextResponse(new Uint8Array(ppt), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename=career-ladder-${id}.pptx`
    }
  });
}
