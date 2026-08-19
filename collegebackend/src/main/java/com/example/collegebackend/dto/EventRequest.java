package com.example.collegebackend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class EventRequest {
    @NotBlank
    private String title;
    
    private String description;
    
    @NotNull
    private LocalDate eventDate;
    
    @NotNull
    private LocalTime startTime;
    
    @NotNull
    private LocalTime endTime;
    
    @NotBlank
    private String location;
    
    private Integer maxCapacity;
    
    @NotBlank
    private String status;
}