package com.example.collegebackend.controller;

import com.example.collegebackend.dto.*;
import com.example.collegebackend.entity.User;
import com.example.collegebackend.repository.UserRepository;
import com.example.collegebackend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPasswordHash())) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
        
        User user = userOpt.get();
        System.out.println("Login - User role from database: " + user.getRole());
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        
        return ResponseEntity.ok(new AuthResponse(token, user.getRole().name(), user.getName(), user.getId()));
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body("Email already exists");
            }
            
            if (userRepository.existsByStudentId(request.getStudentId())) {
                return ResponseEntity.badRequest().body("Student ID already exists");
            }
            
            User user = new User();
            user.setName(request.getName());
            user.setStudentId(request.getStudentId());
            user.setEmail(request.getEmail());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            
            User.Role userRole;
            System.out.println("Received role from request: " + request.getRole());
            if (request.getRole() != null && !request.getRole().isEmpty()) {
                try {
                    userRole = User.Role.valueOf(request.getRole().toUpperCase());
                    System.out.println("Assigned role: " + userRole);
                } catch (IllegalArgumentException e) {
                    System.out.println("Invalid role error: " + request.getRole());
                    return ResponseEntity.badRequest().body("Invalid role: " + request.getRole());
                }
            } else {
                userRole = User.Role.STUDENT;
                System.out.println("Default role assigned: STUDENT");
            }
            user.setRole(userRole);
            System.out.println("User role set to: " + user.getRole());
            
            User savedUser = userRepository.save(user);
            
            String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getId());
            
            return ResponseEntity.ok(new AuthResponse(token, savedUser.getRole().name(), savedUser.getName(), savedUser.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }
}