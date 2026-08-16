param location string = resourceGroup().location
param environment string

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'resumebuilderst${environment}'
  location: location
  kind: 'StorageV2'
  sku: { name: 'Standard_GRS' }
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  name: 'default'
  parent: storage
}

resource resumesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  name: 'resumes'
  parent: blobService
}

resource generatedContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  name: 'generated'
  parent: blobService
}

resource templatesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  name: 'templates'
  parent: blobService
}

output accountName string = storage.name
