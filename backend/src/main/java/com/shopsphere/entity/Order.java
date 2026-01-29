package com.shopsphere.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @NotNull(message = "Customer ID is required")
    @Column(nullable = false)
    private Long customerId;

    @NotNull(message = "Order type is required")
    @Column(nullable = false, length = 20)
    private String orderType; // ONLINE or IN_STORE

    @NotNull(message = "Order status is required")
    @Column(nullable = false, length = 20)
    private String status; // CONFIRMED, SHIPPED, DELIVERED, CANCELLED

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(length = 50)
    private String discountCode; // Loyalty reward code applied

    @Column(precision = 10, scale = 2)
    private BigDecimal discountAmount; // Discount amount in rupees

    @Column(length = 500)
    private String shippingAddress;

    @Column(length = 100)
    private String storeLocation; // For in-store orders

    @Column(length = 100)
    private String trackingNumber;

    @Column(length = 20)
    private String paymentMethod; // COD, ONLINE, etc.

    @Column(length = 20)
    private String paymentStatus; // PENDING, COMPLETED, FAILED

    // Optional: if the order was placed under a marketing campaign
    @Column(name = "campaign_id")
    private Long campaignId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "CONFIRMED";
        }
        if (paymentStatus == null) {
            paymentStatus = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public void addOrderItem(OrderItem item) {
        orderItems.add(item);
        item.setOrder(this);
    }

    public void removeOrderItem(OrderItem item) {
        orderItems.remove(item);
        item.setOrder(null);
    }

    public boolean isOnlineOrder() {
        return "ONLINE".equalsIgnoreCase(orderType);
    }

    public boolean isInStoreOrder() {
        return "IN_STORE".equalsIgnoreCase(orderType);
    }

    public boolean canBeCancelled() {
        return "PLACED".equalsIgnoreCase(status) || "CONFIRMED".equalsIgnoreCase(status);
    }
}
