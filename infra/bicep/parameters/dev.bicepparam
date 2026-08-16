using '../main.bicep'

param environment = 'dev'
param containerImage = 'localhost/resume-builder/api:latest'
param postgresAdminPassword = 'DevPassword123!'
