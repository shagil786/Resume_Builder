param location string = resourceGroup().location
param environment string

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'resume-builder-ai-${environment}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'resume-builder-logs-${environment}'
  location: location
  properties: { retentionInDays: 30 }
}

output instrumentationKey string = appInsights.properties.InstrumentationKey
output workspaceId string = logAnalytics.id
