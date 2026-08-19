package com.example.collegebackend.controller;

import com.example.collegebackend.entity.OnDutyRequest;
import com.example.collegebackend.entity.User;
import com.example.collegebackend.entity.Event;
import com.example.collegebackend.repository.OnDutyRequestRepository;
import com.example.collegebackend.repository.UserRepository;
import com.example.collegebackend.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/onduty")
@CrossOrigin(origins = "http://localhost:3000")
public class OnDutyController {
    
    @Autowired
    private OnDutyRequestRepository onDutyRequestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    @GetMapping("/staff")
    public ResponseEntity<List<User>> getAllStaff() {
        List<User> staff = userRepository.findByRole(User.Role.STAFF);
        return ResponseEntity.ok(staff);
    }
    
    @PostMapping("/request")
    public ResponseEntity<?> createOnDutyRequest(@RequestBody Map<String, Long> request, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body("Authentication required");
        }
        
        Long staffId = request.get("staffId");
        Long eventId = request.get("eventId");
        
        if (onDutyRequestRepository.existsByStudentIdAndEventId(userId, eventId)) {
            return ResponseEntity.badRequest().body("On-duty request already exists for this event");
        }
        
        Optional<User> studentOpt = userRepository.findById(userId);
        Optional<User> staffOpt = userRepository.findById(staffId);
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        
        if (studentOpt.isEmpty() || staffOpt.isEmpty() || eventOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid student, staff, or event");
        }
        
        OnDutyRequest onDutyRequest = new OnDutyRequest();
        onDutyRequest.setStudent(studentOpt.get());
        onDutyRequest.setStaff(staffOpt.get());
        onDutyRequest.setEvent(eventOpt.get());
        onDutyRequest.setRequestDate(LocalDateTime.now());
        
        onDutyRequestRepository.save(onDutyRequest);
        return ResponseEntity.ok("On-duty request submitted successfully");
    }
    
    @GetMapping("/staff/{staffId}/requests")
    public ResponseEntity<List<OnDutyRequest>> getStaffRequests(@PathVariable Long staffId) {
        List<OnDutyRequest> requests = onDutyRequestRepository.findByStaffId(staffId);
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/student/{studentId}/requests")
    public ResponseEntity<List<OnDutyRequest>> getStudentRequests(@PathVariable Long studentId) {
        List<OnDutyRequest> requests = onDutyRequestRepository.findByStudentId(studentId);
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/event/{eventId}/requests")
    public ResponseEntity<List<OnDutyRequest>> getEventRequests(@PathVariable Long eventId) {
        List<OnDutyRequest> requests = onDutyRequestRepository.findByEventId(eventId);
        return ResponseEntity.ok(requests);
    }
    
    @PutMapping("/{requestId}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long requestId, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body("Authentication required");
        }
        
        Optional<OnDutyRequest> requestOpt = onDutyRequestRepository.findById(requestId);
        if (requestOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Request not found");
        }
        
        OnDutyRequest onDutyRequest = requestOpt.get();
        if (!onDutyRequest.getStaff().getId().equals(userId)) {
            return ResponseEntity.status(403).body("Not authorized to approve this request");
        }
        
        onDutyRequest.setStatus(OnDutyRequest.Status.APPROVED);
        onDutyRequest.setResponseDate(LocalDateTime.now());
        onDutyRequestRepository.save(onDutyRequest);
        
        return ResponseEntity.ok("Request approved successfully");
    }
    
    @PutMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId, @RequestBody Map<String, String> body, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body("Authentication required");
        }
        
        Optional<OnDutyRequest> requestOpt = onDutyRequestRepository.findById(requestId);
        if (requestOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Request not found");
        }
        
        OnDutyRequest onDutyRequest = requestOpt.get();
        if (!onDutyRequest.getStaff().getId().equals(userId)) {
            return ResponseEntity.status(403).body("Not authorized to reject this request");
        }
        
        onDutyRequest.setStatus(OnDutyRequest.Status.REJECTED);
        onDutyRequest.setRejectionReason(body.get("reason"));
        onDutyRequest.setResponseDate(LocalDateTime.now());
        onDutyRequestRepository.save(onDutyRequest);
        
        return ResponseEntity.ok("Request rejected successfully");
    }
}