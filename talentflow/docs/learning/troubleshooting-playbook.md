# 🛠️ DevOps Troubleshooting & Incident Playbook

This playbook serves as a real-world record of issues encountered while building and configuring the TalentFlow infrastructure. It demonstrates how to track, diagnose, and resolve deep backend, frontend, and Docker orchestration issues.

---

## 1. Dirty Docker Build Contexts (`NETSDK1064` / Maven Timeouts)

**The Issue:**
During `docker compose up -d --build`, the `.NET` Notification Service (and Java Job Service) mysteriously failed at the build/publish stage, complaining that transitive packages like `AWSSDK.SecurityToken` were missing, even though `dotnet restore` passed successfully moments before.

**How We Tracked It:**
1. Ran the build manually: `docker compose build notification-service`
2. Analyzed the exact Docker step output: `=> CACHED [builder 5/6] COPY src ./src`
3. Realized that Docker was copying the host Windows machine's `obj/` folder into the clean Linux container. The Linux compiler then read the Windows specific caching paths embedded in `project.assets.json`, panicked, and aborted.

**The Fix:**
1. Created `.dockerignore` files for both C# (`*/bin/`, `*/obj/`) and Java (`target/`, `.mvn/`) to physically prevent the host's debugging artifacts from entering the isolated Linux containers.
2. Removed `--no-restore` from the Dockerfile `dotnet publish` command so that it forces dynamic path-resolution natively inside the Linux build step if any layer caching anomalies occur.

---

## 2. Kafka & Zookeeper State Corruption (`NodeExistsException`)

**The Issue:**
The `talentflow-kafka` container continuously entered an infinite crash loop, throwing `KeeperErrorCode = NodeExists`. 

**How We Tracked It:**
1. Traced the container crash footprint using: `docker compose logs kafka zookeeper`
2. Found the raw Java Exception inside the Kafka logs: `org.apache.zookeeper.KeeperException$NodeExistsException`.
3. Identified this as a classic Stateful Container bug. During a previous hard reset of Docker, Zookeeper retained a lock file explicitly claiming that `Broker 1` was currently running. When the new container spun up, Zookeeper rejected it as an imposter.

**The Fix:**
Destroyed the corrupted, orphaned state uniquely tied to the queues, *without* damaging the Postgres/Mongo databases.
```bash
# Safely stop everything
docker compose down

# Forcibly delete ONLY the corrupted message queue volumes
docker volume rm talentflow_zookeeper-data talentflow_kafka-data

# Spin back up with a clean slate
docker compose up -d
```

---

## 3. The 502 Bad Gateway Race Condition (Container Orchestration)

**The Issue:**
Upon loading the TalentFlow frontend directly from `localhost:3000` (which was served via Docker's NGINX layer), the browser console was suddenly flooded with `GET /api/v1/jobs - 502 Bad Gateway` errors.

**How We Tracked It:**
1. Checked if the Java backend was alive: `docker compose ps`. It showed `Up`.
2. Tailed the Frontend Proxy routing logs to see why it was refusing to connect: `docker compose logs --tail=20 frontend`.
3. Found connection refused logs: `connect() failed (111: Connection refused) while connecting to upstream http://job-service:8080`.
4. Realized it was an orchestration timing flaw. Java Spring Boot (`job-service`) takes ~30 seconds to boot up entirely and link to its Postgres tables. React/NGINX starts in 1 second. NGINX was attempting to proxy traffic to Java before the JVM was actually ready to receive it! Wait 30 seconds, and the 502 goes away automatically.

**The Fix:**
1. Educate teams that Microservices start asynchronously.
2. In production deployments, orchestrators like Kubernetes natively handle this using `ReadinessProbes`, preventing HTTP traffic from hitting pods that are actively warming up.

---

## 4. Frontend "Silent Fails" and HTTP `400 Bad Request`

**The Issue:**
Applying for a job failed with a frustrating generic message: `"Failed to apply. You may have already applied."` 

**How We Tracked It:**
1. Navigated to Chrome DevTools (F12) -> **Network Tab** -> Clicked the `apply` packet.
2. Discovered the raw network request was throwing `HTTP 400 Bad Request`.
3. Checked the Java Backend logs simultaneously: `docker compose logs --tail=50 job-service`.
4. Caught the Java Error: `MissingRequestHeaderException: Required request header 'X-User-Id' is not present`.
5. Inspected the React Frontend's Axios interceptor (`src/services/api.ts`) and traced the logic to find why the Header wasn't dispatched.

**The Fix:**
The modern `axios` library upgraded its backend mechanics in `v1.7+`. We previously assigned the header via literal bracket notation (`config.headers['X-User-Id'] = id`), but the new class library required `config.headers.set()`. 
Additionally, we found a logic loop where a *Hard Reset* in the browser wiped the volatile Javascript Memory (the user's Access Token), causing the interceptor logic (`if (token) ...`) to wrongly skip adding the user's ID entirely, even when they were technically logged in! We resolved it by separating the header injection logic to be completely independent of the token state.
