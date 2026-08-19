package com.example.collegebackend.repository;

import com.example.collegebackend.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatusOrderByEventDateAsc(Event.Status status);
    List<Event> findAllByOrderByEventDateAsc();
    Page<Event> findByStatus(Event.Status status, Pageable pageable);
}