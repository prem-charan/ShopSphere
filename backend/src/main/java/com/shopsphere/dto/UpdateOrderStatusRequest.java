package com.shopsphere.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {

    @NotBlank(message = "Status is required")
    private String status; // CONFIRMED, SHIPPED, DELIVERED, CANCELLED

    private String trackingNumber; // Optional, for SHIPPED status
}
