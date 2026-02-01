package com.shopsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyDTO {

    private Long loyaltyAccountId;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private Integer pointsBalance;
    private Integer totalEarned;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TransactionDTO> recentTransactions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionDTO {
        private Long transactionId;
        private Long orderId;
        private Integer points;
        private String type;
        private String description;
        private LocalDateTime createdAt;
        private String displayType; // "EARNED", "REDEEMED", or "ACTIVE" for unused coupons
        
        // Constructor without displayType for backwards compatibility
        public TransactionDTO(Long transactionId, Long orderId, Integer points, 
                            String type, String description, LocalDateTime createdAt) {
            this.transactionId = transactionId;
            this.orderId = orderId;
            this.points = points;
            this.type = type;
            this.description = description;
            this.createdAt = createdAt;
            this.displayType = type; // Default to type
        }
    }

    // Constructor without transactions (for list views)
    public LoyaltyDTO(Long loyaltyAccountId, Long userId, String userName, String userEmail, String userPhone,
                      Integer pointsBalance, Integer totalEarned, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.loyaltyAccountId = loyaltyAccountId;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userPhone = userPhone;
        this.pointsBalance = pointsBalance;
        this.totalEarned = totalEarned;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
