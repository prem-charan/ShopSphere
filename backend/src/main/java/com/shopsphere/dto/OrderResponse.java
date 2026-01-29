package com.shopsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long orderId;
    private Long customerId;
    private String orderType;
    private String status;
    private BigDecimal totalAmount;
    private String discountCode;
    private BigDecimal discountAmount;
    private String shippingAddress;
    private String storeLocation;
    private String trackingNumber;
    private String paymentMethod;
    private String paymentStatus;
    private Long campaignId;
    private String campaignTitle;
    private BigDecimal campaignSavings;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemDTO> orderItems;
}
