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
        order.setStatus("PLACED");
        order.setPaymentStatus("PENDING");

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

            // Update stock quantities
            if (request.getOrderType().equalsIgnoreCase("IN_STORE")) {
                // Decrease store-specific inventory
                storeInventoryRepository.findByProductIdAndStoreLocation(
                        product.getProductId(), request.getStoreLocation())
                        .ifPresent(inventory -> {
                            inventory.decreaseStock(itemDTO.getQuantity());
                            storeInventoryRepository.save(inventory);
                        });
            }
            
            // Also decrease general product stock
            product.setStockQuantity(product.getStockQuantity() - itemDTO.getQuantity());
            productRepository.save(product);
        }

        order.setTotalAmount(totalAmount);

        // Save order
        Order savedOrder = orderRepository.save(order);
        log.info("Order created successfully with ID: {}", savedOrder.getOrderId());

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

        // Update tracking number if provided and status is SHIPPED
        if (newStatus.equals("SHIPPED") && request.getTrackingNumber() != null) {
            order.setTrackingNumber(request.getTrackingNumber());
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

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        // Define valid status transitions
        return switch (currentStatus) {
            case "PLACED" -> List.of("CONFIRMED", "CANCELLED").contains(newStatus);
            case "CONFIRMED" -> List.of("SHIPPED", "CANCELLED").contains(newStatus);
            case "SHIPPED" -> List.of("DELIVERED").contains(newStatus);
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
