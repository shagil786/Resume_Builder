# Tech Debt & Planned Work

## Known Tech Debt
1. ~~**Domain type duplication** — `types.ts` vs `candidate.ts` in `packages/domain/src/candidate/`. Need to consolidate.~~
2. ~~**Broken import paths** — `api/candidate/*` files import from non-existent `../../lib/schema/candidate`.~~
3. ~~**No apps exist** — `apps/web` and `apps/api` workspaces are in package.json but no directories have been created.~~
4. **In-memory service by default** — falls back to in-memory when no DATABASE_HOST is set, which is fine for dev but all data is lost on restart.

## What's Left To Do

### Wrap up the core platform
1. ~~**`packages/ai`** — AI workflow orchestration ✅~~
2. ~~**`packages/search`** — Azure AI Search client ✅~~
3. ~~**`packages/storage`** — Azure Blob Storage client ✅~~
4. ~~**`packages/document-intelligence`** — PDF/DOCX parsing client ✅~~
5. ~~**`packages/rendering`** — HTML → PDF template engine ✅~~
6. ~~**`packages/shared`** — Cross-cutting utilities ✅~~
7. ~~**Database wiring** — Docker compose, auto-migration, Drizzle-backed service ✅~~
8. ~~**API wiring** — All routes registered, generation + rendering endpoints ✅~~

### Still needed
9. **`apps/web`** — Next.js frontend
10. **CI/CD pipeline** — GitHub Actions
11. **Azure Bicep infrastructure** — deployment templates
12. **Evaluation framework** — test dataset for hallucination rate, template conformance
13. **End-to-end tests** — Playwright for browser flows, API tests for backend
14. **Document upload flow** — wire Document Intelligence + Blob Storage into the API upload endpoint
15. **Search index sync** — wire Azure AI Search into fact creation flow
16. **PDF generation** — add Playwright-based PDF output to the rendering service
17. **Auth** — authentication/authorization for API endpoints
