using '../main.bicep'

param environment = 'prod'
param location = 'eastus'
param containerImage = ''
param postgresAdminPassword = readEnvironmentVariable('POSTGRES_ADMIN_PASSWORD')
