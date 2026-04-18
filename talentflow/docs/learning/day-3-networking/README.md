# Day 3: Networking, Architecture, & System Design

It is completely normal to feel overwhelmed! When learning DevOps, people often throw tools like "Kafka" or "Redis" at you without actually explaining *why* a business needs them. 

Let's demystify the **TalentFlow System Architecture**. Here is exactly how this platform operates under the hood.

---

## 1. The Big Picture: How the Services Connect

Imagine a user logging in and applying for a job. Here is the entire network flow:

1. **The Ingress Controller (The Traffic Cop):** 
   When a user goes to `talentflow.local`, the traffic hits a Kubernetes **Ingress Controller** (NGINX). Think of this as the receptionist of an office building. It looks at the URL. If the URL says `/api/user`, it routes the traffic down the hallway to the **User Service**. If it says `/api/jobs`, it routes traffic to the **Job Service**.
2. **The Microservices (The Workers):** 
   The User Service (Python) and Job Service (Java) run completely independently. If the Java service crashes, the Python service stays alive. 
3. **The Databases (The Vaults):** 
   The Python service strictly saves its data to PostgreSQL. The .NET service strictly saves to MongoDB. They **are not allowed** to read each other's databases. 

So, if they can't read each other's databases, how do they communicate? That is where Kafka and Redis come in.

---

## 2. What is Redis doing? (The Cache)

**The Problem:** The Java Job Service gets hit by thousands of users every minute searching for the exact same "Software Developer" jobs. If Java asks PostgreSQL for those jobs 10,000 times a minute, the entire server will melt and crash.

**The Solution:** Redis is a database that runs entirely in **RAM (Memory)** instead of a hard drive. It is blazingly fast. 
When Java asks Postgres for the jobs the *first* time, it takes a copy of the result and shoves it into Redis. For the next 9,999 users, Java doesn't even bother Postgres; it just hands the user the fast copy sitting in Redis.

* **Port:** `6379`
* **Role in TalentFlow:** Making the API 100x faster by remembering heavily requested data.

---

## 3. What is Kafka doing? (The Post Office)

**The Problem:** As I mentioned above, services shouldn't talk to each other directly (`Synchronous` communication). Why? Because if the Java service tries to send an HTTP request to the .NET Notification service to send an email, but the .NET service is offline/restarting, the Java service fails and the user gets a generic "500 Error".

**The Solution:** Kafka is an Event Stream (or Message Queue). Think of it as a highly reliable Post Office.
1. When a user applies for a job, the Java service drops a letter into Kafka into a mailbox (called a `Topic`) named `application.sent`.
2. Java immediately returns a "Success" to the user and goes back to work. 
3. The .NET Notification Service is constantly checking Kafka. It sees the letter, picks it up, and sends the email! 
4. If .NET is offline for an hour, it doesn't matter! The letters just pile up in Kafka safely. When .NET comes back online, it processes the backlog. This is called **Asynchronous** or **Event-Driven Architecture**.

* **Port:** `9092`
* **Role in TalentFlow:** Ensuring services can communicate reliably even if parts of the cloud are crashing.

---

## 4. The Request Lifecycle (The Answers)

Here are the answers to the three Lifecycle questions:
1. **DNS:** The user's computer asks a DNS Server (like Google's `8.8.8.8`) "Hey, what is the IP address for talentflow.example.com?" The DNS server returns the public IP address of our Azure Cloud Load Balancer.
2. **Ingress:** The NGINX Ingress controller acts as a reverse proxy. It terminates the HTTPS secure connection, reads the URL, and forwards the packets to the internal cluster IP of the specific Pod that can handle the request.
3. **Internal Routing:** The React frontend doesn't know the IP of the Java service. It just asks Kubernetes for the hostname `http://job-service:8080`. Kubernetes has an internal pseudo-DNS (CoreDNS) that magically translates the word "job-service" into the current dynamic IP address of the Java Pod.

---

## 5. The Ultimate Port Map

Memorize these. They are the industry standard default ports used across 90% of all tech companies globally!

* **HTTP Web Traffic:** `80`
* **HTTPS Secure Traffic:** `443`
* **PostgreSQL:** `5432`
* **Redis:** `6379`
* **MongoDB:** `27017`
* **Kafka:** `9092`
* **Zookeeper (Kafka's brain):** `2181`
* **Spring Boot (Java default):** `8080`
* **React / Node (Dev server default):** `3000`
