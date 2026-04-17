package com.talentflow.job.service;

import com.talentflow.job.dto.JobDto;
import com.talentflow.job.kafka.JobEventProducer;
import com.talentflow.job.model.Job;
import com.talentflow.job.repository.ApplicationRepository;
import com.talentflow.job.repository.JobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock JobRepository jobRepository;
    @Mock ApplicationRepository applicationRepository;
    @Mock JobEventProducer eventProducer;

    @InjectMocks JobService jobService;

    private Job sampleJob;

    @BeforeEach
    void setUp() {
        sampleJob = Job.builder()
            .id("job-123")
            .title("Senior Java Developer")
            .company("TechCorp")
            .location("Remote")
            .description("Join our team!")
            .jobType(Job.JobType.REMOTE)
            .status(Job.JobStatus.OPEN)
            .postedByUserId("user-456")
            .build();
    }

    @Test
    void createJob_shouldPersistAndPublishEvent() {
        // Given
        var req = new JobDto.CreateJobRequest();
        req.setTitle("Senior Java Developer");
        req.setDescription("Join our team!");
        req.setCompany("TechCorp");
        req.setLocation("Remote");
        req.setJobType(Job.JobType.REMOTE);
        req.setSalaryMin(BigDecimal.valueOf(80000));
        req.setSalaryMax(BigDecimal.valueOf(120000));

        when(jobRepository.save(any(Job.class))).thenReturn(sampleJob);
        doNothing().when(eventProducer).publishJobPosted(anyMap());

        // When
        Job result = jobService.createJob(req, "user-456");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Senior Java Developer");
        verify(jobRepository, times(1)).save(any(Job.class));
        verify(eventProducer, times(1)).publishJobPosted(anyMap());
    }

    @Test
    void getJobById_shouldThrowWhenNotFound() {
        when(jobRepository.findById("non-existent")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> jobService.getJobById("non-existent"))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Job not found");
    }

    @Test
    void listJobs_shouldReturnPagedResults() {
        Page<Job> mockPage = new PageImpl<>(List.of(sampleJob));
        when(jobRepository.findWithFilters(any(), any(), any(), any(), any()))
            .thenReturn(mockPage);

        Page<Job> result = jobService.listJobs(null, null, null, null, PageRequest.of(0, 10));
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Senior Java Developer");
    }

    @Test
    void deleteJob_shouldThrowWhenNotOwner() {
        when(jobRepository.findById("job-123")).thenReturn(Optional.of(sampleJob));
        assertThatThrownBy(() -> jobService.deleteJob("job-123", "different-user"))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Not authorized");
    }

    @Test
    void applyToJob_shouldThrowWhenJobClosed() {
        sampleJob.setStatus(Job.JobStatus.CLOSED);
        when(jobRepository.findById("job-123")).thenReturn(Optional.of(sampleJob));

        var req = new JobDto.ApplyJobRequest();
        assertThatThrownBy(() -> jobService.applyToJob("job-123", "applicant-1", req))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("not open");
    }
}
