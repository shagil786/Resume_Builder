param location string = resourceGroup().location
param environment string

resource openai 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: 'resume-builder-openai-${environment}'
  location: location
  kind: 'OpenAI'
  sku: { name: 'S0' }
  properties: {
    customSubDomainName: 'resume-builder-openai-${environment}'
    publicNetworkAccess: 'Enabled'
  }
}

resource gptDeployment 'Microsoft.CognitiveServices/accounts/deployments@2024-10-01' = {
  name: 'gpt-4o'
  parent: openai
  sku: { name: 'Standard', capacity: 1 }
  properties: {
    model: { format: 'OpenAI', name: 'gpt-4o', version: '2024-11-20' }
    raiPolicyName: 'Microsoft.Default'
  }
}

resource embeddingDeployment 'Microsoft.CognitiveServices/accounts/deployments@2024-10-01' = {
  name: 'text-embedding-ada-002'
  parent: openai
  sku: { name: 'Standard', capacity: 1 }
  properties: {
    model: { format: 'OpenAI', name: 'text-embedding-ada-002', version: '2' }
  }
}

output endpoint string = openai.properties.endpoint
