# Project: AI Resume Builder

## Purpose
Evidence-grounded resume compiler. Ingests candidate documents (PDF/DOCX), extracts structured career facts with provenance, analyzes job descriptions, and generates ATS-friendly tailored resumes via Azure OpenAI. Full-stack TypeScript monorepo deployed to Azure.

## Stack (actual, as of Aug 2026)
- **Monorepo**: npm workspaces (12 packages)
- **Frontend**: Next.js 16 App Router + React 19 + Tailwind v4 — full workspace UI
- **Backend**: Fastify v5 wrapped in Azure Function adapter (`apps/api/src/function.ts`)
- **Deployment**: Azure Function App `shagilnizami786-api` (zip deploy via GitHub Actions), NOT Container Apps
- **Database**: PostgreSQL (Azure) + Drizzle ORM, 4 migrations, 17 tables
- **AI**: Azure OpenAI with structured JSON outputs; 5-stage pipeline (job analysis → strategy → writing → fact check → match eval)
- **Secrets**: Azure Key Vault via `packages/config` (`loadKeyVaultSecrets`), managed identity — no secrets in env/code
- **Auth**: JWT in HttpOnly cookies (SameSite=None prod / Lax local), scrypt password hashing, rate-limited auth endpoints
- **Rendering**: Deterministic HTML engine + Playwright PDF export; dedicated single-column ATS layout
- **Storage**: Azure Blob Storage (SDK-based, authenticated)

## Workspace Packages
| Package | Status | Notes |
|---------|--------|-------|
| apps/web | ✅ | 9 routes: landing, login, dashboard, profile editor, upload, facts review, job input, preview (+PDF), history, templates |
| apps/api | ✅ | Dual entry: standalone server (dev) + Azure Function adapter (prod). Routes: auth, candidates, documents, generation, rendering, cover-letter |
| packages/domain | ✅ | Zero-dependency types |
| packages/db | ✅ | Drizzle schemas + repos + migrations 0000-0003 |
| packages/ai | ✅ | LLM client (Azure OpenAI), prompt registry, 6 workflows + orchestrator |
| packages/rendering | ✅ | HTML engine, Playwright PDF, overflow controller, 3 templates |
| packages/search | ✅ | Azure AI Search client + evidence retrieval |
| packages/storage | ✅ | Blob client (upload/container/SAS) |
| packages/document-intelligence | ✅ | Doc Intelligence client + resume parser → CandidateFacts |
| packages/shared | ✅ | AppError, logger, validation |
| packages/config | ✅ | Key Vault-backed config loader |
| packages/evaluation | ✅ | CLI scorer for hallucination rate, coverage, conformance |

## Key Architecture Rules
- Domain has zero framework/cloud deps
- All AI claims trace to CandidateFact via provenance; fact checker validates before match eval runs
- LLM controls content only — rendering engine owns layout (ATS layout ignores fancy template defs by design)
- Frontend talks to API over HTTP only, credentials: 'include'
- Migrations run inside buildApp() at startup (bundled into function zip)

## Verified Health (Aug 17, 2026)
- TypeScript: 0 errors in all packages
- API tests: 19/19 passing (4 files, self-contained test-app pattern)
- Web builds clean; Playwright tests exist (app, accessibility, live-azure)

## Known Gaps (see TODO-TECH-DEBT.md for detail)
1. Cover letter: complete backend, ZERO frontend exposure
2. Template selection: visual-only; generation always uses modern-professional despite plumbing existing end-to-end
3. CI does not run e2e/API integration suites
4. deploy.yml builds web but never deploys it (API only)
