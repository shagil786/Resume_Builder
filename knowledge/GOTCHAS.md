# Gotchas

## Import Paths
The `api/candidate/` files import from `../../lib/schema/candidate` which does not exist. They were written as early interface stubs. The intended target is `packages/domain/src/candidate/`. See `repository-structure.md` lines 369-372 for the planned reorganization:
- `api/candidate/endpoints.ts` → `packages/domain/src/candidate/dto.ts`
- `api/candidate/service.ts` → `apps/api/src/services/candidate.service.ts`
- `api/candidate/repository.ts` → `packages/db/src/repositories/candidate.ts`

## Domain Types Index
`packages/domain/src/candidate/index.ts` only exports from `types.ts` (simplified version), NOT from `candidate.ts` (full version). When importing from this package, only the simplified types are available.

## init.ts
`commands/init.ts` references `cloned.mozart`, `cloned.typescript`, `cloned.eslint`, and `cloned.githubActions` — these appear to be stubs or from a scaffolding tool, not actual modules.

## docs vs. knowledge
Project documentation lives in `docs/` (user-facing docs). The `knowledge/` directory is for project memory / AI context.
