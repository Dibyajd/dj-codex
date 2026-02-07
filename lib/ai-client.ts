import type { GenerateLadderPayload, LadderGenerationOutput } from "@/types/domain";

export async function generateLadderWithAI(payload: GenerateLadderPayload): Promise<LadderGenerationOutput> {
  const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8001";

  const response = await fetch(`${aiServiceUrl}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI service failed: ${response.status} ${text}`);
  }

  return (await response.json()) as LadderGenerationOutput;
}
