-- V1__init_jobs.sql
-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id              VARCHAR(36)    PRIMARY KEY,
    title           VARCHAR(200)   NOT NULL,
    description     TEXT           NOT NULL,
    company         VARCHAR(200)   NOT NULL,
    location        VARCHAR(200)   NOT NULL,
    job_type        VARCHAR(20)    NOT NULL CHECK (job_type IN ('FULL_TIME','PART_TIME','CONTRACT','REMOTE','INTERNSHIP')),
    status          VARCHAR(20)    NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED','DRAFT')),
    salary_min      NUMERIC(10,2),
    salary_max      NUMERIC(10,2),
    posted_by_user_id VARCHAR(36)  NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id                  VARCHAR(36)  PRIMARY KEY,
    job_id              VARCHAR(36)  NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_user_id   VARCHAR(36)  NOT NULL,
    status              VARCHAR(20)  NOT NULL DEFAULT 'APPLIED'
                            CHECK (status IN ('APPLIED','REVIEWED','SHORTLISTED','REJECTED','HIRED')),
    cover_letter        TEXT,
    applied_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (job_id, applicant_user_id)
);

-- Indexes
CREATE INDEX idx_jobs_status        ON jobs(status);
CREATE INDEX idx_jobs_job_type      ON jobs(job_type);
CREATE INDEX idx_jobs_posted_by     ON jobs(posted_by_user_id);
CREATE INDEX idx_jobs_created_at    ON jobs(created_at DESC);
CREATE INDEX idx_applications_job   ON applications(job_id);
CREATE INDEX idx_applications_user  ON applications(applicant_user_id);
