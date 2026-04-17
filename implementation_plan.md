# 🚀 DevOps End-to-End Learning Project: **TalentFlow** — A Job Portal Platform

> **Real-World Use Case**: A cloud-native Job Portal where job seekers apply for jobs, employers post listings, and a notification service keeps everyone informed. Simple enough to understand, complex enough to cover every DevOps concept.

---

## 🎯 Project Overview

**TalentFlow** is a microservices-based job portal built to be your DevOps learning sandbox. Every service is independently deployable, observable, and scalable — mirroring what you'd find in production at top tech companies.

| Layer | Technology | Purpose |
|---|---|---|
| Job Service | Java (Spring Boot) | Core job listing CRUD + search |
| User Service | Python (FastAPI) | Auth, profiles, JWT issuance |
| Notification Service | .NET (ASP.NET Core) | Email/SMS alerts via Kafka |
| Frontend | React (Vite) | Portal UI |
| API Gateway | NGINX / Kong | Single entry point |
| Message Broker | Apache Kafka | Async service communication |
| Relational DB | PostgreSQL | Jobs + Users data |
| Cache/NoSQL | Redis + MongoDB | Sessions + Application logs |
| CI/CD | GitHub Actions | Full pipeline automation |
| Container Runtime | Docker + Docker Compose | Local dev |
| Orchestration | Kubernetes (AKS / Minikube) | Production deploy |
| IaC | Terraform (Azure) | Cloud infra provisioning |
| Observability | Prometheus + Grafana + Jaeger + Loki | Full observability stack |
| Security | OWASP ZAP + Trivy + Azure Key Vault | DevSecOps |

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET / USERS                               │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ HTTPS
                          ┌─────────▼──────────┐
                          │    API Gateway      │  ← NGINX Ingress / Kong
                          │  (Rate Limiting,    │
                          │   Auth Routing)     │
                          └──────┬──────┬───────┘
                                 │      │
              ┌──────────────────┘      └──────────────────┐
              │                                            │
   ┌──────────▼──────────┐                    ┌───────────▼──────────┐
   │   React Frontend    │                    │    User Service       │
   │   (Vite + TypeScript│                    │    (Python/FastAPI)   │
   │    Port: 3000)       │                    │    Port: 8001         │
   └─────────────────────┘                    │    DB: PostgreSQL      │
                                              │    Cache: Redis        │
              ┌───────────────────────────────┤    JWT Auth            │
              │                               └─────────────┬─────────┘
   ┌──────────▼──────────┐                                  │
   │    Job Service       │                                  │ Kafka Events
   │   (Java/Spring Boot) │◄─────────────────────────────── ┤
   │    Port: 8080         │                                  │
   │    DB: PostgreSQL     │            ┌─────────────────────▼──────────────┐
   │    Search: Elasticsearch│          │    Notification Service             │
   └──────────────────────┘            │    (.NET / ASP.NET Core)            │
                                       │    Port: 8002                        │
              ┌────────────────────────│    Consumes Kafka Topics             │
              │ Kafka Events           │    Sends Email (SendGrid)            │
              ▼                        │    DB: MongoDB (notification logs)   │
   ┌──────────────────────┐            └──────────────────────────────────────┘
   │   Apache Kafka        │
   │   (Message Broker)    │
   │   Topics:             │
   │   - job.posted        │
   │   - user.registered   │
   │   - application.sent  │
   └──────────────────────┘

                         ┌──────────────────────────────────────────┐
                         │           OBSERVABILITY STACK            │
                         │                                          │
                         │   Prometheus → Grafana  (Metrics)        │
                         │   Loki → Grafana        (Logs)           │
                         │   Jaeger / OpenTelemetry (Traces)        │
                         │   AlertManager           (Alerts)        │
                         └──────────────────────────────────────────┘
```

---

## 📁 Repository Folder Structure

```
talentflow/
├── 📄 README.md
├── 📄 docker-compose.yml               ← Local dev: all services
├── 📄 docker-compose.monitoring.yml    ← Prometheus/Grafana/Loki/Jaeger
├── 📄 .env.example
│
├── 📂 services/
│   ├── 📂 job-service/                 ← Java / Spring Boot
│   │   ├── src/
│   │   │   ├── main/java/com/talentflow/job/
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── model/
│   │   │   │   ├── dto/
│   │   │   │   ├── kafka/
│   │   │   │   └── config/
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── application-docker.yml
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── .github/                    ← Service-level CI hints
│   │
│   ├── 📂 user-service/                ← Python / FastAPI
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   └── v1/
│   │   │   │       ├── endpoints/
│   │   │   │       └── router.py
│   │   │   ├── core/
│   │   │   │   ├── config.py
│   │   │   │   ├── security.py         ← JWT
│   │   │   │   └── database.py
│   │   │   ├── models/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   └── main.py
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── pyproject.toml
│   │
│   ├── 📂 notification-service/        ← .NET / ASP.NET Core
│   │   ├── src/
│   │   │   └── NotificationService/
│   │   │       ├── Controllers/
│   │   │       ├── Services/
│   │   │       ├── Consumers/          ← Kafka consumers
│   │   │       ├── Models/
│   │   │       └── Program.cs
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── NotificationService.sln
│   │
│   └── 📂 frontend/                    ← React / Vite / TypeScript
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/               ← API clients per service
│       │   ├── store/                  ← Zustand state management
│       │   └── App.tsx
│       ├── Dockerfile
│       ├── nginx.conf                  ← Serve static + proxy
│       └── package.json
│
├── 📂 infrastructure/
│   ├── 📂 terraform/                   ← Azure IaC
│   │   ├── modules/
│   │   │   ├── aks/                    ← AKS cluster
│   │   │   ├── acr/                    ← Azure Container Registry
│   │   │   ├── postgresql/             ← Azure DB for PostgreSQL
│   │   │   ├── kafka/                  ← Azure Event Hubs (Kafka compatible)
│   │   │   ├── keyvault/               ← Azure Key Vault
│   │   │   ├── monitoring/             ← Azure Monitor
│   │   │   └── networking/             ← VNet, Subnets, NSGs
│   │   ├── environments/
│   │   │   ├── dev/
│   │   │   └── prod/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── backend.tf                  ← Azure Blob remote state
│   │
│   └── 📂 ansible/                     ← Optional: VM configuration
│       └── playbooks/
│
├── 📂 k8s/                             ← Kubernetes manifests
│   ├── 📂 namespaces/
│   │   └── talentflow-namespace.yaml
│   ├── 📂 job-service/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── hpa.yaml
│   │   └── configmap.yaml
│   ├── 📂 user-service/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── hpa.yaml
│   │   └── configmap.yaml
│   ├── 📂 notification-service/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── configmap.yaml
│   ├── 📂 frontend/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── 📂 kafka/
│   │   └── kafka-statefulset.yaml
│   ├── 📂 ingress/
│   │   └── ingress.yaml                ← NGINX Ingress + TLS
│   ├── 📂 secrets/
│   │   └── external-secrets.yaml       ← Pull from Azure Key Vault
│   └── 📂 monitoring/
│       ├── prometheus/
│       ├── grafana/
│       └── loki/
│
├── 📂 .github/
│   └── workflows/
│       ├── ci-job-service.yml
│       ├── ci-user-service.yml
│       ├── ci-notification-service.yml
│       ├── ci-frontend.yml
│       └── cd-deploy.yml               ← Deploy to AKS
│
├── 📂 observability/
│   ├── prometheus/
│   │   └── prometheus.yml
│   ├── grafana/
│   │   ├── dashboards/
│   │   │   ├── services-overview.json
│   │   │   └── kubernetes-overview.json
│   │   └── datasources/
│   ├── loki/
│   │   └── loki-config.yaml
│   └── jaeger/
│       └── jaeger-all-in-one.yaml
│
└── 📂 docs/
    ├── architecture.md
    ├── local-setup.md
    ├── ci-cd-guide.md
    ├── kubernetes-guide.md
    └── terraform-guide.md
```

---

## 🔧 Tools & Technologies — Why Each Was Chosen

### Services

| Tool | Why |
|---|---|
| **Spring Boot (Java)** | Industry standard for enterprise microservices; JPA, Kafka integration baked in |
| **FastAPI (Python)** | Modern async Python API; excellent for auth/user services; auto OpenAPI docs |
| **ASP.NET Core (.NET)** | High performance; great Kafka consumer libraries; common in enterprises |
| **React + Vite** | Fast, modern frontend; industry standard for SPAs |

### Messaging & Data

| Tool | Why |
|---|---|
| **Apache Kafka** | Battle-tested async messaging; decouples services; learn at-least-once delivery |
| **PostgreSQL** | ACID-compliant; used in 80%+ of production systems |
| **Redis** | Session caching, rate limiting, pub/sub |
| **MongoDB** | Document store for flexible notification logs |

### DevOps Stack

| Tool | Why |
|---|---|
| **Docker** | Containerize everything; learn image layers, multi-stage builds |
| **Docker Compose** | Local dev orchestration; replicate prod locally |
| **GitHub Actions** | Cloud-native CI/CD; YAML pipelines; free for public repos |
| **Terraform** | Industry-standard IaC; Azure provider is mature |
| **Kubernetes (AKS)** | Production container orchestration; Deployments, HPA, Ingress, Secrets |
| **NGINX Ingress** | L7 routing, SSL termination, path-based routing |
| **Helm** | K8s package manager; manage complex app deployments |

### Observability

| Tool | Why |
|---|---|
| **Prometheus** | Pull-based metrics; standard for K8s monitoring |
| **Grafana** | Rich dashboards; connects to Prometheus, Loki, Jaeger |
| **Loki** | Log aggregation without indexing cost; Grafana-native |
| **Jaeger / OpenTelemetry** | Distributed tracing; see requests flow across services |
| **AlertManager** | Route alerts to Slack, PagerDuty, email |

### Security

| Tool | Why |
|---|---|
| **JWT + OAuth2** | Stateless auth; industry standard; learn token lifecycle |
| **Trivy** | Container vulnerability scanning in CI pipeline |
| **OWASP ZAP** | DAST scanning; find runtime security issues |
| **Azure Key Vault + External Secrets Operator** | Zero hardcoded secrets; real-world secrets management |

---

## 📋 Step-by-Step Implementation Plan

### 🟢 Phase 1 — Local Foundation (Week 1–2)

**Goal:** Get all services running locally with Docker Compose.

#### Step 1.1 — Project Scaffolding
```bash
# Create monorepo structure
mkdir talentflow && cd talentflow
git init
# Create service directories
mkdir -p services/{job-service,user-service,notification-service,frontend}
mkdir -p infrastructure/{terraform,ansible}
mkdir -p k8s .github/workflows observability docs
```

#### Step 1.2 — User Service (Python / FastAPI)
```python
# Key endpoints to implement:
POST /api/v1/auth/register    # User registration → publishes user.registered Kafka event
POST /api/v1/auth/login       # Login → returns JWT token
GET  /api/v1/users/me         # Get profile (JWT protected)
PUT  /api/v1/users/me         # Update profile
```
- Use **SQLAlchemy** + Alembic migrations with PostgreSQL
- Implement **JWT** with python-jose
- Add Redis for session blacklisting on logout

#### Step 1.3 — Job Service (Java / Spring Boot)
```java
// Key endpoints:
POST   /api/v1/jobs           // Create job (employer only)
GET    /api/v1/jobs           // List with pagination + filters
GET    /api/v1/jobs/{id}      // Job details
POST   /api/v1/jobs/{id}/apply // Apply for job → publishes application.sent event
DELETE /api/v1/jobs/{id}      // Delete job
```
- Use **Spring Data JPA** + Flyway migrations
- Publish Kafka events via Spring Kafka
- Add OpenAPI (Springdoc)

#### Step 1.4 — Notification Service (.NET / ASP.NET Core)
```csharp
// Kafka Consumer Topics:
- user.registered  → Send welcome email
- application.sent → Notify employer
- job.posted       → Notify matching job seekers
```
- Use **Confluent.Kafka** for consumer
- Store notification logs in MongoDB
- Use SendGrid SDK (or mock SMTP) for email

#### Step 1.5 — Frontend (React / Vite)
- Pages: Login, Register, Job List, Job Detail, Apply, Dashboard
- Use **Axios** for API calls
- Use **React Query** for server state
- Use **Zustand** for auth state (JWT storage)

#### Step 1.6 — Docker Compose (Full Stack)
```yaml
# docker-compose.yml services:
- postgres (shared or separate per service)
- redis
- mongodb
- kafka + zookeeper
- user-service
- job-service
- notification-service
- frontend
- nginx (API gateway routing)
```

**✅ Milestone 1**: Run `docker-compose up` and have all services talk to each other.

---

### 🟡 Phase 2 — CI/CD Pipelines (Week 3–4)

**Goal:** Every `git push` automatically builds, tests, scans, and publishes Docker images.

#### Step 2.1 — GitHub Actions: Per-Service CI
Each service gets its own workflow file triggered on `push` to its path:

```yaml
# .github/workflows/ci-job-service.yml
name: CI - Job Service
on:
  push:
    paths: ['services/job-service/**']

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 21
        uses: actions/setup-java@v4
      - name: Build & Test
        run: mvn clean test
      - name: Publish Test Report
        uses: dorny/test-reporter@v1
      - name: SAST Scan (SpotBugs)
        run: mvn spotbugs:check
      - name: Build Docker Image
        run: docker build -t job-service:${{ github.sha }} .
      - name: Trivy Vulnerability Scan
        uses: aquasecurity/trivy-action@master
      - name: Push to Azure Container Registry
        run: docker push $ACR_URL/job-service:${{ github.sha }}
```

#### Step 2.2 — SAST (Static Analysis)
| Service | Tool |
|---|---|
| Java | SpotBugs + OWASP Dependency Check |
| Python | Bandit + Safety |
| .NET | Security Code Scan |
| All | SonarCloud (free for public repos) |

#### Step 2.3 — DAST (Dynamic Analysis)
```yaml
# After deploy to staging:
- name: OWASP ZAP DAST Scan
  uses: zaproxy/action-full-scan@v0.10.0
  with:
    target: 'https://staging.talentflow.example.com'
```

#### Step 2.4 — CD Pipeline
```yaml
# .github/workflows/cd-deploy.yml
# Triggered after all CI jobs pass on main branch
- Login to Azure (OIDC)
- Set kubectl context to AKS
- Update image tags in K8s manifests (Kustomize)
- kubectl apply -f k8s/
- Wait for rollout
- Run smoke tests
```

**✅ Milestone 2**: PR merges trigger full build → test → scan → deploy automatically.

---

### 🔵 Phase 3 — Kubernetes Deployment (Week 5–6)

**Goal:** Run TalentFlow on Kubernetes with proper resource management.

#### Step 3.1 — Minikube Local K8s
```bash
minikube start --cpus=4 --memory=8g --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server
```

#### Step 3.2 — Kubernetes Manifests

**Deployment (job-service example):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: job-service
  namespace: talentflow
spec:
  replicas: 2
  selector:
    matchLabels:
      app: job-service
  template:
    spec:
      containers:
      - name: job-service
        image: talentflowacr.azurecr.io/job-service:latest
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: job-service-config
        - secretRef:
            name: job-service-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
```

**HPA (Autoscaling):**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: job-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: job-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**Ingress:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: talentflow-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
  - host: talentflow.example.com
    http:
      paths:
      - path: /api/jobs(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: job-service
            port:
              number: 8080
      - path: /api/users(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: user-service
            port:
              number: 8001
```

#### Step 3.3 — Secrets Management
```yaml
# External Secrets Operator pulls from Azure Key Vault
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: azure-keyvault
    kind: ClusterSecretStore
  target:
    name: db-credentials
  data:
  - secretKey: POSTGRES_PASSWORD
    remoteRef:
      key: postgres-password
```

**✅ Milestone 3**: All services running on K8s with auto-scaling and proper secrets.

---

### 🟠 Phase 4 — Infrastructure as Code (Week 7)

**Goal:** Provision all Azure infrastructure with Terraform.

#### Step 4.1 — Terraform Modules

```hcl
# infrastructure/terraform/main.tf
module "networking" {
  source              = "./modules/networking"
  resource_group_name = var.resource_group_name
  location            = var.location
  vnet_cidr           = "10.0.0.0/16"
}

module "acr" {
  source              = "./modules/acr"
  name                = "talentflowacr"
  resource_group_name = var.resource_group_name
  sku                 = "Standard"
}

module "aks" {
  source              = "./modules/aks"
  cluster_name        = "talentflow-aks"
  node_count          = 3
  vm_size             = "Standard_D2s_v3"
  acr_id              = module.acr.id
}

module "postgresql" {
  source   = "./modules/postgresql"
  name     = "talentflow-pg"
  sku_name = "B_Standard_B1ms"
}

module "keyvault" {
  source = "./modules/keyvault"
  name   = "talentflow-kv"
}
```

#### Step 4.2 — Remote State Backend
```hcl
# backend.tf
terraform {
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "talentflowtfstate"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
  }
}
```

#### Step 4.3 — Terraform CI/CD
```yaml
# Terraform pipeline in GitHub Actions:
- terraform fmt -check
- terraform validate
- terraform plan (on PR)
- terraform apply (on merge to main)
- Infracost (cost estimation on PR)
```

**✅ Milestone 4**: One `terraform apply` provisions all Azure infrastructure.

---

### 🔴 Phase 5 — Observability (Week 8)

**Goal:** See everything happening inside your system.

#### Step 5.1 — Metrics (Prometheus + Grafana)

**Instrument services:**
```python
# FastAPI (user-service) - add prometheus_fastapi_instrumentator
from prometheus_fastapi_instrumentator import Instrumentator
Instrumentator().instrument(app).expose(app)
```

```java
// Spring Boot (job-service) - add micrometer dependency
// application.yml:
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

**Grafana Dashboard — Key Panels:**
- Request rate per service (RPS)
- P50/P95/P99 latency
- Error rate by endpoint
- Pod CPU/Memory usage
- Kafka consumer lag
- PostgreSQL active connections

#### Step 5.2 — Logging (Loki + Promtail)

```yaml
# Structured logging format (all services):
{
  "timestamp": "2026-04-16T12:00:00Z",
  "level": "INFO",
  "service": "job-service",
  "traceId": "abc123",
  "spanId": "def456",
  "message": "Job created successfully",
  "jobId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Step 5.3 — Distributed Tracing (OpenTelemetry + Jaeger)

```python
# user-service: instrument with OpenTelemetry
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter

FastAPIInstrumentor.instrument_app(app)
```

**Trace Flow Example:**
```
Browser → Ingress → User Service → (JWT valid) → Job Service → Kafka → Notification Service
  └─ TraceID: abc123 propagated across ALL hops via HTTP headers
```

#### Step 5.4 — Alerting
```yaml
# AlertManager rules:
- Error rate > 5% for 2 minutes → PagerDuty
- Pod restart > 3 times → Slack
- Kafka consumer lag > 1000 → Slack
- CPU > 80% sustained → PagerDuty
```

**✅ Milestone 5**: Full observability — metrics, logs, traces visible in Grafana.

---

### ⚫ Phase 6 — Advanced Concepts (Week 9–10)

**Goal:** Production-grade deployment strategies and service mesh.

#### Step 6.1 — Canary Deployments
```yaml
# Using Argo Rollouts or NGINX weight-based routing:
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: job-service
spec:
  strategy:
    canary:
      steps:
      - setWeight: 10    # 10% traffic to new version
      - pause: {duration: 5m}
      - setWeight: 50    # 50% traffic
      - pause: {duration: 5m}
      - setWeight: 100   # Full rollout
      canaryMetadata:
        labels:
          deployment: canary
      stableMetadata:
        labels:
          deployment: stable
```

#### Step 6.2 — Blue-Green Deployments
```bash
# Two production environments (blue/green)
# Switch traffic via Ingress label selector after health checks pass
kubectl patch ingress talentflow-ingress --patch '
{
  "spec": {
    "rules": [{"http": {"paths": [{"backend": {"service": {"name": "job-service-green"}}}]}}]
  }
}'
```

#### Step 6.3 — Service Mesh (Istio — Optional)
```bash
# Install Istio
istioctl install --set profile=demo
kubectl label namespace talentflow istio-injection=enabled

# Benefits you get for FREE:
# - mTLS between all services
# - Fine-grained traffic control
# - Circuit breaking
# - Retries / timeouts declaratively
```

#### Step 6.4 — API Gateway (Kong)
```yaml
# Kong routes all traffic with:
- Rate limiting (100 req/min per user)
- JWT validation at gateway (no service re-validation needed)
- Request/Response transformation
- CORS handling
```

**✅ Milestone 6**: Zero-downtime canary deploys with full observability.

---

## 🔐 Security Implementation Details

### JWT Flow
```
1. User POSTs /api/v1/auth/login
2. User Service validates credentials
3. User Service returns:
   - access_token (15 min expiry, signed with RS256)
   - refresh_token (7 days, stored in Redis)
4. Frontend stores access_token in memory (NOT localStorage)
5. Frontend sends Authorization: Bearer <token> header
6. API Gateway OR each service validates token signature
7. On 401, frontend uses refresh_token to get new access_token
```

### Secrets Management
```
Local Dev:     .env files (gitignored)
CI/CD:         GitHub Actions Secrets
Kubernetes:    External Secrets Operator → Azure Key Vault
               (pods NEVER have Azure credentials)
Database:      Rotating passwords via Key Vault + ESO
```

### DevSecOps Pipeline Gates
```
1. SAST → fail if critical issues found
2. Dependency scan → fail if HIGH CVEs found
3. Container scan (Trivy) → fail if critical CVEs
4. DAST → run against staging, report to security dashboard
5. IaC scan (Checkov) → fail if Terraform misconfigs
```

---

## 📚 Learning Milestones

### 🟢 Beginner (Week 1–2)
- [ ] Understand microservices vs monolith
- [ ] Build and run each service locally
- [ ] Write Dockerfiles (multi-stage builds)
- [ ] Run full stack with `docker-compose up`
- [ ] Understand synchronous (REST) vs async (Kafka) communication

**Skills gained**: Docker, REST APIs, multi-language development, Kafka basics

---

### 🟡 Intermediate (Week 3–4)
- [ ] Write GitHub Actions CI pipeline for each service
- [ ] Understand SAST/DAST and container scanning
- [ ] Push images to Azure Container Registry
- [ ] Write Kubernetes manifests (Deployment, Service, ConfigMap)
- [ ] Deploy to Minikube locally

**Skills gained**: CI/CD, security scanning, Kubernetes basics, image registries

---

### 🔵 Advanced-Intermediate (Week 5–6)
- [ ] Configure Kubernetes Ingress with path routing
- [ ] Implement HPA (autoscaling based on CPU)
- [ ] Set up External Secrets Operator with Azure Key Vault
- [ ] Implement readiness/liveness probes
- [ ] Write Helm charts for your services

**Skills gained**: Production K8s patterns, secrets management, Helm

---

### 🟠 Advanced (Week 7–8)
- [ ] Provision Azure infrastructure with Terraform
- [ ] Set up remote Terraform state in Azure Blob
- [ ] Terraform CI with plan on PR, apply on merge
- [ ] Deploy full observability stack (Prometheus/Grafana/Loki/Jaeger)
- [ ] Create custom Grafana dashboards
- [ ] Set up AlertManager → Slack notifications

**Skills gained**: IaC, cloud provisioning, full observability

---

### 🔴 Expert (Week 9–10)
- [ ] Implement canary deployments with Argo Rollouts
- [ ] Set up blue-green deployment strategy
- [ ] Configure Istio service mesh (mTLS, traffic management)
- [ ] Implement API Gateway (Kong/NGINX) with rate limiting
- [ ] Chaos engineering (Chaos Monkey / LitmusChaos)
- [ ] Cost optimization with Kubernetes resource quotas

**Skills gained**: Advanced deployment strategies, service mesh, chaos engineering

---

## 🗺️ Job-Readiness Checklist

After completing this project, you will be able to discuss and demonstrate:

| Topic | What You Can Show |
|---|---|
| **CI/CD** | Multi-stage pipelines, automated testing, security gates, image builds |
| **Docker** | Multi-stage Dockerfiles, docker-compose, image optimization |
| **Kubernetes** | Deployments, Services, Ingress, HPA, ConfigMaps, Secrets, RBAC |
| **Terraform** | Modular IaC, remote state, AKS/ACR/PostgreSQL provisioning |
| **Observability** | Prometheus metrics, Grafana dashboards, distributed tracing |
| **Security** | JWT auth, secrets management, SAST/DAST in pipeline |
| **Microservices** | Service decomposition, async messaging, database-per-service |
| **Cloud (Azure)** | AKS, ACR, Key Vault, PostgreSQL, Event Hubs |

---

## 🚀 Quick Start Commands

```bash
# 1. Clone and setup
git clone https://github.com/yourusername/talentflow
cd talentflow
cp .env.example .env

# 2. Start full stack locally
docker-compose up -d

# 3. Access services
# Frontend:       http://localhost:3000
# Job Service:    http://localhost:8080/swagger-ui.html
# User Service:   http://localhost:8001/docs
# Notification:   http://localhost:8002/swagger
# Grafana:        http://localhost:3001
# Jaeger:         http://localhost:16686
# Kafka UI:       http://localhost:8090

# 4. Deploy to Minikube
kubectl apply -f k8s/namespaces/
kubectl apply -f k8s/

# 5. Provision Azure (requires az login + terraform)
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

---

## 📅 Recommended Implementation Order

```
Week 1:  User Service (FastAPI) + PostgreSQL + Redis + JWT
Week 2:  Job Service (Spring Boot) + Kafka producer + Apply flow
Week 3:  Notification Service (.NET) + Kafka consumer + MongoDB
Week 4:  Frontend (React) + Docker Compose full stack
Week 5:  GitHub Actions CI for all services + Docker image push
Week 6:  Kubernetes manifests + Minikube deployment + Ingress
Week 7:  Terraform for Azure + AKS production deploy
Week 8:  Prometheus + Grafana + Loki + Jaeger observability
Week 9:  Canary deployments + Blue-Green + API Gateway
Week 10: Istio service mesh + Chaos testing + Documentation
```

---

> **💡 Pro Tip**: Start by getting one service running end-to-end (User Service with CI → Docker → K8s → Observability) before adding the others. This gives you a repeatable pattern to apply to all services.

> **🔗 Repository Name Suggestion**: `talentflow-devops` — Make it public on GitHub. This is your portfolio project — future employers WILL look at it.
