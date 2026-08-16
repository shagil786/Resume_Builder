#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-dev}"
RESOURCE_GROUP="resume-builder-${ENVIRONMENT}"
LOCATION="${2:-eastus}"
CONTAINER_IMAGE="${3:-localhost/resume-builder/api:latest}"

echo "Deploying to ${ENVIRONMENT} (${LOCATION})..."

az group create --name "${RESOURCE_GROUP}" --location "${LOCATION}"

az deployment group create \
  --resource-group "${RESOURCE_GROUP}" \
  --template-file infra/bicep/main.bicep \
  --parameters infra/bicep/parameters/"${ENVIRONMENT}".bicepparam \
  --parameters containerImage="${CONTAINER_IMAGE}" \
  --parameters postgresAdminPassword="$(openssl rand -base64 32)"

echo "Deployment complete."
