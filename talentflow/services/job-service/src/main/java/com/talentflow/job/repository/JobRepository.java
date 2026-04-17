package com.talentflow.job.repository;

import com.talentflow.job.model.Job;
import com.talentflow.job.model.Job.JobStatus;
import com.talentflow.job.model.Job.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends JpaRepository<Job, String> {

    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    Page<Job> findByPostedByUserId(String userId, Pageable pageable);

    @Query("""
        SELECT j FROM Job j
        WHERE (:status IS NULL OR j.status = :status)
        AND (:jobType IS NULL OR j.jobType = :jobType)
        AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))
        AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<Job> findWithFilters(
        @Param("status") JobStatus status,
        @Param("jobType") JobType jobType,
        @Param("location") String location,
        @Param("keyword") String keyword,
        Pageable pageable
    );
}
