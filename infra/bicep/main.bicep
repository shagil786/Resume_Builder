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
    dbUser: 'postgres'
    dbPassword: postgresAdminPassword
    storageAccountName: storage.outputs.accountName
    storageAccountKey: storage.outputs.accountKey
    searchEndpoint: search.outputs.endpoint
    searchKey: search.outputs.adminKey
    openAiEndpoint: openai.outputs.endpoint
    openAiKey: openai.outputs.key
    docIntelEndpoint: docIntel.outputs.endpoint
    docIntelKey: docIntel.outputs.key
  }
}

output apiUrl string = containerApps.outputs.url
