// Azure Static Web Apps (Free) for the temporary azd deploy.
targetScope = 'resourceGroup'

@description('azd environment name, used in resource names.')
param environmentName string

@description('Region for the Static Web App resource (content is served from a global CDN).')
param location string = 'eastasia'

resource web 'Microsoft.Web/staticSites@2023-12-01' = {
  name: 'swa-mms-${environmentName}'
  location: location
  tags: { 'azd-service-name': 'web', 'azd-env-name': environmentName }
  sku: { name: 'Free', tier: 'Free' }
  properties: {}
}

output WEB_URI string = 'https://${web.properties.defaultHostname}'
