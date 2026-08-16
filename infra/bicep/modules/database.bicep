param location string = resourceGroup().location
param environment string

@secure()
param postgresAdminPassword string

resource postgres 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: 'resume-builder-db-${environment}'
  location: location
  sku: { name: 'Standard_D2s_v3', tier: 'GeneralPurpose' }
  properties: {
    administratorLogin: 'postgres'
    administratorLoginPassword: postgresAdminPassword
    version: '16'
    storage: { storageSizeGB: 128 }
    backup: { backupRetentionDays: 35, geoRedundantBackup: 'Enabled' }
    highAvailability: { mode: 'ZoneRedundant' }
  }
}

output endpoint string = postgres.properties.fullyQualifiedDomainName
output name string = postgres.name
