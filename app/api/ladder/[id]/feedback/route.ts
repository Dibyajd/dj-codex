import { NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { getRequestUser } from "@/lib/request-user";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser();
  const { id } = await params;
  const body = await request.json();

  await logAudit({
    userId: user.id,
    action: "LADDER_FEEDBACK",
    resourceType: "LadderVersion",
    resourceId: id,
    metadata: {
      rating: body.rating,
      comments: body.comments,
      requestedAdjustments: body.requestedAdjustments || [],
      mode: "stateless"
    },
    ladderVersionId: id
  });

  return NextResponse.json({ ok: true, message: "Feedback captured for this session only." });
}
