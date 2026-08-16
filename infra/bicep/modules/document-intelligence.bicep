param location string = resourceGroup().location
param environment string

resource docIntel 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: 'resume-builder-docintel-${environment}'
  location: location
  kind: 'FormRecognizer'
  sku: { name: 'S0' }
  properties: {
    customSubDomainName: 'resume-builder-docintel-${environment}'
    publicNetworkAccess: 'Enabled'
  }
}

output endpoint string = docIntel.properties.endpoint
