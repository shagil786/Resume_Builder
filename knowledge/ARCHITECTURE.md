# Architecture

## Module Boundaries
```
apps/web → HTTP → apps/api → packages/* (services, ai, db, rendering, etc.)
packages/domain ← used by almost everything (zero deps)
packages/config ← used by everything needing env vars
```

## Dependency Direction
- `packages/domain` → no dependencies
- `apps/api` → depends on all packages
- `apps/web` → only depends on `packages/domain` (types) and HTTP client to `apps/api`
- `packages/ai` → depends on `packages/search` but NOT on `packages/rendering` or `packages/storage`
- `packages/rendering` → depends only on `packages/domain` and `packages/config`

## Data Flow (planned)
```
Upload Document → Blob Storage → Document Intelligence → Extract Facts
                                                             ↓
Job Description → Job Analysis → Search Facts → Plan Strategy → Generate Content → Render PDF
```

## Key Design Decisions
1. **Fact Provenance Model**: Every claim in a resume must reference a `CandidateFact`. Facts have immutable provenance via `FactProvenance` (write-once).
2. **Resume Versioning**: Each generation creates a new `ResumeVersion` with auto-incrementing `versionNumber`. DRAFT → GENERATED → FINALIZED → ARCHIVED lifecycle.
3. **AI is not autonomous**: AI workflow has explicit sequential stages (not agents). Each stage logs to `GenerationStageLog`.
4. **LLM never touches CSS**: LLM outputs structured JSON; `packages/rendering` controls all visual output.
5. **Unit of Work pattern**: Transaction boundaries managed via `IUnitOfWork` interface across all repositories.

## Current Code Layout
- `packages/domain/src/candidate/` — core domain types and interfaces
  - `types.ts` — simplified CandidateFact & CandidateProfile (early version)
  - `candidate.ts` — full domain types with all entities (WorkExperience, ProjectEntry, Skill, etc.)
  - `index.ts` — re-exports from `types.ts`
- `api/candidate/` — early interface files to be reorganized
  - `endpoints.ts` — REST API contracts, route definitions, validation rules
  - `service.ts` — `ICandidateProfileService` interface, event types, config, errors
  - `repository.ts` — repository interfaces for all entities, `IUnitOfWork`, `IDatabaseContext`
