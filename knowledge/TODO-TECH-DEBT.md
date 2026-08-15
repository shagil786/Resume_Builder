# Tech Debt & Planned Work

## Known Tech Debt
1. **Domain type duplication** — `types.ts` vs `candidate.ts` in `packages/domain/src/candidate/`. Need to consolidate.
2. **Broken import paths** — `api/candidate/*` files import from non-existent `../../lib/schema/candidate`.
3. **Simplified Profile** — `types.ts` CandidateProfile is simplified (no nested entities); `candidate.ts` has the full version.
4. **No apps exist** — `apps/web` and `apps/api` workspaces are in package.json but no directories have been created.

## Planned Implementation Order
1. Create `apps/api` scaffold (Fastify server, middleware, routes)
2. Create `packages/db` with Drizzle schema and repositories
3. Consolidate domain types in `packages/domain`
4. Create `packages/ai` with workflow orchestration
5. Create `packages/search` (Azure AI Search client)
6. Create `packages/storage` (Azure Blob Storage client)
7. Create `packages/document-intelligence` (Azure Document Intelligence client)
8. Create `packages/rendering` (resume rendering engine)
9. Create `apps/web` (Next.js frontend)
10. Hook up CI/CD pipelines
