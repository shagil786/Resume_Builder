# Azure Function deployment artifact

The production API host is the existing Azure Function App `shagilnizami786-api` in resource group `rg-shagilnizami786-1129`.

The GitHub deployment workflow bundles `apps/api/src/function.ts`, packages it with the Azure Functions host metadata, and deploys it with zip deployment. Runtime secrets remain Key Vault references on the Function App; the workflow sets only non-secret application settings.

The Bicep files under `infra/bicep/` remain reusable infrastructure provisioning templates for isolated environments. They are not used to replace the existing production resources.
