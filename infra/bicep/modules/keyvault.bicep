param location string = resourceGroup().location
param environment string

resource vault 'Microsoft.KeyVault/vaults@2024-11-01' = {
  name: 'resume-builder-kv-${environment}'
  location: location
  properties: {
    sku: { name: 'standard', family: 'A' }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    softDeleteRetentionInDays: 7
  }
}

output name string = vault.name
output uri string = vault.properties.vaultUri
