package com.shopsphere.service;

import com.shopsphere.dto.LoyaltyDTO;
import com.shopsphere.dto.RedeemRewardRequest;
import com.shopsphere.entity.LoyaltyAccount;
import com.shopsphere.entity.LoyaltyTransaction;
import com.shopsphere.entity.User;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.LoyaltyAccountRepository;
import com.shopsphere.repository.LoyaltyTransactionRepository;
import com.shopsphere.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoyaltyService {

    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final UserRepository userRepository;
    private final com.shopsphere.repository.OrderRepository orderRepository;

    // Points calculation: ₹100 = 1 point
    private static final int POINTS_PER_HUNDRED_RUPEES = 1;

    /**
     * Get or create loyalty account for user
     */
    @Transactional
    public LoyaltyAccount getOrCreateAccount(Long userId) {
        log.info("Getting or creating loyalty account for user: {}", userId);
        
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return loyaltyAccountRepository.findByUserId(userId)
                .orElseGet(() -> {
                    LoyaltyAccount newAccount = new LoyaltyAccount();
                    newAccount.setUserId(userId);
                    newAccount.setPointsBalance(0);
                    newAccount.setTotalEarned(0);
                    return loyaltyAccountRepository.save(newAccount);
                });
    }

    /**
     * Get loyalty account details with transactions
     */
    @Transactional(readOnly = true)
    public LoyaltyDTO getAccountDetails(Long userId) {
        log.info("Fetching loyalty account details for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        LoyaltyAccount account = getOrCreateAccount(userId);
        List<LoyaltyTransaction> transactions = loyaltyTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId);

        LoyaltyDTO dto = new LoyaltyDTO();
        dto.setLoyaltyAccountId(account.getLoyaltyAccountId());
        dto.setUserId(account.getUserId());
        dto.setUserName(user.getName());
        dto.setUserEmail(user.getEmail());
        dto.setUserPhone(user.getPhone());
        dto.setPointsBalance(account.getPointsBalance());
        dto.setTotalEarned(account.getTotalEarned());
        dto.setCreatedAt(account.getCreatedAt());
        dto.setUpdatedAt(account.getUpdatedAt());
        dto.setRecentTransactions(transactions.stream()
                .map(this::convertToTransactionDTO)
                .collect(Collectors.toList()));

        return dto;
    }

    /**
     * Earn points from order
     */
    @Transactional
    public void earnPointsFromOrder(Long userId, Long orderId, BigDecimal orderAmount) {
        log.info("User {} earning points from order {} (amount: {})", userId, orderId, orderAmount);

        // Check if points already awarded for this order
        if (loyaltyTransactionRepository.existsByOrderId(orderId)) {
            log.warn("Points already awarded for order: {}", orderId);
            return;
        }

        // Calculate points
        int points = calculatePointsForAmount(orderAmount);
        
        if (points <= 0) {
            log.info("No points to award (amount too low)");
            return;
        }

        // Get or create account
        LoyaltyAccount account = getOrCreateAccount(userId);

        // Add points
        account.addPoints(points);
        loyaltyAccountRepository.save(account);

        // Create transaction record
        LoyaltyTransaction transaction = new LoyaltyTransaction();
        transaction.setUserId(userId);
        transaction.setOrderId(orderId);
        transaction.setPoints(points);
        transaction.setType("EARNED");
        transaction.setDescription("Points earned from Order #" + orderId);
        loyaltyTransactionRepository.save(transaction);

        log.info("Successfully awarded {} points to user {}", points, userId);
    }

    /**
     * Redeem points for reward
     */
    @Transactional
    public String redeemReward(RedeemRewardRequest request) {
        log.info("User {} redeeming {} points for {}", request.getUserId(), request.getPoints(), request.getRewardName());

        LoyaltyAccount account = getOrCreateAccount(request.getUserId());

        // Check if user already has an active (unused) coupon code
        String activeCoupon = getActiveCouponForUser(request.getUserId());
        if (activeCoupon != null) {
            log.warn("User {} already has an active coupon: {}", request.getUserId(), activeCoupon);
            throw new IllegalArgumentException("You already have an active coupon code: " + activeCoupon + ". Please use it before redeeming a new one.");
        }

        // Check sufficient balance
        if (!account.hasEnoughPoints(request.getPoints())) {
            throw new IllegalArgumentException("Insufficient points balance. Required: " + request.getPoints() + ", Available: " + account.getPointsBalance());
        }

        // Deduct points
        account.deductPoints(request.getPoints());
        loyaltyAccountRepository.save(account);

        // Generate discount code with reward amount
        String discountCode = generateDiscountCode(request.getRewardName());

        // Create transaction record
        LoyaltyTransaction transaction = new LoyaltyTransaction();
        transaction.setUserId(request.getUserId());
        transaction.setOrderId(null);
        transaction.setPoints(-request.getPoints()); // Negative for redeemed
        transaction.setType("REDEEMED");
        transaction.setDescription("Redeemed: " + request.getRewardName() + " (Code: " + discountCode + ")");
        loyaltyTransactionRepository.save(transaction);

        log.info("Successfully redeemed reward. Discount code: {}", discountCode);
        return discountCode;
    }

    /**
     * Get all loyalty accounts (Admin)
     */
    @Transactional(readOnly = true)
    public List<LoyaltyDTO> getAllAccounts() {
        log.info("Fetching all loyalty accounts");

        return loyaltyAccountRepository.findAll().stream()
                .map(account -> {
                    User user = userRepository.findById(account.getUserId())
                            .orElse(null);
                    
                    if (user == null) {
                        return null;
                    }

                    return new LoyaltyDTO(
                            account.getLoyaltyAccountId(),
                            account.getUserId(),
                            user.getName(),
                            user.getEmail(),
                            user.getPhone(),
                            account.getPointsBalance(),
                            account.getTotalEarned(),
                            account.getCreatedAt(),
                            account.getUpdatedAt()
                    );
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    /**
     * Get specific user's loyalty details (Admin)
     */
    @Transactional(readOnly = true)
    public LoyaltyDTO getUserLoyaltyDetails(Long userId) {
        log.info("Admin fetching loyalty details for user: {}", userId);
        return getAccountDetails(userId);
    }

    /**
     * Calculate points for order amount
     * Formula: ₹100 = 10 points
     */
    private int calculatePointsForAmount(BigDecimal amount) {
        if (amount == null) {
            return 0;
        }
        // Convert to integer rupees and calculate points
        int rupees = amount.intValue();
        return (rupees / 100) * POINTS_PER_HUNDRED_RUPEES;
    }

    /**
     * Generate unique discount code
     * Format: REWARD-{AMOUNT}OFF-{timestamp}
     * Example: REWARD-50OFF-1234567890123
     */
    private String generateDiscountCode(String rewardName) {
        long timestamp = System.currentTimeMillis();
        
        // Extract amount from reward name (e.g., "₹50 Off" -> "50")
        String amountStr = rewardName.replaceAll("[^0-9]", "");
        
        return "REWARD-" + amountStr + "OFF-" + timestamp;
    }

    /**
     * Convert transaction entity to DTO
     */
    private LoyaltyDTO.TransactionDTO convertToTransactionDTO(LoyaltyTransaction transaction) {
        LoyaltyDTO.TransactionDTO dto = new LoyaltyDTO.TransactionDTO(
                transaction.getTransactionId(),
                transaction.getOrderId(),
                transaction.getPoints(),
                transaction.getType(),
                transaction.getDescription(),
                transaction.getCreatedAt()
        );
        
        // For REDEEMED transactions, check if the coupon has been used
        if ("REDEEMED".equals(transaction.getType())) {
            String description = transaction.getDescription();
            int codeStart = description.indexOf("Code: ");
            if (codeStart != -1) {
                String code = description.substring(codeStart + 6, description.length() - 1);
                
                // Check if this code has been used in an order
                boolean isUsed = orderRepository.existsByDiscountCode(code);
                if (isUsed) {
                    dto.setDisplayType("REDEEMED");
                } else {
                    dto.setDisplayType("ACTIVE");
                }
            }
        } else {
            dto.setDisplayType(transaction.getType()); // EARNED
        }
        
        return dto;
    }

    /**
     * Get loyalty program statistics (Admin)
     */
    @Transactional(readOnly = true)
    public LoyaltyStatsDTO getStats() {
        Long totalMembers = loyaltyAccountRepository.countTotalMembers();
        Long totalPoints = loyaltyAccountRepository.getTotalPointsInCirculation();

        return new LoyaltyStatsDTO(
                totalMembers != null ? totalMembers : 0L,
                totalPoints != null ? totalPoints : 0L
        );
    }

    /**
     * Validate discount code and return discount details
     */
    @Transactional(readOnly = true)
    public Map<String, Object> validateDiscountCode(String code, BigDecimal orderTotal) {
        log.info("Validating discount code: {} with order total: {}", code, orderTotal);
        
        Map<String, Object> result = new HashMap<>();
        
        // Check if code follows pattern: REWARD-{AMOUNT}OFF-{timestamp}
        if (!code.startsWith("REWARD-")) {
            log.warn("Invalid code format - doesn't start with REWARD-: {}", code);
            result.put("valid", false);
            result.put("message", "Invalid discount code format");
            return result;
        }

        String[] parts = code.split("-");
        if (parts.length != 3) {
            log.warn("Invalid code format - wrong number of parts: {}", code);
            result.put("valid", false);
            result.put("message", "Invalid discount code format");
            return result;
        }

        try {
            // Check if this discount code has already been used in any order
            boolean alreadyUsed = orderRepository.existsByDiscountCode(code);
            if (alreadyUsed) {
                log.warn("Discount code {} has already been used in an order", code);
                result.put("valid", false);
                result.put("message", "This discount code has already been used");
                return result;
            }
            
            // Search for this code in ALL redemption transactions (across all users)
            List<LoyaltyTransaction> allTransactions = loyaltyTransactionRepository.findByType("REDEEMED");
            log.info("Searching for code {} in {} total REDEEMED transactions", code, allTransactions.size());
            
            // Find transaction containing this specific code
            LoyaltyTransaction transaction = allTransactions.stream()
                    .filter(t -> t.getDescription().contains(code))
                    .findFirst()
                    .orElse(null);

            if (transaction == null) {
                log.warn("Discount code {} not found in any transactions", code);
                result.put("valid", false);
                result.put("message", "Discount code not found or invalid");
                return result;
            }
            
            log.info("Found transaction for code. User: {}, Description: {}", 
                    transaction.getUserId(), transaction.getDescription());

            // Parse discount amount from description like "Redeemed: ₹50 Off (Code: ...)"
            String description = transaction.getDescription();
            log.info("Parsing discount from description: {}", description);
            int discountAmount = 0;
            
            // IMPORTANT: Check larger amounts FIRST to avoid substring matching
            // e.g., "₹150 Off" contains "50 Off" so we need to check 500, then 150, then 50
            if (description.contains("₹500 Off") || description.contains("500 Off")) {
                discountAmount = 500;
                log.info("Matched ₹500 Off discount");
            } else if (description.contains("₹150 Off") || description.contains("150 Off")) {
                discountAmount = 150;
                log.info("Matched ₹150 Off discount");
            } else if (description.contains("₹50 Off") || description.contains("50 Off")) {
                discountAmount = 50;
                log.info("Matched ₹50 Off discount");
            }

            if (discountAmount == 0) {
                log.warn("Could not parse discount amount from description: {}", description);
                result.put("valid", false);
                result.put("message", "Invalid discount code");
                return result;
            }

            // Validate minimum order amount requirements
            BigDecimal minimumOrderAmount = getMinimumOrderAmount(discountAmount);
            if (orderTotal.compareTo(minimumOrderAmount) < 0) {
                log.warn("Order total {} is below minimum required {} for discount code {}", 
                    orderTotal, minimumOrderAmount, code);
                result.put("valid", false);
                result.put("message", String.format("Minimum order amount of ₹%s required for this discount code", minimumOrderAmount));
                result.put("minimumOrderAmount", minimumOrderAmount);
                return result;
            }

            result.put("valid", true);
            result.put("discountAmount", discountAmount);
            result.put("message", "Discount code is valid");
            result.put("code", code);
            result.put("minimumOrderAmount", minimumOrderAmount);
            
            log.info("Discount code validated successfully: {} - ₹{} off (min order: ₹{})", 
                code, discountAmount, minimumOrderAmount);
            return result;
            
        } catch (NumberFormatException e) {
            log.error("Error parsing user ID from discount code: {}", code, e);
            result.put("valid", false);
            result.put("message", "Invalid discount code format");
            return result;
        } catch (Exception e) {
            log.error("Unexpected error validating discount code: {}", code, e);
            result.put("valid", false);
            result.put("message", "Error validating discount code");
            return result;
        }
    }

    /**
     * Get minimum order amount required for a given discount
     */
    private BigDecimal getMinimumOrderAmount(int discountAmount) {
        switch (discountAmount) {
            case 500:
                return BigDecimal.valueOf(750);
            case 150:
            case 50:
                return BigDecimal.valueOf(500);
            default:
                return BigDecimal.valueOf(500);
        }
    }

    /**
     * Get active (unused) coupon code for a user
     * Returns the coupon code if one exists and hasn't been used yet, null otherwise
     */
    public String getActiveCouponForUser(Long userId) {
        log.info("Checking for active coupon for user: {}", userId);
        
        // Get all redemption transactions for this user
        List<LoyaltyTransaction> redemptions = loyaltyTransactionRepository.findByUserIdAndType(userId, "REDEEMED");
        
        // Check each redeemed code to see if it's been used in an order
        for (LoyaltyTransaction transaction : redemptions) {
            String description = transaction.getDescription();
            // Extract code from description like "Redeemed: ₹50 Off (Code: REWARD-50OFF-123)"
            int codeStart = description.indexOf("Code: ");
            if (codeStart != -1) {
                String code = description.substring(codeStart + 6, description.length() - 1); // Remove trailing ")"
                
                // Check if this code has been used in any order
                boolean isUsed = orderRepository.existsByDiscountCode(code);
                if (!isUsed) {
                    log.info("Found active coupon for user {}: {}", userId, code);
                    return code;
                }
            }
        }
        
        log.info("No active coupon found for user: {}", userId);
        return null;
    }

    // Inner class for stats
    @Data
    @AllArgsConstructor
    public static class LoyaltyStatsDTO {
        private Long totalMembers;
        private Long totalPoints;
    }
}
