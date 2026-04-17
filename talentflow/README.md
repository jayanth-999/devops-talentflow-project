# 🚀 TalentFlow — Cloud-Native Job Portal (DevOps Learning Project)

A production-like, microservices-based job portal designed to learn DevOps end-to-end.

## Services

| Service | Language | Port | Responsibility |
|---|---|---|---|
| `user-service` | Python / FastAPI | 8001 | Auth, JWT, User profiles |
| `job-service` | Java / Spring Boot | 8080 | Job listings, applications |
| `notification-service` | .NET / ASP.NET Core | 8002 | Kafka consumer, email alerts |
| `frontend` | React / Vite / TypeScript | 3000 | Portal UI |

## Quick Start

```bash
# 1. Copy env file
cp .env.example .env

# 2. Start all services
docker-compose up -d

# 3. Access
# Frontend:     http://localhost:3000
# Job Service:  http://localhost:8080/swagger-ui.html
# User Service: http://localhost:8001/docs
# Grafana:      http://localhost:3001  (admin/admin)
# Jaeger:       http://localhost:16686
# Kafka UI:     http://localhost:8090
```

## Architecture

See [docs/architecture.md](docs/architecture.md)

## DevOps Stack

- **CI/CD**: GitHub Actions
- **Containers**: Docker + Docker Compose
- **Orchestration**: Kubernetes (AKS / Minikube)
- **IaC**: Terraform (Azure)
- **Observability**: Prometheus + Grafana + Loki + Jaeger
- **Security**: JWT, Azure Key Vault, Trivy, OWASP ZAP
