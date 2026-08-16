# Resume Builder Project Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the current partially integrated Resume Builder into a type-safe, secure, persisted end-to-end MVP.

**Architecture:** Preserve the modular monolith: Next.js calls Fastify; Fastify owns authentication, authorization, orchestration, and API contracts; domain remains framework-free; PostgreSQL is the source of truth; Azure services are adapters behind package/service boundaries. Complete the existing vertical slice incrementally instead of replacing the architecture.

**Tech Stack:** TypeScript, Fastify, Next.js, PostgreSQL, Drizzle, Azure Key Vault, Azure OpenAI, Azure Blob Storage, Azure Document Intelligence, Azure AI Search, Playwright, Vitest, GitHub Actions, Bicep.

**Spec:** `README.md`, `docs/domain-model.md`, `docs/azure-architecture.md`, and the current project audit in the task conversation.

## Global Constraints

- No secret values may be logged, committed, placed in `.env.example`, GitHub Actions variables, or Bicep parameters.
- Production secrets must come from Azure Key Vault through managed identity/`DefaultAzureCredential`.
- Every candidate/profile/document/fact/generation route must enforce authenticated ownership.
- PostgreSQL is the source of truth; in-memory storage is test-only and must not silently be used in production.
- Every AI-generated factual claim must retain evidence references.
- Each task must add or update focused tests before implementation and run its verification commands.
- Preserve unrelated user changes already present in the working tree.

---

### Task 1: Restore repository typecheck and package build health

**Files:**
- Modify: `packages/db/src/repositories/*.ts`
- Modify: `packages/db/src/schema/*.ts`
- Modify: `packages/ai/src/tools/types.ts`
- Modify: `packages/ai/src/workflows/index.ts`
- Modify: `packages/ai/src/workflows/orchestrator.ts`
- Modify: `apps/api/src/routes/candidate.routes.ts`
- Modify: `apps/api/src/routes/document.routes.ts`
- Modify: `apps/api/src/services/candidate.db-service.ts`
- Modify: `apps/api/src/services/document.service.ts`
- Modify: `apps/web/package.json`
- Modify: `apps/web/tsconfig.json`
- Modify: root `tsconfig.json`, package scripts, and CI typecheck commands

**Interfaces:** Make repository create inputs explicitly include persistence-only fields such as `profileId`; make `GenerationStageLog` carry stage output or keep output local to the orchestrator; add Playwright test types as a web workspace dependency; ensure every workspace has a valid typecheck script.

- [ ] Add focused type-level/regression tests for repository input shapes and AI stage result handling.
- [ ] Run each workspace typecheck and record the first failing error group.
- [ ] Fix unused imports, missing Drizzle imports, domain/repository type mismatches, stage output handling, API request types, and Playwright dependency resolution.
- [ ] Run all workspace typechecks and the root build.

### Task 2: Complete persistence and relational loading

**Files:**
- Modify: `packages/db/src/repositories/candidate-profile.repository.ts`
- Modify: `packages/db/src/repositories/candidate-fact.repository.ts`
- Modify: `packages/db/src/repositories/source-document.repository.ts`
- Modify: `packages/db/src/repositories/unit-of-work.ts`
- Modify: `apps/api/src/services/candidate.db-service.ts`
- Modify: `apps/api/src/services/document.service.ts`
- Test: `apps/api/test/persistence.test.ts`

**Interfaces:** `DbCandidateProfileService` must create/update/delete records with complete typed inputs; profile reads must return related entities; document upload must receive the active DB and persist documents, facts, and provenance in one transaction boundary.

- [ ] Write failing persistence tests for profile relations, document metadata, fact provenance, and profile-scoped search.
- [ ] Implement relational reads and complete repository inputs.
- [ ] Inject the active DB into `DocumentService`.
- [ ] Ensure deletes and updates operate on the requested profile and return not-found errors correctly.
- [ ] Run persistence tests against the configured PostgreSQL test database.

### Task 3: Enforce authentication and ownership

**Files:**
- Modify: `apps/api/src/routes/auth.routes.ts`
- Modify: `apps/api/src/plugins/auth.ts`
- Modify: `apps/api/src/routes/candidate.routes.ts`
- Modify: `apps/api/src/routes/document.routes.ts`
- Modify: `apps/api/src/routes/generation.routes.ts`
- Modify: `apps/api/src/routes/rendering.routes.ts`
- Modify: `apps/api/src/routes/cover-letter.routes.ts`
- Modify: `apps/api/src/services/*`
- Test: `apps/api/test/authorization.test.ts`

**Interfaces:** Add one reusable ownership guard that resolves a profile and compares its `userId` to `request.userId`; route handlers must never trust a client-supplied `userId`.

- [ ] Write failing tests for cross-user profile reads, updates, deletes, uploads, renders, and generation.
- [ ] Replace plaintext in-memory auth with a persisted user repository and adaptive password hashing.
- [ ] Add ownership checks at the service/route boundary.
- [ ] Add request validation, rate limits, restricted CORS, and secure production defaults.
- [ ] Run authorization and auth tests.

### Task 4: Finish evidence ingestion and Search synchronization

**Files:**
- Modify: `apps/api/src/routes/document.routes.ts`
- Modify: `apps/api/src/services/document.service.ts`
- Modify: `apps/api/src/services/search-sync.service.ts`
- Modify: `apps/api/src/routes/candidate.routes.ts`
- Modify: `packages/document-intelligence/src/document-processor.ts`
- Test: `apps/api/test/document-flow.test.ts`

**Interfaces:** A successful upload must persist `SourceDocument`, extracted `CandidateFact`, and immutable `FactProvenance`, then synchronize those facts to Azure Search; status transitions must update Search safely.

- [ ] Write failing tests for valid PDF/DOCX upload, unsupported file rejection, persistence, provenance, and search sync.
- [ ] Add file size/content validation and safe blob names.
- [ ] Persist document and facts using the active DB transaction boundary.
- [ ] Sync newly created/updated facts and implement profile fact deletion.
- [ ] Verify against the real Azure Search index using non-secret diagnostics.

### Task 5: Connect real facts and persistence to AI generation

**Files:**
- Modify: `apps/api/src/routes/generation.routes.ts`
- Modify: `apps/api/src/services/generation.service.ts`
- Modify: `packages/ai/src/workflows/orchestrator.ts`
- Modify: `packages/ai/src/workflows/resume-writer.ts`
- Modify: `packages/db/src/repositories/*generation*`
- Modify: `packages/db/src/repositories/*job*`
- Test: `apps/api/test/generation-flow.test.ts`

**Interfaces:** Generation must load a profile’s verified/eligible facts, persist a Job and GenerationRun, produce a ResumeVersion with evidence references, and expose status/history.

- [ ] Write failing tests proving generation uses persisted facts rather than an empty array.
- [ ] Persist jobs, stage logs, token usage, costs, resume content, and status.
- [ ] Make stage failures stop the pipeline and produce a failed run rather than accessing undefined outputs.
- [ ] Implement generation status and version history endpoints.
- [ ] Run generation tests with a deterministic mocked LLM and one Azure OpenAI smoke test when configured.

### Task 6: Complete rendering and frontend vertical flow

**Files:**
- Modify: `apps/api/src/routes/rendering.routes.ts`
- Modify: `apps/web/src/app/*`
- Modify: `apps/web/src/lib/api.ts`
- Modify: `apps/web/src/lib/dashboard.ts`
- Test: `apps/web/test/app.test.ts`
- Test: `apps/api/test/rendering.test.ts`

**Interfaces:** Frontend pages must use authenticated API clients; preview/PDF/history must consume persisted ResumeVersions; dashboard must load real counts.

- [ ] Write failing browser/API tests for login, profile creation, upload, job generation, preview, PDF download, and history.
- [ ] Implement authenticated client state and profile editor.
- [ ] Connect upload and job forms to API routes.
- [ ] Render persisted resume content, not only `profile.summary`.
- [ ] Run API and Playwright tests with the required local services.

### Task 7: Secure Azure deployment and configuration drift

**Files:**
- Modify: `infra/bicep/main.bicep`
- Modify: `infra/bicep/modules/container-apps.bicep`
- Modify: `infra/bicep/modules/keyvault.bicep`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/deploy.yml`
- Modify: `deploy/Dockerfile.api`
- Modify: `.env.example`, `README.md`, `docs/azure-architecture.md`

**Interfaces:** Deployment supplies `KEY_VAULT_URL` and non-secret endpoints only; API runtime uses managed identity and Key Vault; no workflow or Bicep parameter contains secret values.

- [ ] Write deployment validation checks for required env names and absence of secret injection.
- [ ] Add managed identity and Key Vault Secrets User role assignment.
- [ ] Remove secret parameters and direct secret environment injection from Bicep/GitHub Actions.
- [ ] Align endpoint variable names with the API and include the config package in Docker builds.
- [ ] Run Bicep validation, Docker build, CI scripts, and a staging startup smoke test.

### Task 8: Production verification and project memory update

**Files:**
- Modify: `knowledge/PROJECT.md`
- Modify: `knowledge/ARCHITECTURE.md`
- Modify: `knowledge/TODO-TECH-DEBT.md`
- Modify: `README.md`
- Create: `docs/adr/0001-runtime-secrets-from-key-vault.md`

- [ ] Run the complete typecheck, build, unit, integration, and browser test suite.
- [ ] Verify Key Vault, PostgreSQL, Search, Blob, Document Intelligence, and OpenAI startup checks without printing secrets.
- [ ] Update project status and remaining risks from actual evidence.
- [ ] Record the Key Vault and managed identity decision as an ADR.
- [ ] Produce a final release-readiness checklist.
