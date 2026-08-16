# AI Resume Builder

An **evidence-grounded resume compiler** that ingests candidate documents (PDF/DOCX), extracts structured career facts, analyzes job descriptions, and generates tailored resumes using AI. Built on Azure with a fact provenance model that prevents hallucination.

## Architecture

```
Upload Resume → Document Intelligence → Canonical Candidate Profile (facts with provenance)
Job URL/Text → Job Analyzer → Structured Requirements
     ↓
Evidence Retrieval (RAG) → Resume Strategy → Content Generation
     ↓
Fact Checker → Job-Match Evaluator → Structured Resume JSON
     ↓
Deterministic Template Renderer → Layout Validation → PDF/DOCX
```

**Key principle**: The LLM generates resume **content**, not layout. A deterministic template engine handles all visual output. Every factual claim traces back to source evidence.

## Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| **Monorepo** | Turborepo + npm workspaces | ✅ |
| **Domain** | TypeScript (zero framework deps) | ✅ |
| **Database** | PostgreSQL + Drizzle ORM | ✅ (schemas + repos) |
| **API** | Fastify v5 | ✅ (routes + service) |
| **Frontend** | Next.js 14 (App Router) | ⏳ |
| **AI** | Azure OpenAI (GPT-4-32k) | ⏳ |
| **Search** | Azure AI Search | ⏳ |
| **Storage** | Azure Blob Storage | ⏳ |
| **Document Processing** | Azure Document Intelligence | ⏳ |
| **Rendering** | HTML/Playwright → PDF | ⏳ |
| **Infrastructure** | Azure Bicep | ⏳ |

## Progress

- [x] Domain types (CandidateProfile, CandidateFact, Job, ResumeVersion, GenerationRun, etc.)
- [x] Drizzle ORM schemas (17 PostgreSQL tables with enums, FKs, indexes)
- [x] Database migration (auto-generated SQL)
- [x] Repository implementations for all entities
- [x] Fastify API server with candidate CRUD routes
- [x] In-memory service layer (swappable to DB-backed)
- [ ] Packages: ai, search, storage, document-intelligence, rendering, shared
- [ ] Next.js frontend
- [ ] Azure infrastructure (Bicep)
- [ ] CI/CD pipeline

## Project Structure

```
├── apps/
│   ├── api/              # Fastify backend server
│   │   └── src/
│   │       ├── index.ts         # Server entry point
│   │       ├── routes/          # Route handlers
│   │       ├── services/        # Business logic
│   │       └── plugins/         # Fastify plugins
│   └── web/              # Next.js frontend (placeholder)
│
├── packages/
│   ├── domain/           # Domain types (zero deps, shared everywhere)
│   │   └── src/
│   │       ├── candidate/      # CandidateProfile, Fact, WorkExperience, etc.
│   │       ├── job/            # Job, JobRequirement, JobAnalysis
│   │       ├── resume/         # ResumeVersion, ResumeContent, Strategy
│   │       ├── template/       # ResumeTemplate, FontStyle, TemplateSection
│   │       ├── generation/     # GenerationRun, StageLog, TokenUsage
│   │       └── common/         # Shared type aliases
│   │
│   └── db/               # Database layer (Drizzle ORM)
│       └── src/
│           ├── schema/         # 17 PostgreSQL table definitions
│           ├── repositories/   # Repository implementations
│           ├── migrations/     # Auto-generated SQL migrations
│           └── connection.ts   # DB connection factory
│
├── api/candidate/        # Early interface contracts (to be reorganized)
├── docs/                 # Architecture & design docs
└── knowledge/            # Project memory for AI context
```

## Prerequisites

- **Node.js** >= 20
- **Docker** (for PostgreSQL — optional, falls back to in-memory)
- **npm** >= 10

## Getting Started

```bash
# Install dependencies
npm install

# Authenticate for local Key Vault access
az login

# Run typecheck across all packages
npm run typecheck

# Start the API server (in-memory mode, no DB required)
npm run dev -w apps/api

# The server starts at http://localhost:3001
# Test it:
curl http://localhost:3001/health
```

### Azure Key Vault configuration

The API loads all application secrets at startup through `DefaultAzureCredential` and `SecretClient`. Local development uses the Azure CLI identity from `az login`; Azure-hosted deployments use the App Service/Container Apps managed identity. Secret values must never be placed in `.env`, `.env.example`, source code, or deployment logs.

Set `KEY_VAULT_URL` and the non-secret settings listed in `.env.example`. The following Key Vault secret names are required:

| Key Vault secret | Application setting |
|---|---|
| `postgres-admin-password` | `DATABASE_PASSWORD` |
| `postgres-admin-username` | `DATABASE_USER` |
| `azure-openai-key` | `AZURE_OPENAI_KEY` |
| `blob-account-key` | `BLOB_ACCOUNT_KEY` |
| `document-intelligence-key` | `DOC_INTELLIGENCE_KEY` |
| `search-admin-key` | `SEARCH_KEY` |
| `jwt-secret` | `JWT_SECRET` |

Grant the local developer or managed identity the `Key Vault Secrets User` role on the vault. The identity that creates or rotates secrets needs `Key Vault Secrets Officer`; runtime identities should not receive write access. In App Service, the same settings can alternatively be supplied as Key Vault references using the form `@Microsoft.KeyVault(SecretUri=https://<vault>.vault.azure.net/secrets/<secret-name>)`. The application still validates required secrets and fails clearly at startup when production configuration is incomplete.

### Database Setup (optional — for persisted data)

```bash
# Start PostgreSQL via Docker
docker compose up -d

# Start the API (auto-detects DATABASE_HOST and uses DB)
npm run dev -w apps/api

# The server will auto-run migrations on startup.
# Data persists in the Docker volume across restarts.
```

## API Endpoints

All candidate routes are under `/api/v1/candidates`:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create candidate profile |
| GET | `/:profileId` | Get profile |
| PATCH | `/:profileId` | Update profile |
| DELETE | `/:profileId` | Delete profile |
| POST | `/:profileId/experience` | Add work experience |
| POST | `/:profileId/projects` | Add project |
| POST | `/:profileId/skills` | Add skill |
| POST | `/:profileId/education` | Add education |
| POST | `/:profileId/certifications` | Add certification |
| POST | `/:profileId/facts/search` | Search candidate facts |
| PATCH | `/:profileId/facts/:factId/status` | Update fact verification status |
| GET | `/:profileId/facts/:factId/provenance` | Get fact provenance |

## Domain Model

The core innovation is a **fact provenance model**: every claim in a generated resume must trace back to a `CandidateFact` with an immutable `FactProvenance` record. This prevents hallucination by enforcing:

- **Every factual claim references source evidence** (uploaded resume, user input, LinkedIn, etc.)
- **Fact status lifecycle**: `EXTRACTED → NEEDS_REVIEW → VERIFIED | REJECTED`
- **Resume versions are immutable** after generation — changes create new versions
- **AI decisions are fully logged** (model version, prompt version, token usage, cost)

For the complete domain model, see `docs/domain-model.md`.

## Planned Work

1. `packages/ai` — multi-stage AI workflow (job analysis, evidence retrieval, resume writing, fact checking)
2. `packages/search` — Azure AI Search integration for semantic retrieval
3. `packages/storage` — Azure Blob Storage for documents
4. `packages/document-intelligence` — PDF/DOCX parsing
5. `packages/rendering` — deterministic HTML→PDF template engine
6. `apps/web` — Next.js frontend
7. Azure infrastructure (Bicep) + CI/CD
8. Evaluation framework (hallucination rate, template conformance, evidence coverage)

## License

MIT
