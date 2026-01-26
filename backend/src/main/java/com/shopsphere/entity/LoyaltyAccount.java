package com.shopsphere.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "loyalty_account_id")
    private Long loyaltyAccountId;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;

    @Min(value = 0, message = "Points balance cannot be negative")
    @Column(name = "points_balance", nullable = false)
    private Integer pointsBalance = 0;

    @Min(value = 0, message = "Total earned cannot be negative")
    @Column(name = "total_earned", nullable = false)
    private Integer totalEarned = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (pointsBalance == null) {
            pointsBalance = 0;
        }
        if (totalEarned == null) {
            totalEarned = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public void addPoints(int points) {
        this.pointsBalance += points;
        this.totalEarned += points;
    }

    public void deductPoints(int points) {
        if (this.pointsBalance < points) {
            throw new IllegalArgumentException("Insufficient points balance");
        }
        this.pointsBalance -= points;
    }

    public boolean hasEnoughPoints(int requiredPoints) {
        return this.pointsBalance >= requiredPoints;
    }
}
