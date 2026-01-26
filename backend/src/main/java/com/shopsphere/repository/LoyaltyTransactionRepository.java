package com.shopsphere.repository;

import com.shopsphere.entity.LoyaltyTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, Long> {

    /**
     * Find all transactions for a specific user, ordered by date descending
     */
    List<LoyaltyTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find transactions by order ID
     */
    List<LoyaltyTransaction> findByOrderId(Long orderId);

    /**
     * Find transactions by user and type
     */
    List<LoyaltyTransaction> findByUserIdAndType(Long userId, String type);

    /**
     * Check if points were already awarded for an order
     */
    boolean existsByOrderId(Long orderId);

    /**
     * Get total points earned by user
     */
    @Query("SELECT COALESCE(SUM(lt.points), 0) FROM LoyaltyTransaction lt WHERE lt.userId = :userId AND lt.type = 'EARNED'")
    Integer getTotalPointsEarnedByUser(@Param("userId") Long userId);

    /**
     * Get total points redeemed by user
     */
    @Query("SELECT COALESCE(SUM(ABS(lt.points)), 0) FROM LoyaltyTransaction lt WHERE lt.userId = :userId AND lt.type = 'REDEEMED'")
    Integer getTotalPointsRedeemedByUser(@Param("userId") Long userId);
}
