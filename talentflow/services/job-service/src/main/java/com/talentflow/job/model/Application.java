package com.talentflow.job.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "applications", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"job_id", "applicant_user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @Column(columnDefinition = "VARCHAR(36)")
    private String id;

    @Column(name = "job_id", nullable = false, length = 36)
    private String jobId;

    @Column(name = "applicant_user_id", nullable = false, length = 36)
    private String applicantUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    @Column(length = 2000)
    private String coverLetter;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime appliedAt;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.status == null) {
            this.status = ApplicationStatus.APPLIED;
        }
    }

    public enum ApplicationStatus {
        APPLIED, REVIEWED, SHORTLISTED, REJECTED, HIRED
    }
}
