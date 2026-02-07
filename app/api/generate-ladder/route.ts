import { NextResponse } from "next/server";
import { createLadderVersion } from "@/lib/ladder-service";
import { logAudit } from "@/lib/audit";
import { generatePayloadSchema } from "@/lib/validation";
import { getRequestUser } from "@/lib/request-user";

export async function POST(request: Request) {
  const user = await getRequestUser();

  const body = await request.json();
  const parsed = generatePayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  if (parsed.data.organizationId !== user.organizationId) {
    return NextResponse.json({ error: "Organization mismatch" }, { status: 403 });
  }

  try {
    const ladder = await createLadderVersion(parsed.data);

    await logAudit({
      userId: user.id,
      action: "GENERATE_LADDER",
      resourceType: "LadderVersion",
      resourceId: ladder.id,
      metadata: {
        function: ladder.function,
        roleFamily: ladder.roleFamily,
        benchmarkConfidence: ladder.benchmarkConfidence,
        mode: "stateless"
      },
      ladderVersionId: ladder.id
    });

    return NextResponse.json(ladder);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
