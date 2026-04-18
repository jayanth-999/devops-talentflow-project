# Day 2: Linux & Shell Scripting Automation

Shell scripting is the glue of DevOps. Whether you are building Docker containers, writing GitHub Actions pipelines, or managing servers, you will constantly write scripts to automate repetitive tasks.

While you wrote a **PowerShell** (`.ps1`) script for your local Windows machine today, 95% of DevOps servers run **Linux**, which uses **Bash** (`.sh`) scripts. 

Here is your essential cheat sheet for Bash scripting and automation.

---

## 1. The Anatomy of a Bash Script

A bash script is just a text file with commands. 

**`scripts/backup.sh`**
```bash
#!/bin/bash
# The line above is called a "shebang". It tells Linux to execute this file using the bash program.

# 1. Variables (No spaces around the '=' sign!)
BACKUP_DIR="/var/backups"
TODAY=$(date +%F)

# 2. Conditionals (If/Else)
if [ -d "$BACKUP_DIR" ]; then
    echo "Directory exists! Proceeding..."
else
    echo "Creating backup directory..."
    mkdir -p $BACKUP_DIR
fi

# 3. Loops
for PORT in 8080 8001 8002; do
    echo "Checking port $PORT..."
done
```

> **Important:** To run a script in Linux, you usually have to grant it permission to execute first:
> `chmod +x scripts/backup.sh`
> `./scripts/backup.sh`

---

## 2. Automating Time with CRON

You rarely run scripts manually in DevOps. You use **Cron** to schedule them!

In standard Linux, you open the cron editor by typing `crontab -e`. You then add a line with 5 stars/numbers indicating the exact time schedule.

### The Cron Syntax
```
* * * * *  /path/to/script.sh
| | | | |
| | | | +---- Day of the Week (0-6) (Sunday=0)
| | | +------ Month (1-12)
| | +-------- Day of the Month (1-31)
| +---------- Hour (0-23)
+------------ Minute (0-59)
```

**Real Life Examples:**
* `0 2 * * * /scripts/db-backup.sh` — Runs every day at exactly 2:00 AM.
* `*/15 * * * * /scripts/health-check.sh` — Runs every 15 minutes.
* `0 0 * * 5 /scripts/clear-logs.sh` — Runs exactly at midnight, but only on Fridays.

> **Note:** In TalentFlow, we actually took this concept and put it into Kubernetes! If you look at `k8s/job-aggregator/cronjob.yaml`, you'll see we used the exact same `0 */6 * * *` syntax to schedule our Python aggregator!

---

## 3. Real-Life Automation Scenarios

Here are some actual scripts SREs and DevOps engineers string together:

### Scenario A: The Disk Space Monitor
Servers crash when they run out of disk space (logs fill up). You can write a script that checks if disk space is > 90%. If it is, it uses `curl` to trigger a Slack Webhook alerting the DevOps team!

```bash
#!/bin/bash
DISK_USAGE=$(df / | grep / | awk '{ print $5}' | sed 's/%//g')

if [ "$DISK_USAGE" -gt 90 ]; then
    curl -X POST -H 'Content-type: application/json' --data '{"text":"🚨 SERVER DISK AT 90%!"}' https://hooks.slack.com/services/YOUR/WEBHOOK/URL
fi
```

### Scenario B: Database Backup & AWS Upload
Instead of relying on manual backups, run a nightly cron task to dump your PostgreSQL database, zip it, and securely send it to an AWS S3 cloud bucket.

```bash
#!/bin/bash
export PGPASSWORD="SuperSecretPassword"
pg_dump -h localhost -U myuser talentflow_db > backup.sql
tar -czvf backup.tar.gz backup.sql
aws s3 cp backup.tar.gz s3://talentflow-company-backups/
```

### Scenario C: The "Zombie Port" Killer (Linux Equivalent)
Here is the exact script you wrote today for Windows, but translated into Linux Bash using `lsof` and `kill`:

```bash
#!/bin/bash
PORTS=(8001 8080 8002)

for PORT in "${PORTS[@]}"; do
    # Find the Process ID using the port
    PID=$(lsof -t -i:$PORT)
    
    if [ -n "$PID" ]; then
        echo "Zombie found on port $PORT. Killing PID $PID..."
        kill -9 $PID
    else
        echo "Port $PORT is clean."
    fi
done
```

---

## 4. Essential DevOps Linux Commands (Server Survival Guide)

When you SSH into a remote Linux server that is on fire 🔥, these are the commands you use to figure out what is going wrong:

### System & Memory (Is the server dying?)
* **`htop`** or **`top`**: Displays a live, real-time view of CPU and Memory usage by process. (Like Windows Task Manager).
* **`free -m`**: Check exactly how much RAM is free/used in Megabytes. If a Java app crashes due to OOM (Out Of Memory), look here.
* **`df -h`**: Check server disk space. (A server with 100% disk usage will cause PostgreSQL/Kafka to instantly crash).
* **`du -sh *`**: Find out which specific folder in your current directory is hogging all the disk space.

### Process Management (Who is misbehaving?)
* **`ps aux | grep java`**: Finds every running process related to "java".
* **`kill -9 <PID>`**: The nuclear option. Force-kills a process instantly without asking it to shut down gracefully.

### Logs & Investigating (What went wrong?)
* **`tail -f /var/log/syslog`**: *Follows* a log file live. As new text is written to the file, it scrolls down your screen in real-time. (Crucial for watching app logs).
* **`journalctl -u kubelet -f`**: Follows the live system logs for a specific background service (e.g., `kubelet` or `docker`).
* **`grep -i "error" server.log`**: Searches a massive log file specifically for the word "error" (case-insensitive).

### Networking (Can they talk to each other?)
* **`curl -v http://localhost:8080/health`**: The ultimate tool. Makes an HTTP request directly from the terminal to see if an API is responding. The `-v` (verbose) shows headers being sent.
* **`lsof -i :8080`**: "List Open Files". Show me the exact Process ID that is currently listening on port 8080.
* **`ss -tulpn`**: Shows all actively listening ports on the server and the daemon processes attached to them.
* **`ping google.com`**: Basic test to see if the server has outbound internet access.

### Service Management & Startup Scripts (Systemd)
Modern Linux distributions use `systemd` to run background services (like Docker, NGINX, or a Spring Boot Jar) continuously.
* **`systemctl status docker`**: Checks if the Docker service is currently running, its uptime, and its last few log entries.
* **`systemctl restart nginx`**: Restarts the NGINX web server safely.
* **`systemctl list-unit-files --type=service --state=enabled`**: Lists all services that are configured to start **automatically when the server boots up**.
* **`systemctl enable my-app` / `systemctl disable my-app`**: Turns "auto-start on boot" on or off for a service.
* **Where are they configured?** If you want to know *how* a background service runs, check its config file located in **`/etc/systemd/system/`** (e.g., `/etc/systemd/system/my-app.service`).

### Users, Permissions & Security (Why am I getting "Permission Denied"?)
* **`chmod +x script.sh`**: Grants "execute" permission so a script can actually run. (`chmod 755` provides read/execute to everyone, but write only to the owner).
* **`chown myuser:myuser /var/www/html`**: Changes the "Owner" of a folder. Essential if NGINX or Jenkins writes to a folder but gets blocked because the folder is owned by "root".
* **`sudo grep "Failed password" /var/log/auth.log`**: Shows you a list of IPs trying (and failing) to hack/SSH into your server.
