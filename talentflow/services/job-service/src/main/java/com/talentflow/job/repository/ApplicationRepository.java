package com.talentflow.job.repository;

import com.talentflow.job.model.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, String> {

    boolean existsByJobIdAndApplicantUserId(String jobId, String applicantUserId);

    Page<Application> findByJobId(String jobId, Pageable pageable);

    Page<Application> findByApplicantUserId(String applicantUserId, Pageable pageable);

    Optional<Application> findByJobIdAndApplicantUserId(String jobId, String applicantUserId);
}
