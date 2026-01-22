package com.shopsphere.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreInventoryDTO {

    private Long inventoryId;

    @NotNull(message = "Product ID is required")
    private Long productId;

    private String productName;

    @NotBlank(message = "Store location is required")
    private String storeLocation;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    private Boolean isAvailable;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
