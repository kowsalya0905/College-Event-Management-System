package com.example.collegebackend.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
public class RegisterRequest {
    @NotBlank
    private String name;
    
    @NotBlank
    private String studentId;
    
    @Email
    @NotBlank
    private String email;
    
    @NotBlank
    private String password;
    
    private String role; // Optional, defaults to STUDENT
}