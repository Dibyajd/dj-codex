# Security and Compliance

## SOC2-Ready Design Elements
- Authentication and RBAC enforced before protected API/data access.
- Audit logs for create/update/publish with actor + timestamp + metadata.
- Change history via versioned ladder records.
- Security headers in middleware.

## GDPR Alignment
- Data minimization: benchmark inputs and role-framework metadata only.
- Purpose limitation: data used only for framework generation.
- Deletion path: remove organization-linked records from ladder/audit/provenance tables.
- Data export: PDF/PPT + API retrieval endpoints support portability.

## Bias Mitigation
- Rules layer normalizes scope language to avoid person-specific assumptions.
- Confidence and provenance are always shown to avoid black-box decisions.
- HRBP remains in the loop through editable ladder versions.

## Production Hardening Checklist
- Use SSO (OIDC/SAML) provider in place of local credentials.
- Enforce MFA and short-lived sessions.
- Use managed Postgres with encryption-at-rest and backups.
- Add centralized SIEM log forwarding.
- Add DLP and PII scanners for uploaded benchmark content.
