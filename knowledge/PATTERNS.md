# Implementation Patterns

## Repository Pattern
All data access goes through repository interfaces. Each entity type has its own repository interface:
- `ICandidateProfileRepository`
- `ICandidateFactRepository`
- `IWorkExperienceRepository`
- `IProjectRepository`
- `ISkillRepository`
- `IEducationRepository`
- `ICertificationRepository`
- `ISourceDocumentRepository`
- `IFactProvenanceRepository`

All extend or follow `IBaseRepository<T, K>` with `findById`, `findAll`, `create`, `update`, `delete`.

## Unit of Work
`IUnitOfWork` wraps all repositories and provides `begin/commit/rollback/complete` for transaction management. The `IDatabaseContext` creates units of work via `createUnitOfWork()`.

## Service Layer
`ICandidateProfileService` defines all business operations. The service interface:
- Accepts typed request objects (from `endpoints.ts`)
- Returns typed response objects
- Emits events via `CandidateProfileEvents`
- Is configurable via `CandidateServiceConfig`
- Uses typed error codes (`CandidateServiceError`)

## API Contracts
Route definitions are declarative in `CANDIDATE_ROUTES` constant (pattern: `'METHOD /path'`). Each endpoint has corresponding request/response types. Validation rules are defined in `CANDIDATE_VALIDATION`.

## Domain Type Duplication
There are two sets of domain types:
- `packages/domain/src/candidate/types.ts` — simplified (early version)
- `packages/domain/src/candidate/candidate.ts` — full entities with all fields

The `index.ts` re-exports from `types.ts` only. When apps are built, the intended structure is to consolidate into `packages/domain/src/candidate/` with the full types from `candidate.ts`.
