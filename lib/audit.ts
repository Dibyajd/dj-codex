export async function logAudit(_input: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  ladderVersionId?: string;
}) {
  // Stateless mode: intentionally no persistence.
  return;
}
