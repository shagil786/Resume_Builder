param location string = resourceGroup().location
param environment string
param containerImage string
param dbEndpoint string
param dbName string
param dbUser string
param dbPassword string
param storageAccountName string
param storageAccountKey string
param searchEndpoint string
param searchKey string
param openAiEndpoint string
param openAiKey string
param docIntelEndpoint string
param docIntelKey string

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
        { name: 'db-password', value: dbPassword }
        { name: 'storage-key', value: storageAccountKey }
        { name: 'search-key', value: searchKey }
        { name: 'openai-key', value: openAiKey }
        { name: 'docintel-key', value: docIntelKey }
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
          { name: 'DATABASE_USER', value: dbUser }
          { name: 'DATABASE_PASSWORD', secretRef: 'db-password' }
          { name: 'BLOB_ACCOUNT_NAME', value: storageAccountName }
          { name: 'BLOB_ACCOUNT_KEY', secretRef: 'storage-key' }
          { name: 'BLOB_CONTAINER', value: 'resumes' }
          { name: 'SEARCH_ENDPOINT', value: searchEndpoint }
          { name: 'SEARCH_KEY', secretRef: 'search-key' }
          { name: 'SEARCH_INDEX', value: 'candidate-facts' }
          { name: 'OPENAI_ENDPOINT', value: openAiEndpoint }
          { name: 'OPENAI_KEY', secretRef: 'openai-key' }
          { name: 'DOC_INTELLIGENCE_ENDPOINT', value: docIntelEndpoint }
          { name: 'DOC_INTELLIGENCE_KEY', secretRef: 'docintel-key' }
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
