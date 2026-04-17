package com.talentflow.job.controller;

import com.talentflow.job.dto.JobDto;
import com.talentflow.job.model.Application;
import com.talentflow.job.model.Job;
import com.talentflow.job.model.Job.JobStatus;
import com.talentflow.job.model.Job.JobType;
import com.talentflow.job.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "Job listing and application management")
public class JobController {

    private final JobService jobService;

    @PostMapping
    @Operation(summary = "Create a new job posting")
    public ResponseEntity<Job> createJob(
        @Valid @RequestBody JobDto.CreateJobRequest req,
        @RequestHeader("X-User-Id") String userId
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.createJob(req, userId));
    }

    @GetMapping
    @Operation(summary = "List and filter jobs with pagination")
    public ResponseEntity<Page<Job>> listJobs(
        @RequestParam(required = false) JobStatus status,
        @RequestParam(required = false) JobType jobType,
        @RequestParam(required = false) String location,
        @RequestParam(required = false) String keyword,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
        PageRequest pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(jobService.listJobs(status, jobType, location, keyword, pageable));
    }

    @GetMapping("/{jobId}")
    @Operation(summary = "Get job details by ID")
    public ResponseEntity<Job> getJob(@PathVariable String jobId) {
        return ResponseEntity.ok(jobService.getJobById(jobId));
    }

    @PutMapping("/{jobId}")
    @Operation(summary = "Update a job posting")
    public ResponseEntity<Job> updateJob(
        @PathVariable String jobId,
        @Valid @RequestBody JobDto.UpdateJobRequest req,
        @RequestHeader("X-User-Id") String userId
    ) {
        return ResponseEntity.ok(jobService.updateJob(jobId, req, userId));
    }

    @DeleteMapping("/{jobId}")
    @Operation(summary = "Delete a job posting")
    public ResponseEntity<Void> deleteJob(
        @PathVariable String jobId,
        @RequestHeader("X-User-Id") String userId
    ) {
        jobService.deleteJob(jobId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{jobId}/apply")
    @Operation(summary = "Apply to a job")
    public ResponseEntity<Application> applyToJob(
        @PathVariable String jobId,
        @RequestBody(required = false) JobDto.ApplyJobRequest req,
        @RequestHeader("X-User-Id") String userId
    ) {
        req = req != null ? req : new JobDto.ApplyJobRequest();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(jobService.applyToJob(jobId, userId, req));
    }

    @GetMapping("/{jobId}/applications")
    @Operation(summary = "Get applications for a job (employer only)")
    public ResponseEntity<Page<Application>> getApplications(
        @PathVariable String jobId,
        @RequestHeader("X-User-Id") String userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
            jobService.getApplicationsForJob(jobId, userId, PageRequest.of(page, size))
        );
    }

    @GetMapping("/my-applications")
    @Operation(summary = "Get my job applications")
    public ResponseEntity<Page<Application>> getMyApplications(
        @RequestHeader("X-User-Id") String userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
            jobService.getMyApplications(userId, PageRequest.of(page, size))
        );
    }
}
