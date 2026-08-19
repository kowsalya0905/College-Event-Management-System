package com.example.collegebackend.controller;

import com.example.collegebackend.dto.EventRequest;
import com.example.collegebackend.entity.Event;
import com.example.collegebackend.entity.Registration;
import com.example.collegebackend.entity.User;
import com.example.collegebackend.repository.EventRepository;
import com.example.collegebackend.repository.RegistrationRepository;
import com.example.collegebackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:3000")
public class EventController {
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private RegistrationRepository registrationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "2") int size,
            @RequestParam(defaultValue = "eventDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Event> eventPage = eventRepository.findByStatus(Event.Status.PUBLISHED, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", eventPage.getContent());
        response.put("totalPages", eventPage.getTotalPages());
        response.put("totalElements", eventPage.getTotalElements());
        response.put("currentPage", page);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<Event>> getAllEventsForDashboard() {
        List<Event> events = eventRepository.findByStatusOrderByEventDateAsc(Event.Status.PUBLISHED);
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/paginated")
    public ResponseEntity<Page<Event>> getPaginatedEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "2") int size,
            @RequestParam(defaultValue = "eventDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Event> eventPage = eventRepository.findByStatus(Event.Status.PUBLISHED, pageable);
        
        return ResponseEntity.ok(eventPage);
    }
    
    @GetMapping("/admin/all")
    public ResponseEntity<List<Event>> getAllEventsForAdmin(HttpServletRequest httpRequest) {
        String role = (String) httpRequest.getAttribute("userRole");
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        
        List<Event> events = eventRepository.findAllByOrderByEventDateAsc();
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEvent(@PathVariable Long id) {
        Optional<Event> event = eventRepository.findById(id);
        return event.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createEvent(@Valid @RequestBody EventRequest request, HttpServletRequest httpRequest) {
        String role = (String) httpRequest.getAttribute("userRole");
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Access denied");
        }
        
        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setLocation(request.getLocation());
        event.setMaxCapacity(request.getMaxCapacity());
        event.setStatus(Event.Status.valueOf(request.getStatus()));
        
        Event savedEvent = eventRepository.save(event);
        return ResponseEntity.ok(savedEvent);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequest request, HttpServletRequest httpRequest) {
        String role = (String) httpRequest.getAttribute("userRole");
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Access denied");
        }
        
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Event event = eventOpt.get();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setLocation(request.getLocation());
        event.setMaxCapacity(request.getMaxCapacity());
        event.setStatus(Event.Status.valueOf(request.getStatus()));
        
        Event savedEvent = eventRepository.save(event);
        return ResponseEntity.ok(savedEvent);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id, HttpServletRequest httpRequest) {
        String role = (String) httpRequest.getAttribute("userRole");
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Access denied");
        }
        
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        registrationRepository.deleteAll(registrationRepository.findByEventId(id));
        eventRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForEvent(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        
        if (userId == null) {
            return ResponseEntity.status(400).body("Please login to register for events");
        }
        
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Event not found");
        }
        
        Event event = eventOpt.get();
        
        if (registrationRepository.existsByStudentIdAndEventId(userId, id)) {
            return ResponseEntity.badRequest().body("Already registered");
        }
        
        if (event.getMaxCapacity() != null && event.getRegisteredCount() >= event.getMaxCapacity()) {
            return ResponseEntity.badRequest().body("Event is full");
        }
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        Registration registration = new Registration();
        registration.setStudent(userOpt.get());
        registration.setEvent(event);
        registration.setRegistrationDate(LocalDateTime.now());
        
        registrationRepository.save(registration);
        
        event.setRegisteredCount(event.getRegisteredCount() + 1);
        eventRepository.save(event);
        
        return ResponseEntity.ok("Registration successful");
    }
    
    @GetMapping("/{id}/registrations")
    public ResponseEntity<?> getEventRegistrations(@PathVariable Long id, HttpServletRequest httpRequest) {
        String role = (String) httpRequest.getAttribute("userRole");
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Access denied");
        }
        
        List<Registration> registrations = registrationRepository.findByEventId(id);
        return ResponseEntity.ok(registrations);
    }
    
    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRegistration(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        
        if (userId == null) {
            return ResponseEntity.status(403).body("Access denied");
        }
        
        Optional<Registration> registrationOpt = registrationRepository.findByStudentIdAndEventId(userId, id);
        if (registrationOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Registration not found");
        }
        
        Registration registration = registrationOpt.get();
        registrationRepository.delete(registration);
        
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            event.setRegisteredCount(Math.max(0, event.getRegisteredCount() - 1));
            eventRepository.save(event);
        }
        
        return ResponseEntity.ok("Registration cancelled successfully");
    }
    
    @PostMapping("/{eventId}/remove-student/{studentId}")
    public ResponseEntity<?> removeStudentFromEvent(@PathVariable Long eventId, @PathVariable Long studentId, HttpServletRequest httpRequest) {
        String role = (String) httpRequest.getAttribute("userRole");
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Access denied");
        }
        
        Optional<Registration> registrationOpt = registrationRepository.findByStudentIdAndEventId(studentId, eventId);
        if (registrationOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Student not registered for this event");
        }
        
        Registration registration = registrationOpt.get();
        registrationRepository.delete(registration);
        
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            event.setRegisteredCount(Math.max(0, event.getRegisteredCount() - 1));
            eventRepository.save(event);
        }
        
        return ResponseEntity.ok("Student removed from event successfully");
    }
}