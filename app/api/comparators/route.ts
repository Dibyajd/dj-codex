import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ companies: [], groups: [] });
}

export async function POST() {
  return NextResponse.json(
    {
      error: "Comparator groups are disabled in stateless mode."
    },
    { status: 501 }
  );
}
