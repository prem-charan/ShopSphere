package com.shopsphere.repository;

import com.shopsphere.entity.LoyaltyAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoyaltyAccountRepository extends JpaRepository<LoyaltyAccount, Long> {

    /**
     * Find loyalty account by user ID
     */
    Optional<LoyaltyAccount> findByUserId(Long userId);

    /**
     * Check if user has a loyalty account
     */
    boolean existsByUserId(Long userId);

    /**
     * Get total points in circulation across all accounts
     */
    @Query("SELECT SUM(la.pointsBalance) FROM LoyaltyAccount la")
    Long getTotalPointsInCirculation();

    /**
     * Count total loyalty members
     */
    @Query("SELECT COUNT(la) FROM LoyaltyAccount la")
    Long countTotalMembers();
}
