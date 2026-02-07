import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Stateless mode enabled: ladder records are not persisted." },
    { status: 410 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Stateless mode enabled: ladder records are not persisted." },
    { status: 410 }
  );
}
