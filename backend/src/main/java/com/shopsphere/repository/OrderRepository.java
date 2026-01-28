package com.shopsphere.repository;

import com.shopsphere.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Find orders by customer ID
    List<Order> findByCustomerId(Long customerId);

    // Find orders by status
    List<Order> findByStatus(String status);

    // Find orders by order type
    List<Order> findByOrderType(String orderType);

    // Find orders by customer and status
    List<Order> findByCustomerIdAndStatus(Long customerId, String status);

    // Find orders by store location (for in-store orders)
    List<Order> findByStoreLocation(String storeLocation);

    // Find orders by date range
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                @Param("endDate") LocalDateTime endDate);

    // Find recent orders (last N days)
    @Query("SELECT o FROM Order o WHERE o.createdAt >= :date ORDER BY o.createdAt DESC")
    List<Order> findRecentOrders(@Param("date") LocalDateTime date);

    // Count orders by status
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") String status);

    // Find orders with specific payment status
    List<Order> findByPaymentStatus(String paymentStatus);

    // Get all orders ordered by creation date descending
    List<Order> findAllByOrderByCreatedAtDesc();

    // Check if a discount code has been used in any order
    boolean existsByDiscountCode(String discountCode);

    // Campaign reporting
    List<Order> findByCampaignId(Long campaignId);
}
