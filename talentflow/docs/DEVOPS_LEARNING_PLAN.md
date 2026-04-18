# 🗓️ 30-Day DevOps Mastery Plan (TalentFlow Context)

This 30-day sprint is designed specifically around the **TalentFlow** project architecture. Instead of just learning theory, every task will involve explicitly exploring, building, or breaking parts of this repository to learn how real-world DevOps works end-to-end!

---

## Phase 1: The Foundations (Days 1–5)
*Goal: Understand the underlying system, Git, and networking that powers deployed applications.*

- **Day 1: Version Control Mastery**
  - **Task:** Learn advanced Git (`rebase`, `cherry-pick`, `bisect`). Branch off `main` in TalentFlow, intentionally create a merge conflict in `job-service`, and resolve it.
- **Day 2: Linux & Shell Scripting**
  - **Task:** Write a simple Bash/PowerShell script that automatically checks if port `8080`, `8001`, and `8002` are in use on your machine before starting TalentFlow, and kills the blocking processes if they are.
- **Day 3: Networking Basics (DNS, TCP/IP, Ports)**
  - **Task:** Trace the lifecycle of a web request. What happens when a user navigates to `talentflow.example.com` and hits the Ingress controller? Map out the ports used across all TalentFlow backing services.
- **Day 4: Storage & File Systems**
  - **Task:** Understand stateless vs stateful design. Look at how PostgreSQL and MongoDB persist data. 
- **Day 5: Week 1 Project Review**
  - **Task:** Draw a complete architectural diagram of the TalentFlow stack on white paper.

---

## Phase 2: Containerization (Days 6–10)
*Goal: Master Docker and local environment orchestration.*

- **Day 6: Docker Fundamentals**
  - **Task:** Pick apart the `Dockerfile` for the `.NET Notification Service`. Understand multi-stage builds, the `runtime` vs `sdk` images, and why we use the `appuser` (non-root).
- **Day 7: Image Optimization & Security**
  - **Task:** Run Trivy (vulnerability scanner) locally on the `job-aggregator` image. Try to reduce the image size even further.
- **Day 8: Docker Compose Networking**
  - **Task:** Dive deeply into `docker-compose.infra.yml`. Why do we use a custom network (`talentflow-net`)? How does Zookeeper talk to Kafka internally vs externally?
- **Day 9: Volume Management**
  - **Task:** Destroy your local Docker setup without losing data. Learn how Docker Named Volumes retain the Postgres and Mongo data even when containers are deleted.
- **Day 10: Week 2 Project Review**
  - **Task:** Write a completely new `Dockerfile` for the React Frontend and test running it locally using NGINX to serve the static Vite build.

---

## Phase 3: Infrastructure as Code (IaC) (Days 11–15)
*Goal: Automate cloud infrastructure using Terraform on Azure.*

- **Day 11: Cloud Fundamentals (Azure)**
  - **Task:** Familiarize yourself with Azure Resource Groups, Virtual Networks (Vnets), and AKS concepts. Map them mentally to TalentFlow's needs.
- **Day 12: Terraform Basics**
  - **Task:** Install Terraform. Write a `main.tf` file that provisions a strict, locked-down Resource Group and a Storage Account for holding Terraform state.
- **Day 13: Provisioning Managed DBs**
  - **Task:** Draft the Terraform code required to replace our Docker MongoDB and Postgres with fully managed Cloud DBs (Azure Database for PostgreSQL, CosmosDB for Mongo).
- **Day 14: Provisioning the Azure Kubernetes Cluster (AKS)**
  - **Task:** Use Terraform to define the `talentflow-aks` cluster with 2 worker nodes. Run `terraform plan` to validate it.
- **Day 15: Week 3 Project Review**
  - **Task:** Execute `terraform apply` to create the cloud infrastructure, and authenticate your local `kubectl` to talk to the remote AKS cluster.

---

## Phase 4: CI/CD & Automation (Days 16–20)
*Goal: Master GitHub Actions and automated software delivery.*

- **Day 16: CI/CD Fundamentals**
  - **Task:** Analyze `.github/workflows/ci-job-service.yml`. Break down the steps: Checkout -> Java Setup -> Build -> Test -> Security Scan -> Docker Push.
- **Day 17: Container Registries (GHCR)**
  - **Task:** Learn how GitHub Container Registry works. Trigger a manual build of the `user-service` and verify the image tags correctly appear in your GitHub packages.
- **Day 18: Continuous Deployment (CD) Strategies**
  - **Task:** Study `.github/workflows/cd-deploy.yml`. Learn how OIDC works to securely log GitHub Actions into Azure without storing permanent passwords.
- **Day 19: Infrastructure Automation in CI**
  - **Task:** Add a `terraform plan` step to a GitHub Actions pipeline so that your cloud infrastructure changes are tested automatically on pull requests.
- **Day 20: Week 4 Project Review**
  - **Task:** Make a trivial change to the `Job Aggregator`, commit to `main`, and watch the entire end-to-end flow run from Code Commit -> Docker Build -> AKS Deployment autonomously.

---

## Phase 5: Orchestration (Kubernetes) (Days 21–25)
*Goal: Run and scale the platform predictably.*

- **Day 21: Pods, Deployments & ReplicaSets**
  - **Task:** Understand the manifest `k8s/job-service/deployment.yaml`. Try manually scaling the Job Service to 3 replicas locally using memory/CPU limits.
- **Day 22: Services & Ingress Networking**
  - **Task:** How does the outside internet reach the `user-service`? Study the `ClusterIP` logic and the NGINX Ingress controller defined in `k8s/ingress/ingress.yaml`.
- **Day 23: ConfigMaps & Secrets**
  - **Task:** Move hard-coded database URLs inside your `configmap.yaml` files. Learn how to pass sensitive database passwords into Kubernetes using opaque `Secrets`.
- **Day 24: Helm Chart Basics**
  - **Task:** Convert the static `k8s/notification-service` YAML files into a reusable Helm Chart format so you can deploy multiple identical environments (dev, staging, prod) easily.
- **Day 25: Week 5 Project Review**
  - **Task:** Cause an intentional failure (e.g., delete the Kafka deployment) and use `kubectl describe pod` and `kubectl logs` to debug it exactly like an SRE on a night shift.

---

## Phase 6: Observability & DevSecOps (Days 26–30)
*Goal: Ensure the system is secure, performant, and monitorable.*

- **Day 26: Tracing & APM**
  - **Task:** Open the Jaeger UI locally (`localhost:16686`). Trace a single request traveling from the Frontend -> Job Service -> Kafka -> Notification Service.
- **Day 27: Metrics & Monitoring (Prometheus/Grafana)**
  - **Task:** Deploy the `kube-prometheus-stack` into your AKS cluster. Build a custom Grafana dashboard showing the JVM memory usage of the Spring Boot Job Service.
- **Day 28: Centralized Logging (ELK/EFK)**
  - **Task:** Set up FluentBit to grab all Kubernetes pod logs and stream them to Elasticsearch so you don't have to SSH or `kubectl logs` into individual pods.
- **Day 29: DevSecOps (SAST / DAST)**
  - **Task:** Review the OWASP ZAP (Zaproxy) step in the deployment workflow. Learn what DAST means and intentionally introduce a security flaw to see if ZAP catches it.
- **Day 30: Final Mastery**
  - **Task:** You are on-call. Completely wipe the cluster and restore the entire ecosystem from scratch using only automation (Terraform + GitHub Actions). You are now a DevOps Practitioner!
