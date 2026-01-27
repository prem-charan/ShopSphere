package com.shopsphere.service;

import com.shopsphere.dto.CreateOrderRequest;
import com.shopsphere.dto.OrderItemDTO;
import com.shopsphere.dto.OrderResponse;
import com.shopsphere.dto.UpdateOrderStatusRequest;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderItem;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.StoreProductInventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StoreProductInventoryRepository storeInventoryRepository;
    private final StoreInventoryService storeInventoryService;
    private final LoyaltyService loyaltyService;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        log.info("Creating new order for customer: {}", request.getCustomerId());

        // Validate order type
        if (!request.getOrderType().equalsIgnoreCase("ONLINE") && 
            !request.getOrderType().equalsIgnoreCase("IN_STORE")) {
            throw new IllegalArgumentException("Order type must be either ONLINE or IN_STORE");
        }

        // Validate required fields based on order type
        if (request.getOrderType().equalsIgnoreCase("ONLINE") && 
            (request.getShippingAddress() == null || request.getShippingAddress().isBlank())) {
            throw new IllegalArgumentException("Shipping address is required for online orders");
        }

        if (request.getOrderType().equalsIgnoreCase("IN_STORE") && 
            (request.getStoreLocation() == null || request.getStoreLocation().isBlank())) {
            throw new IllegalArgumentException("Store location is required for in-store orders");
        }

        // Create order entity
        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setOrderType(request.getOrderType().toUpperCase());
        order.setShippingAddress(request.getShippingAddress());
        order.setStoreLocation(request.getStoreLocation());
        order.setNotes(request.getNotes());
        order.setStatus("CONFIRMED");
        order.setPaymentStatus("PENDING");

        log.info("=== DISCOUNT INFO RECEIVED ===");
        log.info("Discount Code: {}", request.getDiscountCode());
        log.info("Discount Amount: {}", request.getDiscountAmount());

        BigDecimal totalAmount = BigDecimal.ZERO;

        // Process order items
        for (OrderItemDTO itemDTO : request.getOrderItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemDTO.getProductId()));

            // Check stock availability
            if (request.getOrderType().equalsIgnoreCase("IN_STORE")) {
                // Check store-specific inventory
                boolean hasStock = storeInventoryRepository.isProductAvailableAtStore(
                        product.getProductId(), request.getStoreLocation());
                if (!hasStock) {
                    throw new IllegalArgumentException("Product " + product.getName() + 
                            " is not available at store " + request.getStoreLocation());
                }
            } else {
                // Check general product stock
                if (product.getStockQuantity() < itemDTO.getQuantity()) {
                    throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
                }
            }

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(product.getProductId());
            orderItem.setProductName(product.getName());
            orderItem.setProductSku(product.getSku());
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setStoreLocation(request.getOrderType().equalsIgnoreCase("IN_STORE") ? 
                    request.getStoreLocation() : null);
            
            orderItem.calculateSubtotal();
            totalAmount = totalAmount.add(orderItem.getSubtotal());

            order.addOrderItem(orderItem);

            // Update stock quantities - always reduce from store inventory
            if (request.getOrderType().equalsIgnoreCase("IN_STORE")) {
                // Decrease store-specific inventory for in-store orders
                log.info("Processing IN_STORE order - reducing stock from store: {}", request.getStoreLocation());
                storeInventoryService.decreaseStock(product.getProductId(), request.getStoreLocation(), itemDTO.getQuantity());
            } else {
                // For ONLINE orders, find first store with sufficient stock and reduce from there
                log.info("Processing ONLINE order - finding store with sufficient stock for product {}", product.getProductId());
                List<com.shopsphere.entity.StoreProductInventory> storeInventories = 
                        storeInventoryRepository.findByProductId(product.getProductId());
                
                boolean stockReduced = false;
                for (com.shopsphere.entity.StoreProductInventory inventory : storeInventories) {
                    if (inventory.hasStock(itemDTO.getQuantity())) {
                        log.info("Reducing {} units from store: {}", itemDTO.getQuantity(), inventory.getStoreLocation());
                        storeInventoryService.decreaseStock(product.getProductId(), inventory.getStoreLocation(), itemDTO.getQuantity());
                        stockReduced = true;
                        break;
                    }
                }
                
                if (!stockReduced) {
                    log.warn("No single store has sufficient stock - attempting to fulfill from multiple stores");
                    // Try to fulfill from multiple stores if no single store has enough
                    int remainingQuantity = itemDTO.getQuantity();
                    for (com.shopsphere.entity.StoreProductInventory inventory : storeInventories) {
                        if (remainingQuantity <= 0) break;
                        
                        int availableAtStore = inventory.getStockQuantity();
                        if (availableAtStore > 0) {
                            int toReduce = Math.min(availableAtStore, remainingQuantity);
                            log.info("Reducing {} units from store: {}", toReduce, inventory.getStoreLocation());
                            storeInventoryService.decreaseStock(product.getProductId(), inventory.getStoreLocation(), toReduce);
                            remainingQuantity -= toReduce;
                        }
                    }
                    
                    if (remainingQuantity > 0) {
                        throw new IllegalArgumentException("Insufficient stock across all stores for product: " + product.getName());
                    }
                }
            }
            
            // Note: Product total stock is automatically synced by StoreInventoryService.decreaseStock()
        }

        // Apply discount if provided
        if (request.getDiscountCode() != null && request.getDiscountAmount() != null && request.getDiscountAmount() > 0) {
            log.info("=== APPLYING DISCOUNT ===");
            log.info("Subtotal before discount: {}", totalAmount);
            log.info("Discount code: {}", request.getDiscountCode());
            log.info("Discount amount from request: {}", request.getDiscountAmount());
            
            order.setDiscountCode(request.getDiscountCode());
            order.setDiscountAmount(BigDecimal.valueOf(request.getDiscountAmount()));
            
            // Subtract discount from total
            BigDecimal discountAmount = BigDecimal.valueOf(request.getDiscountAmount());
            totalAmount = totalAmount.subtract(discountAmount);
            
            log.info("Total after discount: {}", totalAmount);
            
            // Ensure total doesn't go negative
            if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
                totalAmount = BigDecimal.ZERO;
            }
            
            log.info("Final total (after negative check): {}", totalAmount);
        } else {
            log.info("No discount applied - discountCode: {}, discountAmount: {}", 
                request.getDiscountCode(), request.getDiscountAmount());
        }

        order.setTotalAmount(totalAmount);

        // Save order
        Order savedOrder = orderRepository.save(order);
        log.info("=== ORDER SAVED ===");
        log.info("Order ID: {}", savedOrder.getOrderId());
        log.info("Order totalAmount: {}", savedOrder.getTotalAmount());
        log.info("Order discountCode: {}", savedOrder.getDiscountCode());
        log.info("Order discountAmount: {}", savedOrder.getDiscountAmount());

        // Award loyalty points immediately on order confirmation
        try {
            loyaltyService.earnPointsFromOrder(savedOrder.getCustomerId(), savedOrder.getOrderId(), savedOrder.getTotalAmount());
            log.info("Loyalty points awarded for order: {}", savedOrder.getOrderId());
        } catch (Exception e) {
            log.error("Failed to award loyalty points for order {}: {}", savedOrder.getOrderId(), e.getMessage());
            // Don't fail the order creation if loyalty points fail
        }

        return convertToOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        log.info("Fetching order: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return convertToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        log.info("Fetching all orders");
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByCustomer(Long customerId) {
        log.info("Fetching orders for customer: {}", customerId);
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(String status) {
        log.info("Fetching orders with status: {}", status);
        return orderRepository.findByStatus(status).stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getRecentOrders(int days) {
        log.info("Fetching orders from last {} days", days);
        LocalDateTime date = LocalDateTime.now().minusDays(days);
        return orderRepository.findRecentOrders(date).stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        log.info("Updating order {} status to {}", orderId, request.getStatus());
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        String newStatus = request.getStatus().toUpperCase();
        
        // Validate status transition
        if (!isValidStatusTransition(order.getStatus(), newStatus)) {
            throw new IllegalArgumentException("Invalid status transition from " + order.getStatus() + " to " + newStatus);
        }

        order.setStatus(newStatus);

        // Generate or update tracking number when status is SHIPPED
        if (newStatus.equals("SHIPPED")) {
            if (request.getTrackingNumber() != null && !request.getTrackingNumber().isBlank()) {
                // Use provided tracking number
                order.setTrackingNumber(request.getTrackingNumber());
                log.info("Using provided tracking number: {}", request.getTrackingNumber());
            } else if (order.getTrackingNumber() == null || order.getTrackingNumber().isBlank()) {
                // Auto-generate tracking number if not already set
                String trackingNumber = generateTrackingNumber(order);
                order.setTrackingNumber(trackingNumber);
                log.info("Auto-generated tracking number: {}", trackingNumber);
            }
        }

        // Update notes if provided
        if (request.getNotes() != null) {
            String existingNotes = order.getNotes() != null ? order.getNotes() + "\n" : "";
            order.setNotes(existingNotes + LocalDateTime.now() + ": " + request.getNotes());
        }

        // If order is cancelled, restore stock
        if (newStatus.equals("CANCELLED")) {
            restoreStock(order);
        }

        Order updatedOrder = orderRepository.save(order);
        log.info("Order status updated successfully");
        
        return convertToOrderResponse(updatedOrder);
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        log.info("Cancelling order: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.canBeCancelled()) {
            throw new IllegalArgumentException("Order cannot be cancelled in current status: " + order.getStatus());
        }

        order.setStatus("CANCELLED");
        restoreStock(order);
        orderRepository.save(order);
        
        log.info("Order cancelled successfully");
    }

    @Transactional
    public OrderResponse updatePaymentStatus(Long orderId, String paymentStatus) {
        log.info("Updating payment status for order {} to {}", orderId, paymentStatus);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setPaymentStatus(paymentStatus.toUpperCase());
        
        // Auto-confirm order when payment is completed
        if (paymentStatus.equalsIgnoreCase("COMPLETED") && order.getStatus().equals("PLACED")) {
            order.setStatus("CONFIRMED");
        }

        Order updatedOrder = orderRepository.save(order);
        return convertToOrderResponse(updatedOrder);
    }

    private void restoreStock(Order order) {
        log.info("Restoring stock for cancelled order: {}", order.getOrderId());
        for (OrderItem item : order.getOrderItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElse(null);
            
            if (product != null) {
                // Restore general product stock
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);

                // Restore store-specific inventory if applicable
                if (item.getStoreLocation() != null) {
                    storeInventoryRepository.findByProductIdAndStoreLocation(
                            item.getProductId(), item.getStoreLocation())
                            .ifPresent(inventory -> {
                                inventory.increaseStock(item.getQuantity());
                                storeInventoryRepository.save(inventory);
                            });
                }
            }
        }
    }

    /**
     * Generate a unique tracking number for an order
     * Format: TRACK-{ORDER_TYPE}-{ORDER_ID}-{TIMESTAMP}
     * Example: TRACK-ONLINE-123-1234567890
     */
    private String generateTrackingNumber(Order order) {
        String orderType = order.getOrderType().substring(0, Math.min(3, order.getOrderType().length())).toUpperCase();
        long timestamp = System.currentTimeMillis() / 1000; // Unix timestamp in seconds
        return String.format("TRACK-%s-%d-%d", orderType, order.getOrderId(), timestamp);
    }

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        // Define valid status transitions
        // Flow: CONFIRMED → SHIPPED → DELIVERED or CANCELLED
        return switch (currentStatus) {
            case "CONFIRMED" -> List.of("SHIPPED", "CANCELLED").contains(newStatus);
            case "SHIPPED" -> List.of("DELIVERED", "CANCELLED").contains(newStatus);
            case "DELIVERED", "CANCELLED" -> false; // Terminal states
            default -> false;
        };
    }

    private OrderResponse convertToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId());
        response.setCustomerId(order.getCustomerId());
        response.setOrderType(order.getOrderType());
        response.setStatus(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setDiscountCode(order.getDiscountCode());
        response.setDiscountAmount(order.getDiscountAmount());
        response.setShippingAddress(order.getShippingAddress());
        response.setStoreLocation(order.getStoreLocation());
        response.setTrackingNumber(order.getTrackingNumber());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setNotes(order.getNotes());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        List<OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(this::convertToOrderItemDTO)
                .collect(Collectors.toList());
        response.setOrderItems(itemDTOs);

        log.info("=== ORDER RESPONSE CREATED ===");
        log.info("Response totalAmount: {}", response.getTotalAmount());
        log.info("Response discountCode: {}", response.getDiscountCode());
        log.info("Response discountAmount: {}", response.getDiscountAmount());

        return response;
    }

    private OrderItemDTO convertToOrderItemDTO(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setOrderItemId(item.getOrderItemId());
        dto.setProductId(item.getProductId());
        dto.setProductName(item.getProductName());
        dto.setProductSku(item.getProductSku());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setSubtotal(item.getSubtotal());
        dto.setStoreLocation(item.getStoreLocation());
        return dto;
    }
}
