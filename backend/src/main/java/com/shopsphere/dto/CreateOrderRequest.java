package com.shopsphere.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotBlank(message = "Order type is required (ONLINE or IN_STORE)")
    private String orderType; // ONLINE or IN_STORE

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemDTO> orderItems;

    private String shippingAddress; // Required for ONLINE orders

    private String storeLocation; // Required for IN_STORE orders

    private String discountCode; // Optional loyalty reward code

    private Double discountAmount; // Optional discount amount
}
