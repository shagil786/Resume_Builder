using '../main.bicep'

param environment = 'dev'
param containerImage = 'localhost/resume-builder/api:latest'
param postgresAdminPassword = readEnvironmentVariable('POSTGRES_ADMIN_PASSWORD')
