package com.shopsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long paymentId;
    private Long orderId;
    private Long customerId;
    private BigDecimal amount;
    private String paymentMethod;
    private String status;
    private String transactionId;
    private String upiId;
    private String failureReason;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
