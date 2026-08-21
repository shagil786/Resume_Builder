# Tech Debt & Planned Work

Updated Aug 17, 2026 after full audit. Original items #9-#17 (web, CI/CD, bicep, upload, search sync, PDF, auth) are all DONE.

## Genuinely Open

### 1. Cover letter has no frontend (HIGH — hidden feature)
Backend fully works: `POST /:profileId/cover-letter` returns `{ coverLetter, html }`.
- Add `api.candidates.generateCoverLetter()` to `apps/web/src/lib/api.ts`
- Add UI entry point (button on /job page or new route) + preview/download
- ~1-2 hours of work

### 2. Template selection is visual-only (MEDIUM)
/templates page stores selection in local state only; generation ignores it.
Plumbing already exists end-to-end (`generate`/`render` accept `templateId`, DB persists it).
Note: html-engine deliberately uses ATS single-column layout for generated resumes regardless of template — decide whether template selection should influence ATS output or only preview rendering.
- Wire selectedTemplateId through job page → generate call
- Persist selection (localStorage or profile field)

### 3. CI gaps (MEDIUM)
- ci.yml does not run the API vitest suite or web Playwright tests
- No lint step exists anywhere (no eslint config)

### 4. Web app never deployed (MEDIUM)
deploy.yml builds apps/web as a compile check but deploys only the API function.
Decide hosting: Azure Static Web Apps / Container Apps / Vercel.

### 5. In-memory fallbacks (LOW, known tradeoff)
Auth users table is DB-backed now, but some services still fall back to Maps without DATABASE_HOST. Fine for dev; data loss on Function cold start if misconfigured in prod. Consider fail-fast in production when config missing.

### 6. Evaluation framework exists but isn't run in CI (LOW)
`packages/evaluation` CLI works against fixtures; could gate PRs on hallucination-rate thresholds once real LLM runs are affordable.

## Recently Completed (context for future sessions)
- Azure Functions deployment with esbuild bundling + zip deploy + remote build
- Key Vault secret loading via managed identity (no secrets in GitHub/env)
- Cookie auth migration (Bearer → HttpOnly cookie, SameSite=None cross-site)
- Rate limiting on auth endpoints (10/min, 429 + Retry-After)
- Security hardening: CSP headers, blob SDK auth, dependency audit fixes
- Fact review workflow (/facts page: verify/reject/needs-review per fact)
- Resume version persistence + history page linking to run previews
- ATS layout engine (single-column, Arial, standard headings) for generated resumes
- Source-history preservation fix (84aaa71): writer must not collapse employers/roles/dates
- Binary multipart fix (f829ce3): PDF uploads preserved as Buffer through function adapter
