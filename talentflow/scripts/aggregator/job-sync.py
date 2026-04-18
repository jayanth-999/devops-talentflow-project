import os
import requests
import logging
from datetime import datetime

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
ARBEITNOW_API_URL = "https://www.arbeitnow.com/api/job-board-api"
REMOTIVE_INDIA_API_URL = "https://remotive.com/api/remote-jobs?category=software-dev&search=india"
JOB_SERVICE_URL = os.getenv("JOB_SERVICE_URL", "http://localhost:8080/api/v1/jobs")
SYSTEM_USER_ID = "system-aggregator"

def fetch_arbeitnow_jobs():
    """Fetches open IT/Dev jobs from Arbeitnow API."""
    logger.info(f"Fetching jobs from Arbeitnow...")
    try:
        response = requests.get(ARBEITNOW_API_URL, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Transform logic for Arbeitnow
        transformed = []
        for job in data.get("data", [])[:20]:
            transformed.append({
                "title": job.get("title", ""),
                "company": job.get("company_name", ""),
                "description": job.get("description", "No description provided.")[:2000],
                "location": job.get("location", "Remote"),
                "jobType": "REMOTE" if job.get("remote") else "FULL_TIME",
                "status": "OPEN",
                "postedByUserId": SYSTEM_USER_ID
            })
        return transformed
    except Exception as e:
        logger.error(f"Failed to fetch Arbeitnow jobs: {e}")
        return []

def fetch_remotive_india_jobs():
    """Fetches remote software development roles tagged with India from Remotive."""
    logger.info(f"Fetching jobs from Remotive (India)...")
    try:
        response = requests.get(REMOTIVE_INDIA_API_URL, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Transform logic for Remotive
        transformed = []
        for job in data.get("jobs", [])[:20]:
            transformed.append({
                "title": job.get("title", ""),
                "company": job.get("company_name", ""),
                "description": job.get("description", "No description provided.")[:2000],
                "location": job.get("candidate_required_location", "India"),
                "jobType": "REMOTE",
                "status": "OPEN",
                "postedByUserId": SYSTEM_USER_ID
            })
        return transformed
    except Exception as e:
        logger.error(f"Failed to fetch Remotive India jobs: {e}")
        return []

def sync_jobs(jobs):
    """Transforms and posts normalized jobs to our internal job-service."""
    success_count = 0
    for payload in jobs:
        try:
            logger.info(f"Posting job: {payload['title']} at {payload['company']}")
            headers = {"X-User-Id": SYSTEM_USER_ID}
            res = requests.post(JOB_SERVICE_URL, json=payload, headers=headers, timeout=5)
            
            if res.status_code in [200, 201]:
                success_count += 1
            else:
                logger.warning(f"Failed to post job. Status: {res.status_code}, Response: {res.text}")
        except Exception as e:
            logger.error(f"Error posting job to internal API: {e}")

    logger.info(f"Successfully synced {success_count} jobs.")

def main():
    logger.info("Starting Job Aggregation Sync...")
    
    # 1. Gather jobs from multiple sources
    all_jobs = []
    all_jobs.extend(fetch_arbeitnow_jobs())
    all_jobs.extend(fetch_remotive_india_jobs())

    # 2. Sync all gathered jobs
    if all_jobs:
        logger.info(f"Found {len(all_jobs)} total jobs from all external sources.")
        sync_jobs(all_jobs)
    else:
        logger.warning("No jobs found to sync across any source.")
        
    logger.info("Sync complete.")

if __name__ == "__main__":
    main()
