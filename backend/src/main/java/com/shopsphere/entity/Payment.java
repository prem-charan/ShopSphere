package com.shopsphere.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @NotNull(message = "Order ID is required")
    @Column(nullable = false)
    private Long orderId;

    @NotNull(message = "Customer ID is required")
    @Column(nullable = false)
    private Long customerId;

    @NotNull(message = "Amount is required")
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;

    @NotBlank(message = "Payment method is required")
    @Column(nullable = false, length = 20)
    private String paymentMethod; // UPI, COD

    @NotBlank(message = "Status is required")
    @Column(nullable = false, length = 20)
    private String status; // INITIATED, PROCESSING, SUCCESS, FAILED

    @Column(length = 100, unique = true)
    private String transactionId; // Mock transaction ID

    // For UPI payments
    @Column(length = 100)
    private String upiId;

    @Column(columnDefinition = "TEXT")
    private String failureReason;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public boolean isSuccessful() {
        return "SUCCESS".equalsIgnoreCase(status);
    }

    public boolean isFailed() {
        return "FAILED".equalsIgnoreCase(status);
    }

    public boolean isPending() {
        return "INITIATED".equalsIgnoreCase(status) || "PROCESSING".equalsIgnoreCase(status);
    }
}
