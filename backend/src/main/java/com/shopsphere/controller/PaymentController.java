package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.PaymentRequest;
import com.shopsphere.dto.PaymentResponse;
import com.shopsphere.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> initiatePayment(
            @Valid @RequestBody PaymentRequest request) {
        log.info("REST request to initiate payment for order: {}", request.getOrderId());
        PaymentResponse response = paymentService.initiatePayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Payment initiated successfully", response));
    }

    @PostMapping("/{paymentId}/process")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @PathVariable Long paymentId,
            @RequestParam String otp) {
        log.info("REST request to process payment: {}", paymentId);
        PaymentResponse response = paymentService.processPayment(paymentId, otp);
        
        String message = response.getStatus().equals("SUCCESS") 
                ? "Payment completed successfully" 
                : "Payment failed - " + response.getFailureReason();
        
        return ResponseEntity.ok(new ApiResponse<>(true, message, response));
    }

    @GetMapping("/{paymentId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long paymentId) {
        log.info("REST request to get payment: {}", paymentId);
        PaymentResponse response = paymentService.getPaymentById(paymentId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Payment retrieved successfully", response));
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByOrder(
            @PathVariable Long orderId) {
        log.info("REST request to get payments for order: {}", orderId);
        List<PaymentResponse> payments = paymentService.getPaymentsByOrder(orderId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Payments retrieved successfully", payments));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByCustomer(
            @PathVariable Long customerId) {
        log.info("REST request to get payments for customer: {}", customerId);
        List<PaymentResponse> payments = paymentService.getPaymentsByCustomer(customerId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Payments retrieved successfully", payments));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        log.info("REST request to get all payments");
        List<PaymentResponse> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(new ApiResponse<>(true, "Payments retrieved successfully", payments));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByStatus(
            @PathVariable String status) {
        log.info("REST request to get payments with status: {}", status);
        List<PaymentResponse> payments = paymentService.getPaymentsByStatus(status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Payments retrieved successfully", payments));
    }
}
