export const DEMO_USER = {
  id: "demo-user",
  organizationId: "demo-org",
  role: "HRBP"
} as const;

export async function getRequestUser() {
  return DEMO_USER;
}
