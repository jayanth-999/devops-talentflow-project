package com.talentflow.job.service;

import com.talentflow.job.dto.JobDto;
import com.talentflow.job.kafka.JobEventProducer;
import com.talentflow.job.model.Application;
import com.talentflow.job.model.Job;
import com.talentflow.job.model.Job.JobStatus;
import com.talentflow.job.model.Job.JobType;
import com.talentflow.job.repository.ApplicationRepository;
import com.talentflow.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final JobEventProducer eventProducer;

    @Transactional
    public Job createJob(JobDto.CreateJobRequest req, String userId) {
        Job job = Job.builder()
            .title(req.getTitle())
            .description(req.getDescription())
            .company(req.getCompany())
            .location(req.getLocation())
            .jobType(req.getJobType())
            .salaryMin(req.getSalaryMin())
            .salaryMax(req.getSalaryMax())
            .postedByUserId(userId)
            .build();

        job = jobRepository.save(job);

        // Publish Kafka event
        eventProducer.publishJobPosted(Map.of(
            "jobId", job.getId(),
            "title", job.getTitle(),
            "company", job.getCompany(),
            "postedByUserId", userId,
            "timestamp", Instant.now().toString()
        ));

        log.info("Job created: id={} title={}", job.getId(), job.getTitle());
        return job;
    }

    public Page<Job> listJobs(JobStatus status, JobType jobType, String location,
                               String keyword, Pageable pageable) {
        return jobRepository.findWithFilters(status, jobType, location, keyword, pageable);
    }

    public Job getJobById(String jobId) {
        return jobRepository.findById(jobId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found: " + jobId));
    }

    @Transactional
    public Job updateJob(String jobId, JobDto.UpdateJobRequest req, String userId) {
        Job job = getJobById(jobId);
        if (!job.getPostedByUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this job");
        }
        if (req.getTitle() != null)    job.setTitle(req.getTitle());
        if (req.getDescription() != null) job.setDescription(req.getDescription());
        if (req.getLocation() != null) job.setLocation(req.getLocation());
        if (req.getJobType() != null)  job.setJobType(req.getJobType());
        if (req.getStatus() != null)   job.setStatus(req.getStatus());
        if (req.getSalaryMin() != null) job.setSalaryMin(req.getSalaryMin());
        if (req.getSalaryMax() != null) job.setSalaryMax(req.getSalaryMax());
        return jobRepository.save(job);
    }

    @Transactional
    public void deleteJob(String jobId, String userId) {
        Job job = getJobById(jobId);
        if (!job.getPostedByUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to delete this job");
        }
        jobRepository.delete(job);
        log.info("Job deleted: id={}", jobId);
    }

    @Transactional
    public Application applyToJob(String jobId, String applicantUserId, JobDto.ApplyJobRequest req) {
        Job job = getJobById(jobId);
        if (job.getStatus() != JobStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job is not open for applications");
        }
        if (applicationRepository.existsByJobIdAndApplicantUserId(jobId, applicantUserId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already applied to this job");
        }

        Application application = Application.builder()
            .jobId(jobId)
            .applicantUserId(applicantUserId)
            .coverLetter(req.getCoverLetter())
            .build();

        application = applicationRepository.save(application);

        // Publish Kafka event
        eventProducer.publishApplicationSubmitted(Map.of(
            "applicationId", application.getId(),
            "jobId", jobId,
            "jobTitle", job.getTitle(),
            "company", job.getCompany(),
            "applicantUserId", applicantUserId,
            "employerUserId", job.getPostedByUserId(),
            "timestamp", Instant.now().toString()
        ));

        log.info("Application submitted: id={} jobId={} applicant={}", application.getId(), jobId, applicantUserId);
        return application;
    }

    public Page<Application> getApplicationsForJob(String jobId, String userId, Pageable pageable) {
        Job job = getJobById(jobId);
        if (!job.getPostedByUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
        }
        return applicationRepository.findByJobId(jobId, pageable);
    }

    public Page<Application> getMyApplications(String userId, Pageable pageable) {
        return applicationRepository.findByApplicantUserId(userId, pageable);
    }
}
