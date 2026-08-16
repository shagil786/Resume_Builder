param location string = resourceGroup().location
param environment string

resource search 'Microsoft.Search/searchServices@2023-11-01' = {
  name: 'resume-builder-search-${environment}'
  location: location
  sku: { name: 'standard' }
  properties: {
    replicaCount: 1
    partitionCount: 1
    hostingMode: 'default'
    semanticSearch: 'free'
  }
}

output endpoint string = 'https://${search.name}.search.windows.net'
