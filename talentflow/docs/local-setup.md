# TalentFlow — Local Development Guide

## Prerequisites Check

Open PowerShell and run:
```powershell
python --version    # Need 3.11+
java -version       # Need 17+
mvn -version        # Need 3.8+
node --version      # Need 18+
docker --version    # Need 24+
```

## Architecture for Local Dev

```
Infrastructure (Docker):    PostgreSQL  Redis  MongoDB  Kafka
                                  ↑        ↑       ↑      ↑
Local Services:           user-service  job-service  notification-service
                                  ↑
Frontend:                     React Dev Server (localhost:3000)
```

---

## Step 1: Start Docker Desktop

**Make sure Docker Desktop is running first** (check system tray).
Then start infrastructure:
```powershell
cd d:\Devops_sample_projects\talentflow
docker compose -f docker-compose.infra.yml up -d
```

Wait ~30 seconds, verify:
```powershell
docker compose -f docker-compose.infra.yml ps
```

All services should show `healthy`.

---

## Step 2: User Service (Python/FastAPI)

```powershell
cd d:\Devops_sample_projects\talentflow\services\user-service

# Create virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run
uvicorn app.main:app --reload --port 8001
```

✅ Open: http://localhost:8001/docs

### Run User Service Tests:
```powershell
pip install -r requirements-dev.txt aiosqlite
pytest tests/ -v --cov=app --cov-report=term-missing
```

---

## Step 3: Job Service (Java/Spring Boot)

```powershell
cd d:\Devops_sample_projects\talentflow\services\job-service

# Run (Maven downloads deps first time - takes ~2 min)
mvn spring-boot:run
```

✅ Open: http://localhost:8080/swagger-ui.html

### Run Job Service Tests:
```powershell
mvn test
```

---

## Step 4: Frontend (React/Vite)

```powershell
cd d:\Devops_sample_projects\talentflow\services\frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

✅ Open: http://localhost:3000

---

## Step 5: Full Docker Compose (Production-like)

Once all services work locally, run everything in Docker:
```powershell
cd d:\Devops_sample_projects\talentflow

# Build all images and start
docker compose up -d --build

# View logs
docker compose logs -f

# Stop everything
docker compose down
```

---

## API Testing

### Register a user:
```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/v1/auth/register" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"test@example.com","username":"testuser","password":"Secure123!","role":"job_seeker"}'
```

### Login:
```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/v1/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"Secure123!"}'
```

### Create a job (use token from login):
```powershell
$token = "YOUR_TOKEN_HERE"
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/jobs" `
  -Method POST -ContentType "application/json" `
  -Headers @{"X-User-Id"="your-user-id";"Authorization"="Bearer $token"} `
  -Body '{"title":"Senior Dev","description":"Great role!","company":"TechCo","location":"Remote","jobType":"REMOTE"}'
```

---

## Service URLs

| Service | URL | Docs |
|---|---|---|
| User Service | http://localhost:8001 | http://localhost:8001/docs |
| Job Service | http://localhost:8080 | http://localhost:8080/swagger-ui.html |
| Notification Svc | http://localhost:8002 | http://localhost:8002/swagger |
| Frontend | http://localhost:3000 | — |
| Kafka UI | http://localhost:8090 | — |
| Grafana | http://localhost:3001 | admin/admin |
| Jaeger | http://localhost:16686 | — |
