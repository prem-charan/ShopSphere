package com.shopsphere.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "order_id")
    private Long orderId;

    @NotNull(message = "Points value is required")
    @Column(name = "points", nullable = false)
    private Integer points; // Can be positive (earned) or negative (redeemed)

    @NotBlank(message = "Transaction type is required")
    @Column(name = "type", nullable = false, length = 20)
    private String type; // EARNED, REDEEMED

    @NotBlank(message = "Description is required")
    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Helper method to check if transaction is earning points
    public boolean isEarned() {
        return "EARNED".equalsIgnoreCase(this.type);
    }

    // Helper method to check if transaction is redeeming points
    public boolean isRedeemed() {
        return "REDEEMED".equalsIgnoreCase(this.type);
    }
}
