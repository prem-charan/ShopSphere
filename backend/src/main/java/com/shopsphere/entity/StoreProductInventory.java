package com.shopsphere.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "store_product_inventory", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "store_location"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreProductInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inventoryId;

    @NotNull(message = "Product ID is required")
    @Column(nullable = false)
    private Long productId;

    @NotBlank(message = "Store location is required")
    @Column(nullable = false, length = 100)
    private String storeLocation;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    @Column(nullable = false)
    private Integer stockQuantity;

    @Column(nullable = false)
    private Boolean isAvailable = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public boolean isLowStock(int threshold) {
        return stockQuantity != null && stockQuantity <= threshold;
    }

    public boolean hasStock(int requiredQuantity) {
        return stockQuantity != null && stockQuantity >= requiredQuantity && isAvailable;
    }

    public void decreaseStock(int quantity) {
        if (stockQuantity >= quantity) {
            stockQuantity -= quantity;
        } else {
            throw new IllegalArgumentException("Insufficient stock at this store");
        }
    }

    public void increaseStock(int quantity) {
        stockQuantity += quantity;
    }
}
