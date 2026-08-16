param location string = resourceGroup().location
param environment string
param containerImage string
param dbEndpoint string
param dbName string
param storageAccountName string
param searchEndpoint string
param openAiEndpoint string
param docIntelEndpoint string
param keyVaultUri string

resource containerEnv 'Microsoft.App/managedEnvironments@2024-10-02-preview' = {
  name: 'resume-builder-env-${environment}'
  location: location
  properties: {
    appLogsConfiguration: { destination: 'log-analytics' }
  }
}

resource apiApp 'Microsoft.App/containerApps@2024-10-02-preview' = {
  name: 'resume-builder-api-${environment}'
  location: location
  properties: {
    managedEnvironmentId: containerEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3001
        traffic: [{ weight: 100, latestRevision: true }]
      }
      registries: []
      secrets: [
        { name: 'db-password', keyVaultUrl: '${keyVaultUri}secrets/postgres-admin-password', identity: 'system' }
        { name: 'db-user', keyVaultUrl: '${keyVaultUri}secrets/postgres-admin-username', identity: 'system' }
        { name: 'storage-key', keyVaultUrl: '${keyVaultUri}secrets/blob-account-key', identity: 'system' }
        { name: 'search-key', keyVaultUrl: '${keyVaultUri}secrets/search-admin-key', identity: 'system' }
        { name: 'openai-key', keyVaultUrl: '${keyVaultUri}secrets/azure-openai-key', identity: 'system' }
        { name: 'docintel-key', keyVaultUrl: '${keyVaultUri}secrets/document-intelligence-key', identity: 'system' }
        { name: 'jwt-secret', keyVaultUrl: '${keyVaultUri}secrets/jwt-secret', identity: 'system' }
      ]
    }
    template: {
      containers: [{
        name: 'api'
        image: containerImage
        resources: { cpu: 1, memory: '2Gi' }
        env: [
          { name: 'DATABASE_HOST', value: dbEndpoint }
          { name: 'DATABASE_PORT', value: '5432' }
          { name: 'DATABASE_NAME', value: dbName }
          { name: 'DATABASE_USER', secretRef: 'db-user' }
          { name: 'DATABASE_PASSWORD', secretRef: 'db-password' }
          { name: 'BLOB_ACCOUNT_NAME', value: storageAccountName }
          { name: 'BLOB_ACCOUNT_KEY', secretRef: 'storage-key' }
          { name: 'BLOB_CONTAINER', value: 'resumes' }
          { name: 'SEARCH_ENDPOINT', value: searchEndpoint }
          { name: 'SEARCH_KEY', secretRef: 'search-key' }
          { name: 'SEARCH_INDEX', value: 'candidate-facts' }
          { name: 'AZURE_OPENAI_ENDPOINT', value: openAiEndpoint }
          { name: 'AZURE_OPENAI_KEY', secretRef: 'openai-key' }
          { name: 'AZURE_OPENAI_DEPLOYMENT', value: 'gpt-4o' }
          { name: 'DOC_INTELLIGENCE_ENDPOINT', value: docIntelEndpoint }
          { name: 'DOC_INTELLIGENCE_KEY', secretRef: 'docintel-key' }
          { name: 'KEY_VAULT_URL', value: keyVaultUri }
          { name: 'DATABASE_SSL', value: 'true' }
          { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
        ]
      }]
      scale: {
        minReplicas: 1
        maxReplicas: 10
        rules: [{
          name: 'http'
          custom: { type: 'http', metadata: { concurrentRequests: '100' } }
        }]
      }
    }
  }
}

output url string = 'https://${apiApp.properties.configuration.ingress.fqdn}'
output principalId string = apiApp.identity.principalId
