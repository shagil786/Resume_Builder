# Project: AI Resume Builder

## Purpose
AI-powered resume builder that ingests candidate documents (PDF/DOCX), extracts structured career facts, analyzes job descriptions, and generates tailored resumes using Azure OpenAI. Full-stack TypeScript monorepo targeting Azure cloud infrastructure.

## Stack Overview
- **Monorepo**: Turborepo with npm workspaces
- **Frontend**: Next.js 14 (App Router) — planned but not yet created
- **Backend**: Fastify (modular monolith) — planned, not yet created
- **Domain**: Pure TypeScript types & interfaces (zero framework dependencies)
- **Database**: PostgreSQL with Drizzle ORM — planned
- **AI**: Azure OpenAI (GPT-4-32k) with structured outputs
- **Search**: Azure AI Search (hybrid semantic + keyword)
- **Storage**: Azure Blob Storage
- **Document Processing**: Azure Document Intelligence
- **Infrastructure**: Azure Bicep templates
- **CI/CD**: GitHub Actions

## Current Status (Aug 2026)
- Core domain types defined in `packages/domain/src/candidate/`
- API contracts defined in `api/candidate/` (service interfaces, endpoint schemas, repository interfaces)
- No apps (web/api) created yet — only interface files
- No database schema or migrations yet
- No actual implementations (services, repositories, AI workflows)

## Workspace Packages
| Package | Status | Purpose |
|---------|--------|---------|
| apps/web | Not created | Next.js frontend |
| apps/api | Not created | Fastify backend |
| packages/domain | ✅ Exists | Domain types & interfaces, package.json with @resume-builder/domain |
| packages/db | ✅ Exists | Drizzle ORM schemas + repository implementations |
| packages/ai | ✅ Exists | AI workflow orchestration with LLM client, prompts, stage definitions |
| packages/rendering | ✅ Exists | HTML/PDF template engine with overflow control |
| packages/search | ✅ Exists | Azure AI Search client + evidence retrieval |
| packages/storage | ✅ Exists | Azure Blob Storage client + SAS URLs |
| packages/document-intelligence | ✅ Exists | Azure Document Intelligence client + resume parsesr |
| packages/shared | Not created | Cross-cutting utilities |

## Key Constraints
- `packages/domain` has **zero dependencies** on frameworks or cloud providers
- No Azure SDK in frontend or domain layer
- AI prompts live in `packages/ai/prompts/`, not in route handlers
- Frontend talks to backend only via HTTP
- All AI outputs traceable to a `GenerationRun` with stage logs
