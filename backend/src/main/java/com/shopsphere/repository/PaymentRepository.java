package com.shopsphere.repository;

import com.shopsphere.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Find payments by order ID
    List<Payment> findByOrderId(Long orderId);

    // Find payments by customer ID
    List<Payment> findByCustomerId(Long customerId);

    // Find payment by transaction ID
    Optional<Payment> findByTransactionId(String transactionId);

    // Find payments by status
    List<Payment> findByStatus(String status);

    // Find payments by payment method
    List<Payment> findByPaymentMethod(String paymentMethod);

    // Find successful payments by order
    @Query("SELECT p FROM Payment p WHERE p.orderId = :orderId AND p.status = 'SUCCESS'")
    List<Payment> findSuccessfulPaymentsByOrder(@Param("orderId") Long orderId);

    // Find payments by date range
    @Query("SELECT p FROM Payment p WHERE p.createdAt BETWEEN :startDate AND :endDate")
    List<Payment> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                   @Param("endDate") LocalDateTime endDate);

    // Get total successful payments amount
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'SUCCESS'")
    BigDecimal getTotalSuccessfulPaymentsAmount();

    // Count payments by status
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = :status")
    Long countByStatus(@Param("status") String status);
}
