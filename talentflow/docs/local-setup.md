# TalentFlow — Local Development Guide

## Prerequisites

Open PowerShell and verify all tools are installed:

```powershell
python --version    # Need 3.11+
java -version       # Need 17+
mvn -version        # Need 3.8+
dotnet --version    # Need 10.0+
node --version      # Need 18+
docker --version    # Need 24+
```

## Architecture for Local Dev

```
Infrastructure (Docker):   PostgreSQL · Redis · MongoDB · Kafka · Zookeeper · Kafka-UI
                                 ↑         ↑        ↑       ↑
Application Services:   user-service  job-service  notification-service  job-aggregator(script)
(run natively)              :8001         :8080           :8002               sync
                                ↑
Frontend:              React Dev Server (localhost:3000)
```

> **Note:** The notification-service runs natively with `dotnet run` for local development.
> It only runs in Docker when using the full-stack `docker compose up` command.

---

## Step 1: Start Infrastructure (Docker)

**Make sure Docker Desktop is running first** (check the system tray icon).

```powershell
cd d:\Devops_sample_projects\talentflow
docker compose -f docker-compose.infra.yml up -d
```

Wait ~30 seconds for Kafka to finish initialising, then verify:

```powershell
docker compose -f docker-compose.infra.yml ps
```

Expected — all containers show `healthy`:

| Container | Port |
|---|---|
| talentflow-postgres | 5432 |
| talentflow-redis | 6379 |
| talentflow-mongodb | 27017 |
| talentflow-zookeeper | 2181 |
| talentflow-kafka | 9092 |
| talentflow-kafka-ui | 8090 |

---

## Step 2: User Service (Python / FastAPI)

```powershell
cd d:\Devops_sample_projects\talentflow\services\user-service

# Create and activate virtual environment (first time only)
python -m venv .venv
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run
uvicorn app.main:app --reload --port 8001
```

✅ Open: <http://localhost:8001/docs>

### Run Tests

```powershell
pip install -r requirements-dev.txt
pytest tests/ -v --cov=app --cov-report=term-missing
```

---

## Step 3: Job Service (Java / Spring Boot)

```powershell
cd d:\Devops_sample_projects\talentflow\services\job-service

# Run (Maven downloads dependencies the first time — takes ~2 min)
# Note: Always run `clean` first to avoid Spring Data JPA compilation cache issues locally!
mvn clean spring-boot:run
```

✅ Open: <http://localhost:8080/swagger-ui.html>

### Run Tests

```powershell
mvn test
```

---

## Step 4: Notification Service (.NET 10 / ASP.NET Core)

The notification service consumes Kafka events and stores records in MongoDB.
Email sending is **mocked by default** (`MockEmail: true` in `appsettings.json`) so no
SMTP server is needed for local development.

```powershell
cd d:\Devops_sample_projects\talentflow\services\notification-service\src\NotificationService

# Run
dotnet run
```

> **Security Policy Block?**  
> If `dotnet run` fails with **"An Application Control policy has blocked this file"** (e.g. WDAC or AppLocker is enabled on your machine restricting local `.exe` execution), you can bypass it by running the compiled `.dll` directly through the trusted `dotnet` host:
> ```powershell
> dotnet build
> dotnet bin\Debug\net10.0\NotificationService.dll
> ```
> Alternatively, you can skip local execution and just run this service via Docker (see Step 6).

✅ Open: <http://localhost:8002/swagger>  
✅ Health: <http://localhost:8002/health>  
✅ Metrics: <http://localhost:8002/metrics>

> **Troubleshooting:** If `dotnet run` fails with a restore error, run `dotnet restore` first
> from the `src/NotificationService/` directory.

### Configuration

The service reads from `appsettings.json`. For local dev the defaults work out of the box:

| Setting | Default | Description |
|---|---|---|
| `MongoDB:Uri` | `mongodb://localhost:27017` | Matches infra compose |
| `Kafka:BootstrapServers` | `localhost:9092` | Matches infra compose |
| `Jaeger:OtlpEndpoint` | `http://localhost:4317` | OTLP gRPC collector |
| `Notification:MockEmail` | `true` | Logs emails instead of sending |

### Run Tests

```powershell
cd d:\Devops_sample_projects\talentflow\services\notification-service
dotnet test
```

---

## Step 5: Frontend (React / Vite / TypeScript)

```powershell
cd d:\Devops_sample_projects\talentflow\services\frontend

# Install dependencies (first time only)
npm install

# Run dev server
npm run dev
```

✅ Open: <http://localhost:3000>

### Run Tests

```powershell
npm test
```

---

## Step 6: Job Aggregator Script (Python)

To pull real external jobs into the `job-service`, run the aggregator script independently. 

```powershell
cd d:\Devops_sample_projects\talentflow\scripts\aggregator

# Install dependencies (first time only)
pip install -r requirements.txt

# Run the sync
python job-sync.py
```
> **Note:** Make sure `job-service` (Step 3) is running first, as the aggregator pushes data directly to its REST API.

---

## Step 7: Full Docker Compose (Production-like)

Once all services work locally, run the entire stack in Docker:

```powershell
cd d:\Devops_sample_projects\talentflow

# Build all images and start
docker compose up -d --build

# View logs for all services
docker compose logs -f

# View logs for a single service
docker compose logs -f notification-service

# Stop everything
docker compose down
```

> **Note:** `docker-compose.infra.yml` only starts backing services (Postgres, Redis, MongoDB, Kafka).
> The **application services** (user-service, job-service, notification-service, frontend) are defined
> in the main `docker-compose.yml`.

---

## API Testing

### Register a user

```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/v1/auth/register" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"test@example.com","username":"testuser","password":"Secure123!","role":"job_seeker"}'
```

### Login

```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/v1/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"Secure123!"}'
```

### Create a job listing

```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/jobs" `
  -Method POST -ContentType "application/json" `
  -Headers @{"X-User-Id"="your-user-id"; "Authorization"="Bearer $token"} `
  -Body '{"title":"Senior Dev","description":"Great role!","company":"TechCo","location":"Remote","jobType":"REMOTE"}'
```

### Check notification service health

```powershell
Invoke-RestMethod -Uri "http://localhost:8002/health"
```

---

## Service URLs

| Service | URL | API Docs |
|---|---|---|
| User Service | <http://localhost:8001> | <http://localhost:8001/docs> |
| Job Service | <http://localhost:8080> | <http://localhost:8080/swagger-ui.html> |
| Notification Service | <http://localhost:8002> | <http://localhost:8002/swagger> |
| Frontend | <http://localhost:3000> | — |
| Kafka UI | <http://localhost:8090> | — |
| Grafana | <http://localhost:3001> | admin / admin |
| Jaeger | <http://localhost:16686> | — |

---

## Troubleshooting

### Infrastructure won't start

```powershell
# Check Docker Desktop is running, then check logs
docker compose -f docker-compose.infra.yml logs kafka
docker compose -f docker-compose.infra.yml logs postgres
```

### User service database error

Make sure the infra stack is running and PostgreSQL is healthy before starting the user service.

### Notification service Kafka connection refused

Kafka takes ~20 seconds to be ready after `docker compose up`. Wait until
`talentflow-kafka` shows `(healthy)` in `docker compose -f docker-compose.infra.yml ps`.

### Port already in use

```powershell
# Find and kill the process using a port (e.g. 8001)
netstat -ano | findstr :8001
taskkill /PID <PID> /F
```
