# TalentFlow — Project State & Roadmap
*Last Updated: April 18, 2026*

This document provides a persistent snapshot of the architectural implementations, recently completed features, and a clear roadmap for where to pick up next. 

---

## 🏛 Architecture & Current Implementations

### 1. User Service (Python / FastAPI)
* **Status:** Stable
* **Tech Stack:** FastAPI, SQLAlchemy, PostgreSQL.
* **Key Features:** User authentication, JWT issuance, profile management.
* **Known State:** Runs cleanly. Emits Kafka events like `user.registered`.

### 2. Job Service (Java / Spring Boot)
* **Status:** Stable
* **Tech Stack:** Spring Boot 3, Hibernate 6, PostgreSQL, Flyway.
* **Key Features:** Job postings, job applications, filtering.
* **Known State:** 
  * Recently fixed a sophisticated PostgreSQL driver bug (`LOWER(bytea)`) regarding `null` parameter bindings in JPQL filtering out of the box. 
  * Exposes full Swagger documentation at `/swagger-ui.html`.

### 3. Notification Service (.NET 10 / ASP.NET)
* **Status:** Stable & Tested
* **Tech Stack:** .NET 10, Confluent.Kafka, MongoDB.
* **Key Features:** Event-driven architecture. Consumes `user.registered`, `job.posted`, `application.sent` topics and generates mock email logs.
* **Known State:**
  * Updated to successfully compile against the local `.NET 10` SDK.
  * Added auto-topic creation configs to prevent consumer crashes.
  * Initialized a dedicated `xUnit` test suite with `Moq` mocking capabilities! 

### 4. Job Aggregator (Python / K8s CronJob)
* **Status:** Freshly Built
* **Tech Stack:** Python `requests`, Kubernetes CronJob.
* **Key Features:** Fetches remote software dev jobs nightly from *Arbeitnow* and *Remotive (India)*, parsing HTML natively and syncing them to the Job Service.

### 5. Frontend UI (React / TypeScript)
* **Status:** Refined
* **Tech Stack:** React, Vite, React Query.
* **Key Features:** Authentication guards, Job viewing, Applications.
* **Known State:** Recently upgraded to safely parse and display 3rd-party HTML job descriptions using Markdown/HTML sanitization without breaking the UI CSS layout boundaries.

### 6. Infrastructure & DevOps
* **Status:** Production-Ready Patterns
* **Docker:** Full infrastructure `docker-compose.infra.yml` isolating backing DBs. 
* **CI Pipelines:** GitHub Actions continuously building, executing unit tests, running code security scans, and scanning Docker image vulnerabilities (Trivy).
* **CD Pipeline:** Automatically applies Kubernetes `.yaml` manifests mapping to Azure Kubernetes Service (AKS) while injecting version-controlled SHA image tags.

---

## 🚀 Where to proceed next! (Backlog & Roadmap)

If you step away from the project and need to know what to build next to further your DevOps/Full-stack mastery, here is a prioritized hit-list:

### Tier 1: High Priority (Immediate Value)
- [ ] **Alembic Migrations:** The Python `user-service` still needs an Alembic migration suite configured. Setting up migrations rather than relying on SQLAlchemy auto-creation is critical for production DB safety.
- [ ] **Real Email Gateway:** The `notification-service` currently relies on `MockEmail: true`. Integrate something like SendGrid, Mailjet, or AWS SES to actually fire real emails when external triggers hit!
- [ ] **Kubernetes Monitoring:** Deploy a `kube-prometheus-stack` into your cluster providing Grafana dashboards for K8s pod CPU/Memory usage. Right now you only have app-level observability.

### Tier 2: Enhancements
- [ ] **Frontend Testing Suite:** Expand the React TypeScript project by implementing robust end-to-end tests using **Playwright** or Cypress. Test the entire user journey (Login -> Apply for a Job).
- [ ] **Terraform Refactoring:** Review how AKS is spun up. Convert the cloud infrastructure spin-up from manual Azure Portal clicks into strict Terraform (`main.tf`) `.tf` modules.
- [ ] **Job Scraper Resilience:** Explore bypassing strict bots by turning the `job-sync.py` into an automated Playwright/Selenium headless scraper browser to aggregate locked LinkedIn jobs.

### Tier 3: Architecture Scaling
- [ ] **Redis Caching Strategy:** Use the provisioned cluster Redis instance caching layer to cache the `JobService` public search results to heavily lighten the load on PostgreSQL.
- [ ] **Elasticsearch Integration:** Replace simple `LIKE` SQL text matching in the Job Service with an ELK stack implementation for fuzzy full-text keyword indexing and analytics!
