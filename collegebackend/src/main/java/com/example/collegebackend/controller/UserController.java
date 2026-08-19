package com.example.collegebackend.controller;

import com.example.collegebackend.entity.Registration;
import com.example.collegebackend.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    
    @Autowired
    private RegistrationRepository registrationRepository;
    
    @GetMapping("/{userId}/events")
    public ResponseEntity<List<Registration>> getUserEvents(@PathVariable Long userId) {
        List<Registration> registrations = registrationRepository.findByStudentId(userId);
        return ResponseEntity.ok(registrations);
    }
}