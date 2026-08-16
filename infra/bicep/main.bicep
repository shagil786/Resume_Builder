targetScope = 'resourceGroup'

param location string = resourceGroup().location
param environment string
param containerImage string
param postgresAdminPassword string

module database './modules/database.bicep' = {
  name: 'database'
  params: { location: location, environment: environment, postgresAdminPassword: postgresAdminPassword }
}

module storage './modules/storage.bicep' = {
  name: 'storage'
  params: { location: location, environment: environment }
}

module search './modules/search.bicep' = {
  name: 'search'
  params: { location: location, environment: environment }
}

module openai './modules/openai.bicep' = {
  name: 'openai'
  params: { location: location, environment: environment }
}

module docIntel './modules/document-intelligence.bicep' = {
  name: 'document-intelligence'
  params: { location: location, environment: environment }
}

module keyvault './modules/keyvault.bicep' = {
  name: 'keyvault'
  params: { location: location, environment: environment }
}

module monitoring './modules/monitoring.bicep' = {
  name: 'monitoring'
  params: { location: location, environment: environment }
}

module containerApps './modules/container-apps.bicep' = {
  name: 'container-apps'
  params: {
    location: location
    environment: environment
    containerImage: containerImage
    dbEndpoint: database.outputs.endpoint
    dbName: database.outputs.name
    storageAccountName: storage.outputs.accountName
    searchEndpoint: search.outputs.endpoint
    openAiEndpoint: openai.outputs.endpoint
    docIntelEndpoint: docIntel.outputs.endpoint
    keyVaultUri: keyvault.outputs.uri
  }
}

resource keyVaultSecretsUser 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceId('Microsoft.KeyVault/vaults', keyvault.outputs.name), containerApps.outputs.principalId, 'Key Vault Secrets User')
  scope: resourceId('Microsoft.KeyVault/vaults', keyvault.outputs.name)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: containerApps.outputs.principalId
    principalType: 'ServicePrincipal'
  }
}

output apiUrl string = containerApps.outputs.url
