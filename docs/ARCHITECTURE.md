# Architecture

## System Overview
- Frontend: Next.js App Router, Tailwind, componentized wizard + ladder analytics UX.
- Backend Gateway: Next.js API routes with auth, validation, persistence, audit logging.
- AI Service: Python FastAPI service for benchmark retrieval, similarity scoring, rules-based normalization, stage-aware ladder synthesis.
- Data Layer: PostgreSQL (Prisma ORM), benchmark dataset, provenance records, version history.
- Export Layer: PDFKit for consulting-style PDF output; PptxGenJS for optional PPT export.

## AI Pipeline
1. Collect business context, function/role, and job architecture inputs from wizard.
2. Pull benchmark corpus (sample dataset in `data/benchmarks.json`).
3. Perform retrieval with vectorized similarity (`HashingVectorizer` cosine score).
4. Run rules engine:
- stage adaptation by company maturity
- level normalization and title mapping
- risk flag injection for over/under-leveling and compression risk
5. Optionally refine language when OpenAI or Anthropic API keys are present.
6. Persist ladder levels + provenance + confidence metrics.

## Explainability
- `benchmarkConfidence`, `dataCoverage`, `similarityScore` are returned and stored.
- Data provenance table links each generated ladder to benchmark sources.
- Audit events track generate/update/publish actions for traceability.

## Security Controls
- AuthN/AuthZ: NextAuth credentials auth + role attributes (ADMIN/HRBP/VIEWER).
- Transport: HTTPS expected at deployment edge; local dev uses HTTP.
- Data: PostgreSQL storage; encryption-at-rest delegated to managed DB/KMS in production.
- Secure headers via middleware.
- Audit logging table for SOC2 evidence trail.

## Scalability Notes
- Split AI service independently for horizontal scale.
- Add Redis cache for repeated context requests.
- Replace sample benchmark JSON with ETL-fed warehouse tables.
- Swap local vectorization with managed vector DB (Pinecone/Weaviate) by replacing retrieval adapter.
