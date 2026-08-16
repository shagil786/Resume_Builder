# Repository Structure

## Overview

This is a **TypeScript-oriented full-stack monorepo** managed with **Turborepo**. It separates frontend, backend, domain logic, AI orchestration, rendering, and Azure integrations into distinct packages with clear dependency boundaries.

The structure is designed so that:
- AI and Azure infrastructure code cannot leak into frontend or business logic.
- The domain layer has zero dependencies on frameworks or cloud providers.
- The backend is a modular monolith that can be decomposed later if needed.

---

## Proposed Folder Tree

```
resume-builder/
├── apps/
│   ├── web/                          # Next.js 14 (App Router) — Candidate UI
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   │   ├── (auth)/           # Login, register, callback
│   │   │   │   ├── (dashboard)/      # Profile editor, upload, generation
│   │   │   │   └── api/              # Next.js API routes (auth proxy only)
│   │   │   ├── components/
│   │   │   │   ├── auth/
│   │   │   │   ├── profile/
│   │   │   │   ├── resume-upload/
│   │   │   │   ├── job-input/
│   │   │   │   ├── template-picker/
│   │   │   │   ├── generation-status/
│   │   │   │   ├── resume-preview/
│   │   │   │   ├── fact-review/
│   │   │   │   └── version-history/
│   │   │   ├── hooks/                # React Query hooks, auth hooks
│   │   │   ├── lib/                  # Client utilities, API client
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── tsconfig.json
│   │
│   └── api/                          # Fastify backend — Modular Monolith
│       ├── src/
│       │   ├── routes/               # API route handlers
│       │   │   ├── candidate/
│       │   │   ├── job/
│       │   │   ├── resume/
│       │   │   ├── template/
│       │   │   ├── generation/
│       │   │   └── health.ts
│       │   ├── services/             # Business logic orchestration
│       │   │   ├── candidate.service.ts
│       │   │   ├── job.service.ts
│       │   │   ├── generation.service.ts
│       │   │   └── resume.service.ts
│       │   ├── middleware/           # Auth, validation, logging, correlation
│       │   │   ├── auth.ts
│       │   │   ├── validation.ts
│       │   │   ├── logging.ts
│       │   │   └── correlation.ts
│       │   ├── plugins/              # Fastify plugins
│       │   │   ├── swagger.ts
│       │   │   └── error-handler.ts
│       │   └── index.ts              # Server entry point
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── domain/                       # SHARED: Domain types, schemas, DTOs
│   │   ├── src/
│   │   │   ├── candidate/            # Candidate profile types
│   │   │   ├── job/                  # Job description types
│   │   │   ├── resume/               # Resume generation types
│   │   │   ├── template/             # Template types
│   │   │   ├── generation/           # Generation run types
│   │   │   ├── common/               # Shared primitives (UUID, dates, etc.)
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── db/                           # SHARED: Database schema & migrations
│   │   ├── src/
│   │   │   ├── schema/               # Drizzle ORM schema definitions
│   │   │   │   ├── candidate.ts
│   │   │   │   ├── job.ts
│   │   │   │   ├── resume.ts
│   │   │   │   ├── template.ts
│   │   │   │   └── index.ts
│   │   │   ├── migrations/           # Auto-generated migration files
│   │   │   ├── seed/                 # Dev seed data
│   │   │   └── index.ts              # Connection, pool, helpers
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ai/                           # SHARED: AI workflow orchestration
│   │   ├── src/
│   │   │   ├── workflows/            # Explicit workflow stage definitions
│   │   │   │   ├── candidate-ingestion.ts
│   │   │   │   ├── job-analysis.ts
│   │   │   │   ├── evidence-retrieval.ts
│   │   │   │   ├── strategy-planning.ts
│   │   │   │   ├── content-generation.ts
│   │   │   │   ├── fact-verification.ts
│   │   │   │   └── job-fit-evaluation.ts
│   │   │   ├── prompts/              # Prompt definitions (versioned)
│   │   │   │   ├── v1/
│   │   │   │   │   ├── analyze-job.system.md
│   │   │   │   │   ├── extract-requirements.user.md
│   │   │   │   │   ├── plan-strategy.system.md
│   │   │   │   │   ├── generate-section.system.md
│   │   │   │   │   ├── verify-facts.system.md
│   │   │   │   │   └── evaluate-match.system.md
│   │   │   │   └── registry.ts       # Prompt version registry
│   │   │   ├── tools/                # AI tool definitions (NOT implementations)
│   │   │   │   ├── get-candidate-profile.ts
│   │   │   │   ├── search-evidence.ts
│   │   │   │   ├── get-template-schema.ts
│   │   │   │   └── validate-claims.ts
│   │   │   ├── schemas/              # JSON schemas for structured outputs
│   │   │   │   ├── job-analysis.json
│   │   │   │   ├── resume-strategy.json
│   │   │   │   ├── resume-content.json
│   │   │   │   └── fact-check.json
│   │   │   ├── llm/                  # LLM client abstraction
│   │   │   │   ├── client.ts         # Generic LLM interface
│   │   │   │   └── azure-openai.ts   # Azure OpenAI implementation
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── rendering/                    # SHARED: Template rendering engine
│   │   ├── src/
│   │   │   ├── engines/              # Rendering engines
│   │   │   │   ├── html/             # HTML-to-PDF engine (Playwright/Puppeteer)
│   │   │   │   ├── pdf/              # PDFKit or similar
│   │   │   │   └── docx/             # DOCX generation (future)
│   │   │   ├── templates/            # Template definitions (schema + layout rules)
│   │   │   │   ├── modern-professional/
│   │   │   │   ├── classic-academic/
│   │   │   │   └── minimal/
│   │   │   ├── validators/           # Layout validation
│   │   │   │   ├── overflow-check.ts
│   │   │   │   └── schema-validator.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── search/                       # SHARED: Azure AI Search client
│   │   ├── src/
│   │   │   ├── client.ts             # Search client wrapper
│   │   │   ├── indexes/              # Index definitions
│   │   │   │   └── candidate-facts.ts
│   │   │   ├── query-builder.ts      # Hybrid semantic + keyword queries
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── storage/                      # SHARED: Azure Blob Storage client
│   │   ├── src/
│   │   │   ├── client.ts             # Blob storage wrapper
│   │   │   ├── urls.ts               # SAS URL generation
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── document-intelligence/        # SHARED: Azure Document Intelligence client
│   │   ├── src/
│   │   │   ├── client.ts             # Document Intelligence wrapper
│   │   │   ├── parsers/              # PDF/DOCX extraction logic
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── config/                       # SHARED: Environment configuration
│   │   ├── src/
│   │   │   ├── env.ts                # Zod-validated env schema
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/                       # SHARED: Cross-cutting utilities
│       ├── src/
│       │   ├── errors/               # Shared error types
│       │   ├── logging/              # Structured logger interface
│       │   ├── validation/           # Common validation helpers
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docs/
│   ├── system-architecture.md
│   ├── repository-structure.md
│   ├── domain-model.md
│   ├── ai-architecture.md
│   ├── azure-architecture.md
│   ├── data-flow.md
│   └── implementation-roadmap.md
│
├── infra/
│   ├── bicep/                        # Azure Bicep templates
│   │   ├── main.bicep
│   │   ├── modules/
│   │   │   ├── database.bicep
│   │   │   ├── storage.bicep
│   │   │   ├── container-apps.bicep
│   │   │   ├── ai-search.bicep
│   │   │   ├── openai.bicep
│   │   │   ├── keyvault.bicep
│   │   │   └── monitoring.bicep
│   │   └── parameters/
│   │       ├── dev.bicepparam
│   │       └── prod.bicepparam
│   └── scripts/
│       └── deploy.sh
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, typecheck, test
│       └── deploy.yml                # Deploy to the existing Azure Function App
│
├── packages.json                     # Root workspace config (Turborepo)
├── turbo.json                        # Turborepo pipeline config
├── tsconfig.json                     # Root TypeScript config
└── .env.example                      # Required environment variables
```

---

## Responsibility of Every Major Module

### `apps/web` — Next.js Frontend
- **Authentication UI** (OAuth via NextAuth.js, Azure AD B2C support)
- **Candidate Profile Editor** (forms for work experience, projects, skills, education)
- **Resume Upload** (drag-and-drop PDF/DOCX upload with progress)
- **Job Input** (text area for job descriptions, URL input for job postings)
- **Template Selection** (visual template picker with previews)
- **Generation Status** (real-time or polling status of resume generation runs)
- **Resume Preview** (rendered HTML preview of generated resume)
- **Fact Review Workflow** (UI for reviewing and approving AI-extracted facts)
- **Version History & Download** (list of generated resumes, download PDF)
- **Rule**: Never holds Azure credentials. All Azure interactions go through `apps/api`.

### `apps/api` — Fastify Backend
- **API Layer** (RESTful JSON API with OpenAPI/Swagger docs)
- **Candidate Profile Management** (CRUD, fact management, document processing orchestration)
- **Job Ingestion** (accept job text/URL, store, trigger analysis)
- **AI Orchestration** (coordinates AI workflow stages via `packages/ai`)
- **Retrieval Coordination** (delegates to `packages/search` for evidence retrieval)
- **Validation** (input validation, fact verification status checks)
- **Rendering Coordination** (delegates to `packages/rendering` for PDF generation)
- **Security** (JWT auth, authorization checks, PII handling)
- **Observability** (structured logging, correlation IDs, Application Insights)

### `packages/domain` — Domain Types & Schemas
- **Zero framework dependencies**.
- Defines all entities, DTOs, and validation schemas shared across the stack.
- Types like `CandidateProfile`, `CandidateFact`, `Job`, `ResumeVersion`, `GenerationRun`.
- Used by `apps/api`, `packages/ai`, `packages/db`, and `apps/web` (via type imports).

### `packages/db` — Database Layer
- **Drizzle ORM** schema definitions mapped to PostgreSQL.
- Schema files mirror the domain model: `candidate.ts`, `job.ts`, `resume.ts`, `template.ts`.
- Connection pooling and transaction helpers.
- Migration files (auto-generated by Drizzle Kit).
- **No business logic** — only persistence.

### `packages/ai` — AI Workflow Orchestration
- **Workflow Stages**: Explicit sequential stages (not autonomous agents).
- **Prompt Registry**: Versioned prompts stored as files, loaded at runtime.
- **Tool Definitions**: Interfaces for AI tools (`get_candidate_profile`, `search_evidence`, etc.).
- **LLM Client**: Abstract interface with Azure OpenAI implementation.
- **Structured Output Schemas**: JSON schemas enforced via Azure OpenAI structured outputs.
- **Rule**: Contains AI logic and prompt management, but NOT Azure SDK initialization (that lives in `apps/api` wiring).

### `packages/rendering` — Resume Rendering Engine
- **Template Definitions**: Each template = a schema (allowed sections, max lengths) + layout rules.
- **HTML Engine**: Renders structured resume JSON to HTML using template rules.
- **PDF Engine**: Converts HTML to PDF (Playwright/Puppeteer or PDFKit).
- **Layout Validators**: Check page overflow, section ordering, font constraints.
- **Rule**: LLM outputs structured JSON; rendering engine controls all visual output. LLM never touches CSS or layout.

### `packages/search` — Azure AI Search Integration
- **Index Definitions**: Schema for `candidate-facts` index.
- **Query Builder**: Constructs hybrid semantic + keyword queries.
- **Client Wrapper**: Thin wrapper around Azure AI Search SDK.
- Stores small, independently retrievable career facts — not whole resumes.

### `packages/storage` — Azure Blob Storage
- **Client Wrapper**: Upload, download, delete, generate SAS URLs.
- **URL Builder**: Time-limited SAS URLs for secure frontend download.
- Stores uploaded resumes, generated PDFs, template assets.

### `packages/document-intelligence` — Azure Document Intelligence
- **Client Wrapper**: PDF/DOCX extraction.
- **Parsers**: Convert extraction output into domain `CandidateFact` objects.
- Preserves source document locations (page numbers, bounding boxes).

### `packages/config` — Environment Configuration
- **Zod-validated env schema** with strict typing.
- Shared across all apps and packages.
- Validates Azure resource names, connection strings, model IDs at startup.

### `packages/shared` — Cross-Cutting Utilities
- **Error Types**: Base error classes used across the stack.
- **Logger Interface**: Structured logging contract (implementation in `apps/api`).
- **Validation Helpers**: Reusable validators (email, URL, date ranges).

---

## Dependency Direction

```
apps/web  ──►  apps/api
                  │
                  ├──► packages/ai
                  │       ├──► packages/domain
                  │       ├──► packages/search
                  │       └──► packages/config
                  │
                  ├──► packages/rendering
                  │       ├──► packages/domain
                  │       └──► packages/config
                  │
                  ├──► packages/db
                  │       └──► packages/domain
                  │
                  ├──► packages/storage
                  │       └──► packages/config
                  │
                  ├──► packages/document-intelligence
                  │       ├──► packages/domain
                  │       └──► packages/config
                  │
                  ├──► packages/domain
                  ├──► packages/config
                  └──► packages/shared

packages/domain  ◄──  (used by almost everything)
packages/config  ◄──  (used by everything that needs env)
packages/shared  ◄──  (used by everything)
```

**Key Rules**:
- `packages/domain` has **zero dependencies** on other packages.
- `packages/ai` depends on `packages/search` but NOT on `packages/rendering` or `packages/storage`.
- `packages/rendering` depends only on `packages/domain` and `packages/config`.
- `apps/web` never imports from `packages/ai`, `packages/search`, `packages/db`, or `packages/storage`.
- Azure SDK imports are confined to `packages/search`, `packages/storage`, `packages/document-intelligence`, and `packages/ai/llm/azure-openai.ts`.

---

## Rules Preventing Leakage

1. **No Azure SDK in `apps/web` or `packages/domain`**.
2. **No AI prompt strings in `apps/api` routes** — prompts live in `packages/ai/prompts/`.
3. **No database queries outside `packages/db` and `apps/api/services/`**.
4. **No blob storage logic outside `packages/storage`**.
5. **No search logic outside `packages/search`**.
6. **No rendering logic outside `packages/rendering`**.
7. **Frontend only talks to backend via HTTP** — no direct service calls.

---

## Early Interface Files (To Be Reorganized)

The following files were created during initial interface design and will be reorganized into the monorepo structure above:

- `lib/schema/candidate.ts` → `packages/domain/src/candidate/`
- `api/candidate/endpoints.ts` → `packages/domain/src/candidate/dto.ts`
- `api/candidate/service.ts` → `apps/api/src/services/candidate.service.ts`
- `api/candidate/repository.ts` → `packages/db/src/repositories/candidate.ts`
