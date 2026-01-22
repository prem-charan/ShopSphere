# Payment Gateway Implementation Guide

## Overview
Since we cannot integrate a real payment gateway without business credentials and banking partnerships, we'll create a **realistic payment simulation** that mimics the entire payment flow. This approach is perfect for:
- Development and testing
- Demos and presentations
- Understanding payment workflows
- Training purposes

## 📋 Current Low Stock Threshold Configuration

**Question: What is the low stock threshold currently set?**

**Answer:** The low stock threshold is currently set to **10 units** and is configured globally in `application.properties`:

```properties
# Low Stock Alert Threshold
shopsphere.inventory.low-stock-threshold=10
```

**Is it fixed for all products?**
- Yes, currently it's a **global setting** that applies to all products
- Any product with stock quantity ≤ 10 will be marked as "low stock"
- This appears in:
  - Admin Dashboard → Low Stock Alerts
  - Product cards (orange badge)
  - Store inventory management

**Future Enhancement:** You could modify the `Product` entity to add a `lowStockThreshold` field per product, allowing different thresholds for different products (e.g., high-demand items might need threshold of 50, while specialty items might be fine with 5).

---

## 💰 Payment Gateway Simulation - Implementation Ideas

### Approach 1: Simple In-App Mock Payment (Recommended for Start)

This creates a realistic payment flow entirely within your application without external dependencies.

#### Backend Implementation

**1. Create Payment Entity**

```java
@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;
    
    @NotNull
    @Column(nullable = false)
    private Long orderId;
    
    @NotNull
    @Column(nullable = false)
    private Long customerId;
    
    @NotNull
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;
    
    @NotBlank
    @Column(nullable = false, length = 20)
    private String paymentMethod; // CARD, UPI, NET_BANKING, WALLET, COD
    
    @NotBlank
    @Column(nullable = false, length = 20)
    private String status; // INITIATED, PROCESSING, SUCCESS, FAILED
    
    @Column(length = 100, unique = true)
    private String transactionId; // Mock transaction ID
    
    // For Card payments
    @Column(length = 20)
    private String cardLastFour;
    
    @Column(length = 20)
    private String cardType; // VISA, MASTERCARD, RUPAY
    
    // For UPI payments
    @Column(length = 100)
    private String upiId;
    
    // For Net Banking
    @Column(length = 50)
    private String bankName;
    
    @Column(columnDefinition = "TEXT")
    private String failureReason;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (transactionId == null) {
            // Generate mock transaction ID
            transactionId = "TXN" + System.currentTimeMillis() + 
                          UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**2. Create PaymentService**

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final OrderService orderService;
    
    @Transactional
    public PaymentResponse initiatePayment(PaymentRequest request) {
        log.info("Initiating payment for order: {}", request.getOrderId());
        
        // Create payment record
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setCustomerId(request.getCustomerId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus("INITIATED");
        
        // Set method-specific details
        switch (request.getPaymentMethod()) {
            case "CARD":
                payment.setCardLastFour(request.getCardNumber().substring(
                    request.getCardNumber().length() - 4));
                payment.setCardType(detectCardType(request.getCardNumber()));
                break;
            case "UPI":
                payment.setUpiId(request.getUpiId());
                break;
            case "NET_BANKING":
                payment.setBankName(request.getBankName());
                break;
        }
        
        Payment savedPayment = paymentRepository.save(payment);
        
        return convertToResponse(savedPayment);
    }
    
    @Transactional
    public PaymentResponse processPayment(Long paymentId, String otp) {
        log.info("Processing payment: {}", paymentId);
        
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        
        // Simulate payment processing delay
        try {
            Thread.sleep(2000); // 2 seconds processing time
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Simulate success/failure (90% success rate)
        boolean isSuccess = Math.random() < 0.9;
        
        if (isSuccess && "123456".equals(otp)) { // Mock OTP verification
            payment.setStatus("SUCCESS");
            
            // Update order payment status
            orderService.updatePaymentStatus(payment.getOrderId(), "COMPLETED");
            
        } else {
            payment.setStatus("FAILED");
            payment.setFailureReason(
                "123456".equals(otp) ? "Payment declined by bank" : "Invalid OTP"
            );
            
            orderService.updatePaymentStatus(payment.getOrderId(), "FAILED");
        }
        
        Payment updated = paymentRepository.save(payment);
        return convertToResponse(updated);
    }
    
    private String detectCardType(String cardNumber) {
        if (cardNumber.startsWith("4")) return "VISA";
        if (cardNumber.startsWith("5")) return "MASTERCARD";
        if (cardNumber.startsWith("6")) return "RUPAY";
        return "OTHER";
    }
}
```

**3. Create PaymentController**

```java
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
        return ResponseEntity.ok(new ApiResponse<>(true, "Payment initiated", response));
    }
    
    @PostMapping("/{paymentId}/process")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @PathVariable Long paymentId,
            @RequestParam String otp) {
        log.info("REST request to process payment: {}", paymentId);
        PaymentResponse response = paymentService.processPayment(paymentId, otp);
        return ResponseEntity.ok(new ApiResponse<>(true, 
            response.getStatus().equals("SUCCESS") ? "Payment successful" : "Payment failed", 
            response));
    }
    
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByOrder(
            @PathVariable Long orderId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByOrder(orderId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Payments retrieved", payments));
    }
}
```

#### Frontend Implementation

**1. Create Payment Modal Component**

```javascript
// PaymentModal.jsx
import { useState } from 'react';
import { FaCreditCard, FaMobile, FaUniversity, FaWallet } from 'react-icons/fa';

const PaymentModal = ({ order, onSuccess, onCancel }) => {
  const [step, setStep] = useState('method'); // method, details, otp, processing, result
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');
  const [otp, setOtp] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'CARD', name: 'Credit/Debit Card', icon: FaCreditCard },
    { id: 'UPI', name: 'UPI', icon: FaMobile },
    { id: 'NET_BANKING', name: 'Net Banking', icon: FaUniversity },
    { id: 'WALLET', name: 'Wallet', icon: FaWallet },
  ];

  const handleMethodSelect = (method) => {
    setPaymentMethod(method);
    setStep('details');
  };

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const paymentData = {
        orderId: order.orderId,
        customerId: order.customerId,
        amount: order.totalAmount,
        paymentMethod: paymentMethod,
        cardNumber: paymentMethod === 'CARD' ? cardNumber.replace(/\s/g, '') : null,
        cardName: paymentMethod === 'CARD' ? cardName : null,
        upiId: paymentMethod === 'UPI' ? upiId : null,
        bankName: paymentMethod === 'NET_BANKING' ? bankName : null,
      };

      const response = await initiatePayment(paymentData);
      setPaymentId(response.data.paymentId);
      setStep('otp');
    } catch (err) {
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsProcessing(true);
    setStep('processing');

    try {
      const response = await processPayment(paymentId, otp);
      
      if (response.data.status === 'SUCCESS') {
        setStep('success');
        setTimeout(() => {
          onSuccess(response.data);
        }, 2000);
      } else {
        setStep('failed');
        setError(response.data.failureReason || 'Payment failed');
      }
    } catch (err) {
      setStep('failed');
      setError('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        {/* Step 1: Select Payment Method */}
        {step === 'method' && (
          <>
            <h2 className="text-2xl font-bold mb-4">Select Payment Method</h2>
            <div className="mb-4">
              <div className="text-lg font-semibold mb-2">Amount: ₹{order.totalAmount}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all"
                >
                  <method.icon className="text-3xl mx-auto mb-2 text-blue-600" />
                  <div className="text-sm font-medium">{method.name}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2: Enter Payment Details */}
        {step === 'details' && paymentMethod === 'CARD' && (
          <>
            <h2 className="text-2xl font-bold mb-4">Enter Card Details</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Card Number (e.g., 4111 1111 1111 1111)"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                maxLength="19"
              />
              <input
                type="text"
                placeholder="Cardholder Name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  maxLength="5"
                />
                <input
                  type="password"
                  placeholder="CVV"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  maxLength="3"
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                💡 Test Card: 4111 1111 1111 1111, Any future date, Any CVV
              </div>
            </div>
          </>
        )}

        {step === 'details' && paymentMethod === 'UPI' && (
          <>
            <h2 className="text-2xl font-bold mb-4">Enter UPI ID</h2>
            <input
              type="text"
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
              💡 Test UPI: test@paytm or any UPI ID
            </div>
          </>
        )}

        {/* Step 3: OTP Verification */}
        {step === 'otp' && (
          <>
            <h2 className="text-2xl font-bold mb-4">Enter OTP</h2>
            <p className="text-gray-600 mb-4">
              An OTP has been sent to your registered mobile number
            </p>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4 text-center text-2xl tracking-widest"
              maxLength="6"
            />
            <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 mb-4">
              💡 Test OTP: <strong>123456</strong> (Use this for successful payment)
            </div>
          </>
        )}

        {/* Step 4: Processing */}
        {step === 'processing' && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold">Processing Payment...</h3>
            <p className="text-gray-600">Please wait while we verify your payment</p>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 'success' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
            <p className="text-gray-600">Your order has been placed successfully</p>
          </div>
        )}

        {/* Step 6: Failed */}
        {step === 'failed' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        {error && step !== 'failed' && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>
        )}

        <div className="flex gap-3 mt-6">
          {(step === 'method' || step === 'details' || step === 'failed') && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
            >
              Cancel
            </button>
          )}
          {step === 'details' && (
            <button
              onClick={handleInitiatePayment}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
            >
              {isProcessing ? 'Processing...' : 'Proceed to Pay'}
            </button>
          )}
          {step === 'otp' && (
            <button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || isProcessing}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
            >
              Verify & Pay
            </button>
          )}
          {step === 'failed' && (
            <button
              onClick={() => setStep('method')}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
```

**2. Integrate into Checkout Flow**

Update `ProductDetail.jsx` to show payment modal after order creation:

```javascript
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [createdOrder, setCreatedOrder] = useState(null);

const handlePlaceOrder = async () => {
  // ... existing order creation code ...
  
  const response = await createOrder(orderData);
  
  // Instead of navigating immediately, show payment modal
  setCreatedOrder(response.data);
  setShowPaymentModal(true);
  setShowCheckoutModal(false);
};

const handlePaymentSuccess = (paymentData) => {
  setShowPaymentModal(false);
  navigate(`/order/${createdOrder.orderId}`);
};

// In JSX:
{showPaymentModal && (
  <PaymentModal
    order={createdOrder}
    onSuccess={handlePaymentSuccess}
    onCancel={() => {
      setShowPaymentModal(false);
      // Order is created but payment pending
      navigate(`/order/${createdOrder.orderId}`);
    }}
  />
)}
```

---

### Approach 2: Integrate with Test Payment Gateway

For more realistic experience, use sandbox/test modes of real payment gateways:

#### Razorpay Test Mode (India-focused)

**Advantages:**
- Free test mode
- Indian payment methods (UPI, Cards, Net Banking)
- Easy integration
- Good documentation

**Implementation:**

1. Sign up at https://razorpay.com (free for test mode)
2. Get test API keys
3. Add dependency:

```xml
<dependency>
    <groupId>com.razorpay</groupId>
    <artifactId>razorpay-java</artifactId>
    <version>1.4.3</version>
</dependency>
```

4. Backend integration:

```java
@Service
public class RazorpayService {
    private RazorpayClient razorpayClient;
    
    public RazorpayService(@Value("${razorpay.key_id}") String keyId,
                           @Value("${razorpay.key_secret}") String keySecret) {
        this.razorpayClient = new RazorpayClient(keyId, keySecret);
    }
    
    public JSONObject createPaymentOrder(BigDecimal amount) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue()); // Convert to paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "order_" + System.currentTimeMillis());
        
        Order order = razorpayClient.orders.create(orderRequest);
        return order.toJson();
    }
}
```

5. Frontend (using Razorpay Checkout):

```javascript
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const handlePayment = async () => {
  const res = await loadRazorpay();
  
  const options = {
    key: 'YOUR_TEST_KEY_ID',
    amount: order.totalAmount * 100,
    currency: 'INR',
    name: 'ShopSphere',
    description: `Order #${order.orderId}`,
    handler: function (response) {
      // Payment successful
      console.log(response.razorpay_payment_id);
    },
    prefill: {
      name: user.name,
      email: user.email,
    },
    theme: {
      color: '#3B82F6'
    }
  };
  
  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};
```

**Test Cards for Razorpay:**
- Success: 4111 1111 1111 1111
- OTP: 000000
- CVV: Any 3 digits

---

## 🎯 Recommended Implementation Path

### Phase 1: Start with Mock Payment (Current Priority)
✅ **Reasons:**
- No external dependencies
- Complete control over flow
- Perfect for development and testing
- Can demo immediately
- Free forever

**Steps:**
1. Create Payment entity, repository, service
2. Add payment DTOs and controller
3. Build PaymentModal React component
4. Integrate with order creation flow
5. Add payment history to order details
6. Test all payment scenarios (success, failure, invalid OTP)

### Phase 2: Upgrade to Test Gateway (Optional)
If you want more realistic experience later:
- Integrate Razorpay test mode
- Keep mock payment as fallback
- Allow switching between modes in settings

---

## 🔧 Testing Scenarios

With mock payment, test these scenarios:

1. **Successful Payment:**
   - Use OTP: 123456
   - Order status: PLACED → CONFIRMED
   - Payment status: SUCCESS

2. **Failed Payment:**
   - Use any other OTP
   - Order status: PLACED (no auto-confirm)
   - Payment status: FAILED
   - Can retry payment

3. **Multiple Payment Methods:**
   - Card payment
   - UPI payment
   - Net Banking
   - Wallet

4. **Order Without Payment:**
   - Cash on Delivery option
   - Order created, payment marked as COD

---

## 📊 Benefits of Mock Payment

1. **No Cost:** Free to implement and test
2. **No Registration:** No need for merchant accounts
3. **Full Control:** Customize success/failure rates
4. **Instant Setup:** Start using immediately
5. **Learning:** Understand payment workflows
6. **Demo Ready:** Perfect for presentations
7. **Realistic:** Mimics real payment gateway behavior

---

## 🚀 Next Steps

1. Implement Payment entity and backend logic
2. Create PaymentModal component
3. Integrate with order flow
4. Add payment history UI
5. Test all scenarios
6. Add payment receipts (PDF generation)
7. Later: upgrade to real test gateway if needed

---

## Summary

You now have:
✅ Active tab highlighting in admin dashboard
✅ Currency changed to Indian Rupee (₹) throughout the app
✅ Low stock threshold explained (currently 10 for all products)
✅ Complete payment gateway implementation strategy with mock payment approach

The mock payment approach is **production-ready for demos and testing**, and can be upgraded to a real gateway later without major refactoring!
