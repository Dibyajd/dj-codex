# Career Ladder Intelligence Platform

Production-style AI-powered web app for HR Business Partners to generate benchmarked, explainable career ladders using peer-company signals and market data patterns.

## What Is Implemented
- Guided 3-step workflow:
  - Business context (industry, revenue, stage, size, geo, business model)
  - Function and role family
  - Job architecture (IC/Mgmt structure, dual/single track, custom naming)
- AI benchmarking engine:
  - Peer similarity scoring
  - Retrieval + rules normalization
  - Stage-aware role expectation adjustment
  - Confidence, data coverage, and similarity metrics
- Explainability:
  - Data provenance table per ladder
  - Persisted confidence and benchmark metadata
- Career ladder output includes per-level:
  - market title, scope, responsibilities, competencies, behavioral skills, impact, decision authority, tools, promotion benchmarks, experience range, competitiveness notes, risk flags
- Comparative insights:
  - company vs market signal, leadership density, velocity, compression risk, IC:Manager ratio
- Enterprise features:
  - Auth + RBAC
  - Audit logging
  - Versioned ladder records
  - Publish endpoint
  - PDF export (consulting-style)
  - Optional PPTX export

## Stack
- Frontend/API: Next.js 15, React 19, Tailwind
- Backend logic: Next.js route handlers
- AI orchestration: Python FastAPI service
- Data: PostgreSQL + Prisma
- Retrieval: vectorized similarity via hashing embeddings (adapter-ready for Pinecone/Weaviate)

## Quick Start
1. Start PostgreSQL:
```bash
docker compose up -d
```

2. Configure env:
```bash
cp .env.example .env
```

3. Install and initialize:
```bash
./scripts/setup.sh
```

4. Run services:
```bash
npm run dev
source .venv/bin/activate && uvicorn python_service.main:app --reload --port 8001
```

5. Open app:
- [http://localhost:3000](http://localhost:3000)

## Demo Credentials
See `/Users/dibya/Documents/codex projects/docs/DEMO_CREDENTIALS.md`.

## Sample Data
- Benchmark dataset: `/Users/dibya/Documents/codex projects/data/benchmarks.json`

## Generate Sample Exports
```bash
npm run samples:generate
```
Outputs:
- `/Users/dibya/Documents/codex projects/docs/samples/sample-career-ladder.pdf`
- `/Users/dibya/Documents/codex projects/docs/samples/sample-career-ladder.pptx`

## Key APIs
- `POST /api/generate-ladder`
- `GET/PATCH /api/ladder/:id`
- `POST /api/publish/:id`
- `POST /api/export/pdf`
- `POST /api/export/pptx`
- `GET/POST /api/comparators`

## Production Notes
- Replace credential auth with enterprise SSO (OIDC/SAML).
- Deploy AI service independently behind private network.
- Move benchmark ingestion from JSON to ETL pipelines and curated data contracts.
- Add Redis caching and managed vector DB adapter.
- Enforce HTTPS, KMS-backed encryption, SIEM integration.

## Architecture & Compliance Docs
- `/Users/dibya/Documents/codex projects/docs/ARCHITECTURE.md`
- `/Users/dibya/Documents/codex projects/docs/SECURITY_COMPLIANCE.md`

## MVP: HRBP Career Ladder Generator

This project includes a minimal MVP flow at `/mvp`.

### What it does
- Collects: Industry, Company size, Revenue range, Function, Role, Job levels
- Sends inputs to OpenAI API via `POST /api/mvp/generate-ladder`
- Generates a benchmarked career ladder using prompt engineering
- Displays the generated output in UI
- Exports output as PDF via `jsPDF`

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Add env variable to `.env.local`:
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Open:
   - `http://localhost:3000/mvp`

### Key files
- Frontend page: `app/mvp/page.tsx`
- Backend API: `app/api/mvp/generate-ladder/route.ts`
