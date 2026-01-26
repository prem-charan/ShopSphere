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
import java.time.LocalDateTime;
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
        User user = userRepository.findById(userId)
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

        // Check sufficient balance
        if (!account.hasEnoughPoints(request.getPoints())) {
            throw new IllegalArgumentException("Insufficient points balance. Required: " + request.getPoints() + ", Available: " + account.getPointsBalance());
        }

        // Deduct points
        account.deductPoints(request.getPoints());
        loyaltyAccountRepository.save(account);

        // Generate discount code
        String discountCode = generateDiscountCode(request.getUserId());

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
     */
    private String generateDiscountCode(Long userId) {
        long timestamp = System.currentTimeMillis();
        return "REWARD-" + userId + "-" + timestamp;
    }

    /**
     * Convert transaction entity to DTO
     */
    private LoyaltyDTO.TransactionDTO convertToTransactionDTO(LoyaltyTransaction transaction) {
        return new LoyaltyDTO.TransactionDTO(
                transaction.getTransactionId(),
                transaction.getOrderId(),
                transaction.getPoints(),
                transaction.getType(),
                transaction.getDescription(),
                transaction.getCreatedAt()
        );
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
    public Map<String, Object> validateDiscountCode(String code) {
        log.info("Validating discount code: {}", code);
        
        Map<String, Object> result = new HashMap<>();
        
        // Check if code follows pattern: REWARD-{userId}-{timestamp}
        if (!code.startsWith("REWARD-")) {
            log.warn("Invalid code format - doesn't start with REWARD-: {}", code);
            result.put("valid", false);
            result.put("message", "Invalid discount code format");
            return result;
        }

        // Extract userId from code
        String[] parts = code.split("-");
        if (parts.length != 3) {
            log.warn("Invalid code format - wrong number of parts: {}", code);
            result.put("valid", false);
            result.put("message", "Invalid discount code format");
            return result;
        }

        try {
            Long userId = Long.parseLong(parts[1]);
            log.info("Extracted userId {} from code", userId);
            
            // Check if this discount code has already been used in any order
            boolean alreadyUsed = orderRepository.existsByDiscountCode(code);
            if (alreadyUsed) {
                log.warn("Discount code {} has already been used in an order", code);
                result.put("valid", false);
                result.put("message", "This discount code has already been used");
                return result;
            }
            
            // Check if this code exists in transactions
            List<LoyaltyTransaction> transactions = loyaltyTransactionRepository.findByUserIdAndType(userId, "REDEEMED");
            log.info("Found {} REDEEMED transactions for user {}", transactions.size(), userId);
            
            // Log all transaction descriptions for debugging
            for (LoyaltyTransaction t : transactions) {
                log.info("Transaction description: {}", t.getDescription());
            }
            
            boolean codeExists = transactions.stream()
                    .anyMatch(t -> t.getDescription().contains(code));

            if (!codeExists) {
                log.warn("Discount code {} not found in transactions", code);
                result.put("valid", false);
                result.put("message", "Discount code not found or already used");
                return result;
            }

            // Extract discount amount from code (from transaction description)
            LoyaltyTransaction transaction = transactions.stream()
                    .filter(t -> t.getDescription().contains(code))
                    .findFirst()
                    .orElse(null);

            if (transaction == null) {
                log.error("Transaction not found even though code exists");
                result.put("valid", false);
                result.put("message", "Discount code not found");
                return result;
            }

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

            result.put("valid", true);
            result.put("discountAmount", discountAmount);
            result.put("message", "Discount code is valid");
            result.put("code", code);
            
            log.info("Discount code validated successfully: {} - ₹{} off", code, discountAmount);
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

    // Inner class for stats
    @Data
    @AllArgsConstructor
    public static class LoyaltyStatsDTO {
        private Long totalMembers;
        private Long totalPoints;
    }
}
