package com.example.collegebackend.repository;

import com.example.collegebackend.entity.OnDutyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OnDutyRequestRepository extends JpaRepository<OnDutyRequest, Long> {
    List<OnDutyRequest> findByStaffId(Long staffId);
    List<OnDutyRequest> findByStudentId(Long studentId);
    List<OnDutyRequest> findByEventId(Long eventId);
    Optional<OnDutyRequest> findByStudentIdAndEventId(Long studentId, Long eventId);
    boolean existsByStudentIdAndEventId(Long studentId, Long eventId);
}