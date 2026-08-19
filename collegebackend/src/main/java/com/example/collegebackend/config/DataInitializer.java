package com.example.collegebackend.config;

import com.example.collegebackend.entity.User;
import com.example.collegebackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@college.edu")) {
            User admin = new User();
            admin.setName("Admin User");
            admin.setStudentId("ADMIN001");
            admin.setEmail("admin@college.edu");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
        }
    }
}