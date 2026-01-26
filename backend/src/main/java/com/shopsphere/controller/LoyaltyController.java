package com.shopsphere.controller;

import com.shopsphere.dto.LoyaltyDTO;
import com.shopsphere.dto.RedeemRewardRequest;
import com.shopsphere.service.LoyaltyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    /**
     * Get loyalty account details for a user
     * Accessible by: Customer (own account) or Admin (any account)
     */
    @GetMapping("/{userId}")
    public ResponseEntity<LoyaltyDTO> getLoyaltyAccount(@PathVariable Long userId) {
        log.info("GET /api/loyalty/{} - Getting loyalty account", userId);
        try {
            LoyaltyDTO loyaltyDTO = loyaltyService.getAccountDetails(userId);
            return ResponseEntity.ok(loyaltyDTO);
        } catch (Exception e) {
            log.error("Error fetching loyalty account: ", e);
            throw e;
        }
    }

    /**
     * Redeem points for a reward
     * Accessible by: Customer
     */
    @PostMapping("/redeem")
    public ResponseEntity<Map<String, Object>> redeemReward(@Valid @RequestBody RedeemRewardRequest request) {
        log.info("POST /api/loyalty/redeem - User {} redeeming {} points", request.getUserId(), request.getPoints());
        try {
            String discountCode = loyaltyService.redeemReward(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Reward claimed successfully!");
            response.put("discountCode", discountCode);
            response.put("pointsRedeemed", request.getPoints());
            response.put("rewardName", request.getRewardName());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Reward redemption failed: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("Error redeeming reward: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to redeem reward. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get all loyalty accounts (Admin only)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoyaltyDTO>> getAllLoyaltyAccounts() {
        log.info("GET /api/loyalty/admin/all - Admin fetching all loyalty accounts");
        try {
            List<LoyaltyDTO> accounts = loyaltyService.getAllAccounts();
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            log.error("Error fetching all loyalty accounts: ", e);
            throw e;
        }
    }

    /**
     * Get specific user's loyalty details (Admin only)
     */
    @GetMapping("/admin/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoyaltyDTO> getUserLoyaltyDetails(@PathVariable Long userId) {
        log.info("GET /api/loyalty/admin/user/{} - Admin fetching user loyalty details", userId);
        try {
            LoyaltyDTO loyaltyDTO = loyaltyService.getUserLoyaltyDetails(userId);
            return ResponseEntity.ok(loyaltyDTO);
        } catch (Exception e) {
            log.error("Error fetching user loyalty details: ", e);
            throw e;
        }
    }

    /**
     * Get loyalty program statistics (Admin only)
     */
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoyaltyService.LoyaltyStatsDTO> getLoyaltyStats() {
        log.info("GET /api/loyalty/admin/stats - Admin fetching loyalty stats");
        try {
            LoyaltyService.LoyaltyStatsDTO stats = loyaltyService.getStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching loyalty stats: ", e);
            throw e;
        }
    }
}
