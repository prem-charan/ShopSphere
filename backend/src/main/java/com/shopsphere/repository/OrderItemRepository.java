package com.shopsphere.repository;

import com.shopsphere.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Find order items by order ID
    List<OrderItem> findByOrder_OrderId(Long orderId);

    // Find order items by product ID
    List<OrderItem> findByProductId(Long productId);

    // Find order items by store location
    List<OrderItem> findByStoreLocation(String storeLocation);

    // Get total quantity sold for a product
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.productId = :productId")
    Long getTotalQuantitySoldByProduct(@Param("productId") Long productId);
}
