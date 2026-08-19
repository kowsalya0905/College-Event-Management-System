package com.example.collegebackend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "http://localhost:3000")
public class HealthController {
    
    @GetMapping
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Backend server is running");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/auth")
    public ResponseEntity<Map<String, Object>> authTest(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", request.getAttribute("userId"));
        response.put("userRole", request.getAttribute("userRole"));
        response.put("authHeader", request.getHeader("Authorization"));
        response.put("requestURI", request.getRequestURI());
        response.put("method", request.getMethod());
        return ResponseEntity.ok(response);
    }
}