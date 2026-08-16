# Azure Architecture

## Overview

This document records the Azure services used by the AI Resume Builder and distinguishes the existing production resources from future platform options.

---

## Azure Service Mapping

| Component | Azure Service | Purpose | Deployment Tier | Notes |
|-----------|---------------|---------|-----------------|-------|
| **Frontend** | Not provisioned by this repository | Web app hosting | External/managed separately | The repository contains the web client, but no Azure frontend resource was identified |
| **Backend API** | Azure Function App `shagilnizami786-api` | Fastify app through an HTTP-trigger adapter | Production | Existing resource in `rg-shagilnizami786-1129`; uses managed identity and Key Vault references |
| **Database** | Azure PostgreSQL Flexible Server | Production database | Prod | Encrypted, automated backups, read replicas planned |
| **Vector Search** | Azure AI Search | Semantic retrieval | Prod | Custom indexes for candidate facts |
| **Document Parsing** | Azure Document Intelligence | PDF/DOCX extraction | Prod | OCR + form recognition |
| **AI/LLM** | Azure OpenAI Service | Language model inference | Prod | GPT-4 with structured output, model versioning |
| **Storage** | Azure Blob Storage | File storage | Prod | Resumes, generated PDFs, templates |
| **Secrets** | Azure Key Vault | Secrets management | Prod | Connection strings, model keys, API tokens |
| **Monitoring** | Application Insights | Observability | All | Structured logging, metrics, alerts |
| **CDN** | Azure Front Door | Static asset delivery | Prod | Template images, previews |
| **Service Bus** | Azure Service Bus | Async messaging | Prod | Long-running generation workflows |

---

## Resource Configuration Strategy

### Production Environment
- **Resource Groups**: Dedicated resource groups for each environment
- **Managed Identity**: All services use managed identities — no shared keys
- **Network Isolation**: VNet integration for API-to-service communication
- **Backup & Recovery**: Point-in-time restore for PostgreSQL, geo-redundant storage for blobs
- **Disaster Recovery**: Active-active across multiple regions planned

### Development Environment
- **Local emulator support** for PostgreSQL, Cosmos DB (if used)
- **Docker-based development** with docker-compose for local testing
- **GitHub Actions** CI/CD pipeline with test, build, and deploy stages

---

## Service-to-Service Authentication

### Managed Identity Flow
```
Web client (hosting managed separately)
   ↓ (Managed Identity)
API (Azure Function App)
   ↓ (Managed Identity) 
   ├── PostgreSQL
   ├── AI Search
   ├── Document Intelligence
   ├── Blob Storage
   ├── Key Vault
   └── OpenAI Service
```

**Implementation Details**:
- The Function App uses its system-assigned managed identity
- Azure RBAC controls which identities have access to which resources
- Key Vault access policies gate secrets for services that need them
- No secrets in code or configuration files (except defaults)

---

## Azure Database for PostgreSQL

### Configuration
```json
{
  "server_version": "15",
  "tier": "general-purpose",
  "sku": "gp-general-purpose-standard-2",
  "storage_mb": 128000,
  "backup": {
    "enabled": true,
    "geo_redundant": true,
    "retention_days": 35
  },
  "high_availability": {
    "mode": "zone-redundant",
    "standby_count": 1
  },
  "network": {
    "ssl_enforcement": "Enabled",
    "vnet_integration": true,
    "firewall_rules": ["0.0.0.0/0", "AzureServices"]
  }
}
```

### Schema Strategy
- **Partitioning**: Candidate profiles partitioned by userId for performance
- **Materialized Views**: Pre-computed facts for evidence retrieval
- **Audit Triggers**: Automatic logging of all profile changes
- **Soft Delete**: Profiles marked as deleted instead of removed

---

## Azure AI Search Configuration

### Index Schema
```json
{
  "index_name": "candidate-facts",
  "vector_search": {
    "enabled": true,
    "dimension": 1536,
    "distance_metric": "cosine"
  },
  "fields": [
    {
      "name": "profileId",
      "type": "Edm.String",
      "filterable": true,
      "retrievable": true,
      "key": true
    },
    {
      "name": "factId",
      "type": "Edm.String",
      "filterable": true,
      "retrievable": true,
      "key": true
    },
    {
      "name": "text",
      "type": "Edm.String",
      "searchable": true,
      "retrievable": true,
      "analyzer": "standard.lucene"
    },
    {
      "name": "category",
      "type": "Edm.String",
      "filterable": true,
      "retrievable": true,
      "searchable": true
    },
    {
      "name": "status",
      "type": "Edm.String",
      "filterable": true,
      "retrievable": true
    },
    {
      "name": "embedding",
      "type": "Edm.Single",
      "vector_search_dimensions": 1536,
      "vector_search_profile": "factVectorProfile"
    },
    {
      "name": "sourceDocumentId",
      "type": "Edm.String",
      "filterable": true,
      "retrievable": true
    }
  ],
  "vector_search_profiles": [
    {
      "name": "factVectorProfile",
      "algorithm_configuration_name": "fact-vector-algorithm"
    }
  ],
  "semantic_search": {
    "enabled": true,
    "configurations": [
      {
        "name": "default-semantic-configuration",
        "prioritized_fields": {
          "title": ["text"],
          "content": ["text"],
          "author": []
        }
      }
    ]
  }
}
```

### Query Strategy
- **Exact match queries** for critical identifiers (profileId, factId)
- **Semantic search** for resume content matching
- **Hybrid search** combining vector similarity + keyword filtering
- **Filtered queries** by status, category for evidence retrieval

---

## Azure Document Intelligence

### OCR Processing Pipeline
1. **Input**: PDF/DOCX from user upload (Blob Storage)
2. **Process**: Document Intelligence analyze
3. **Output**: Structured JSON with:
   - Extracted text
   - Table detection
   - Section identification
   - Bounding boxes for OCR confidence
4. **Transform**: Convert to domain `CandidateFact` objects

### Model Configuration
```json
{
  "model": "prebuilt-document",
  "features": [
    "ocr",
    "layout",
    "table", 
    "form",
    "key-value-pairs"
  ],
  "output_format": "json",
  "ocr_accuracy_level": "high",
  "content_resolution": "high"
}
```

---

## Azure OpenAI Configuration

### Model Management
- **Primary Model**: GPT-4-32k for content generation
- **Embedding Model**: text-embedding-ada-002 for semantic search
- **Moderation**: Azure Content Safety for prompt injection prevention
- **Rate Limiting**: Token-based throttling to control costs

### Structured Output
```json
{
  "model": "gpt-4-32k",
  "temperature": 0.2,
  "max_tokens": 4000,
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "schema": {
        "type": "object",
        "properties": {
          "content": { "type": "string" },
          "facts": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "fact_id": { "type": "string" },
                "source_id": { "type": "string" }
              }
            }
          },
          "metadata": { "type": "object" }
        },
        "required": ["content", "facts"]
      }
    }
  }
}
```

---

## Blob Storage Configuration

### Container Structure
```
resume-builder/
├── raw/
│   ├── profiles/          # Original uploaded resumes (PDF/DOCX)
│   └── temp/              # Processing artifacts
├── processed/
│   ├── resumes/           # Generated PDFs
│   ├── previews/          # HTML previews
│   └── templates/         # Template assets
└── backups/               # Automated daily backups
```

### Access Control
- **Private containers** by default
- **SAS URLs** for time-limited access
- **Managed identity** for service-to-service access
- **Blob metadata** for tracking processing status

---

## Azure Key Vault Integration

### Secret Hierarchy
```
Keys/
├── ai/
│   ├── openai-api-key
│   ├── embedding-api-key
│   └── content-safety-key
├── databases/
│   └── postgresql-connection-string
├── storage/
│   └── blob-storage-key
├── search/
│   └── ai-search-api-key
└── monitoring/
    └── app-insights-instrumentation-key
```

### Access Policies
- **Services**: Managed identities for API, search, storage, AI services
- **Applications**: Service principal for CI/CD
- **Users**: Exception access through PowerShell/Bash or approved admin tool

---

## Application Insights Monitoring

### Custom Metrics
```typescript
// AI Workflow Metrics
export enum AIWorkflowMetrics {
  GENERATION_START = 'ai.generation.start',
  GENERATION_COMPLETE = 'ai.generation.complete',
  GENERATION_FAILURE = 'ai.generation.failure',
  VERIFICATION_START = 'ai.verification.start',
  VERIFICATION_COMPLETE = 'ai.verification.complete',
  TOKEN_USAGE = 'ai.token.usage',
  MODEL_SWITCH = 'ai.model.switch'
}

// Candidate Fact Metrics
export enum FactMetrics {
  UPLOAD = 'fact.upload',
  EXTRACTION = 'fact.extraction',
  VERIFICATION = 'fact.verification',
  REJECTION = 'fact.rejection'
}
```

### Alert Configuration
- **Generation failures** > 5% retry rate
- **Token usage** > $X per day
- **Validation failures** > 3% rejection rate
- **Storage quota** > 80% usage

---

## Network Configuration

### VNet Integration
```json
{
  "vnet": {
    "name": "resume-builder-vnet",
    "address_space": "10.0.0.0/16",
    "subnets": [
      {
        "name": "frontend-subnet",
        "address_prefix": "10.0.1.0/24"
      },
      {
        "name": "backend-subnet", 
        "address_prefix": "10.0.2.0/24",
        "service_endpoints": ["Microsoft.Storage", "Microsoft.Sql"]
      }
    ]
  },
  "firewall": {
    "enabled": true,
    "sku": "standard",
    "threat_intelligence_mode": "enabled"
  }
}
```

---

## Backup & Recovery Strategy

### PostgreSQL
- **Automated daily backups** to blob storage
- **Point-in-time restore** up to 35 days
- **Cross-region replication** for disaster recovery

### Blob Storage
- **Geo-redundant storage** (RA-GRS)
- **Lifecycle management** for cleanup of old generated resumes
- **Snapshot backup** for critical artifacts

### AI Search
- **Index snapshots** before major changes
- **Restoration scripts** for rapid recovery

---

## Cost Optimization

### Reserved Instances
- **1-year reservations** for PostgreSQL, OpenAI
- **Capacity reservations** for Container Apps

### Auto-scaling
- **Container Apps**: Based on CPU/memory or request rate
- **PostgreSQL**: Autoscaling storage, manual compute sizing
- **AI Search**: Pay-as-you-go, monitoring usage for optimization

### Storage Lifecycle
- **Raw resumes**: Delete after 30 days (if not processed)
- **Generated PDFs**: Keep 90 days, then archive to cooler storage
- **Backups**: Retain last 7 daily, last 4 weekly, last 12 monthly

---

## Security Controls

### Zero-Trust Network
- **Bastion host** for admin access
- **Private endpoints** for all Azure services
- **NSG rules** for service-to-service communication
- **DDoS protection** for web applications

### Data Classification
- **PII data**: Encrypted at rest, TLS 1.3 in transit
- **AI training data**: Isolated from production workloads
- **Audit logs**: Immutable, retained 365 days

### Compliance
- **ISO 27001** controls implemented
- **GDPR** compliance for EU data
- **SOC 2** Type II audit preparation

---

## Deployment Architecture

### CI/CD Pipeline
```
GitHub Actions
   ↓ (Build + Test)
Azure Function package
   ↓ (Zip deploy)
Azure Function App `shagilnizami786-api`
```

### Blue-Green Deployment
- **Blue environment**: Current production
- **Green environment**: New deployment with traffic shift
- **Canary testing**: 5% traffic to new version before full rollout
- **Rollback**: Instant rollback with traffic switch

---

## Infrastructure as Code

### Bicep Templates
```bicep
targetScope = 'resourceGroup'

@description('Unique identifier for all resources')
param environment string

resource azContainerApps 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'resume-builder-${environment}-app'
  location: resourceGroup().location
  properties: {
    managedIdentities: {
      userAssignedIdentities: []
    }
    template: {
      containers: [
        {
          name: 'api'
          image: 'acr.azurecr.io/resume-builder/api:latest'
          resources: {
            cpu: 0.5
            memory: '1Gi'
          }
        }
      ]
    }
  }
}
```

---

## Observability Integration

### Log Analytics
- **Custom log tables** for AI workflow execution
- **Log analytics queries** for performance monitoring
- **Alert rules** for anomaly detection

### Application Performance
- **Distributed tracing** with OpenTelemetry
- **Span correlation** across service boundaries
- **Performance baselines** for SLA monitoring

---

## Migration Strategy

### Existing-resource deployment
1. **Build and test** the API and web workspace
2. **Bundle** the Function HTTP adapter and runtime metadata
3. **Zip deploy** to the existing Function App
4. **Load secrets** through Key Vault references and managed identity

### Cutover Plan
1. **Pre-migration**: Backup all PostgreSQL data
2. **DNS switch**: Point the application domain to the selected frontend/API entrypoints
3. **Health checks**: API endpoints, database connectivity
4. **User testing**: Internal QA, beta testers
5. **Rollout**: Gradual traffic increase over 2 hours
6. **Monitoring**: 24-hour observation period

---

## Estimated Monthly Costs (Prod)
| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| Azure PostgreSQL | $200-500 | Depends on usage |
| Azure Function App | Consumption/plan-based | Existing API host |
| Azure AI Search | $50-150 | Query volume |
| Azure OpenAI | $500-2000 | Token usage |
| Blob Storage | $20-100 | File storage |
| Document Intelligence | $50-150 | OCR processing |
| Key Vault | $20-50 | Secrets |
| Monitoring | $30-80 | Application Insights |
| **Total** | **$970-3130** | **Variable based on usage** |

---

## Future Roadmap

### Phase 2 Enhancements
1. **Multi-region deployment** for high availability
2. **Azure Functions** for background processing
3. **Azure CDN** for static asset optimization
4. **Azure Front Door** for global routing

### Phase 3 Optimizations
1. **Azure Front Doors** for DDoS protection
2. **Azure Policy** for cost control
3. **Azure Monitor** action groups for alerting
4. **Azure Backup** for automated disaster recovery

---

This architecture provides a solid foundation for building and scaling the AI Resume Builder while maintaining security, observability, and cost-effectiveness.
