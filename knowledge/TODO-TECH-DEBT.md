# Tech Debt & Planned Work

Updated Aug 22, 2026. Items 1-4 below are DONE (cover letter UI ✅, template wiring ✅, CI suites ✅, web DEPLOYED ✅).

## Deployment (LIVE as of Aug 22, 2026)
- **Site**: https://salmon-sand-0b2bd040f.7.azurestaticapps.net (SWA `resume-builder-web`, Free SKU)
- **API**: https://shagilnizami786-api.azurewebsites.net (Azure Function)
- **Deploy from LOCAL** — GitHub Actions is billing-locked, so this is the path until resolved:
  ```bash
  cd apps/web
  BUILD_STATIC=true NEXT_PUBLIC_API_URL=https://shagilnizami786-api.azurewebsites.net/api/v1 npx next build
  NEXT_PUBLIC_API_URL=https://shagilnizami786-api.azurewebsites.net/api/v1 node scripts/swa-config.mjs
  npx @azure/static-web-apps-cli deploy ./out --deployment-token "$(az staticwebapp secrets list -n resume-builder-web -g rg-shagilnizami786-1129 --query properties.apiKey -o tsv)" --env production
  ```
- CORS_ORIGINS on the Function includes the SWA domain; auth cookie SameSite=None+Secure+HttpOnly verified working cross-site (register + /auth/me round-trip from live origin)
- GitHub Actions: ALL workflows fail instantly — account locked for billing (github.com/settings/billing). deploy-web.yml is committed and will work once unlocked.

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
