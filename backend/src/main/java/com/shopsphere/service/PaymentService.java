package com.shopsphere.service;

import com.shopsphere.dto.PaymentRequest;
import com.shopsphere.dto.PaymentResponse;
import com.shopsphere.entity.Payment;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderService orderService;

    @Transactional
    public PaymentResponse initiatePayment(PaymentRequest request) {
        log.info("Initiating payment for order: {}", request.getOrderId());

        // Validate order exists
        orderService.getOrderById(request.getOrderId());

        // Validate payment method
        String method = request.getPaymentMethod().toUpperCase();
        if (!method.equals("UPI") && !method.equals("COD")) {
            throw new IllegalArgumentException("Only UPI and COD payment methods are supported");
        }

        // Create payment record
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setCustomerId(request.getCustomerId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(method);
        payment.setNotes(request.getNotes());

        // Persist payment method on order for later COD settlement
        orderService.updatePaymentMethod(request.getOrderId(), method);

        // Set method-specific details
        if (method.equals("UPI")) {
            payment.setStatus("INITIATED");
            payment.setUpiId(request.getUpiId());
        } else if (method.equals("COD")) {
            // COD is NOT successful at order time; it becomes successful only after delivery.
            // Keep payment pending with no transaction id until delivered.
            payment.setStatus("INITIATED");
            payment.setNotes("Cash on Delivery - Payment will be collected at delivery");
        }

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment initiated successfully with ID: {}", savedPayment.getPaymentId());

        return convertToResponse(savedPayment);
    }

    @Transactional
    public PaymentResponse processPayment(Long paymentId, String otp) {
        log.info("Processing UPI payment: {} with OTP verification", paymentId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        if (!"INITIATED".equals(payment.getStatus())) {
            throw new IllegalStateException("Payment is not in INITIATED status");
        }

        if (!"UPI".equals(payment.getPaymentMethod())) {
            throw new IllegalStateException("Only UPI payments require OTP processing");
        }

        // Update status to PROCESSING
        payment.setStatus("PROCESSING");
        paymentRepository.save(payment);

        // Simulate UPI payment processing delay (1-2 seconds)
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Payment processing interrupted", e);
        }

        // Mock OTP verification - accept "123456" as valid OTP
        boolean isValidOtp = "123456".equals(otp);
        
        if (isValidOtp) {
            payment.setStatus("SUCCESS");
            payment.setNotes("UPI payment successful via " + payment.getUpiId());

            if (payment.getTransactionId() == null || payment.getTransactionId().isBlank()) {
                payment.setTransactionId(generateTransactionId());
            }

            // Update order payment status
            orderService.updatePaymentStatus(payment.getOrderId(), "COMPLETED");
            
            log.info("UPI payment successful for payment ID: {}", paymentId);
        } else {
            payment.setStatus("FAILED");
            payment.setFailureReason("Invalid OTP. Payment failed.");
            
            // Update order payment status
            orderService.updatePaymentStatus(payment.getOrderId(), "FAILED");
            
            log.warn("UPI payment failed for payment ID: {} - Invalid OTP", paymentId);
        }

        Payment updatedPayment = paymentRepository.save(payment);
        return convertToResponse(updatedPayment);
    }

    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis() + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId) {
        log.info("Fetching payment: {}", paymentId);
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));
        return convertToResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByOrder(Long orderId) {
        log.info("Fetching payments for order: {}", orderId);
        return paymentRepository.findByOrderId(orderId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByCustomer(Long customerId) {
        log.info("Fetching payments for customer: {}", customerId);
        return paymentRepository.findByCustomerId(customerId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        log.info("Fetching all payments");
        return paymentRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByStatus(String status) {
        log.info("Fetching payments with status: {}", status);
        return paymentRepository.findByStatus(status).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private PaymentResponse convertToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(payment.getPaymentId());
        response.setOrderId(payment.getOrderId());
        response.setCustomerId(payment.getCustomerId());
        response.setAmount(payment.getAmount());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setStatus(payment.getStatus());
        response.setTransactionId(payment.getTransactionId());
        response.setUpiId(payment.getUpiId());
        response.setFailureReason(payment.getFailureReason());
        response.setNotes(payment.getNotes());
        response.setCreatedAt(payment.getCreatedAt());
        response.setUpdatedAt(payment.getUpdatedAt());
        return response;
    }
}
