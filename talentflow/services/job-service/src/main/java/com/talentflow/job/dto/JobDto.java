package com.talentflow.job.dto;

import com.talentflow.job.model.Job.JobStatus;
import com.talentflow.job.model.Job.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

public class JobDto {

    @Data
    public static class CreateJobRequest {
        @NotBlank(message = "Title is required")
        @Size(max = 200)
        private String title;

        @NotBlank(message = "Description is required")
        @Size(max = 2000)
        private String description;

        @NotBlank(message = "Company is required")
        private String company;

        @NotBlank(message = "Location is required")
        private String location;

        @NotNull(message = "Job type is required")
        private JobType jobType;

        private BigDecimal salaryMin;
        private BigDecimal salaryMax;
    }

    @Data
    public static class UpdateJobRequest {
        @Size(max = 200)
        private String title;

        @Size(max = 2000)
        private String description;

        private String location;
        private JobType jobType;
        private JobStatus status;
        private BigDecimal salaryMin;
        private BigDecimal salaryMax;
    }

    @Data
    public static class JobResponse {
        private String id;
        private String title;
        private String description;
        private String company;
        private String location;
        private JobType jobType;
        private JobStatus status;
        private BigDecimal salaryMin;
        private BigDecimal salaryMax;
        private String postedByUserId;
        private String createdAt;
        private String updatedAt;
    }

    @Data
    public static class ApplyJobRequest {
        @Size(max = 2000)
        private String coverLetter;
    }

    @Data
    public static class ApplicationResponse {
        private String id;
        private String jobId;
        private String applicantUserId;
        private String status;
        private String coverLetter;
        private String appliedAt;
    }
}
