# Discount Issues - Complete Debugging Guide

**Date:** January 27, 2026  
**Status:** 🔍 Debugging in Progress

---

## 🐛 Issues Reported

1. **Payment modal shows full (undiscounted) price**
2. **Order details page shows full (undiscounted) price**
3. **Wrong discount amount applied** - ₹150 coupon only applies ₹50 discount

---

## ✅ Changes Made for Debugging

### Backend Changes (OrderService.java)

**1. Fixed Order Status (Line 62)**
```java
// BEFORE: order.setStatus("PLACED");
// AFTER: 
order.setStatus("CONFIRMED");
```

**2. Added Comprehensive Logging**

**At Request Receipt:**
```java
log.info("=== DISCOUNT INFO RECEIVED ===");
log.info("Discount Code: {}", request.getDiscountCode());
log.info("Discount Amount: {}", request.getDiscountAmount());
```

**During Discount Application:**
```java
log.info("=== APPLYING DISCOUNT ===");
log.info("Subtotal before discount: {}", totalAmount);
log.info("Discount code: {}", request.getDiscountCode());
log.info("Discount amount from request: {}", request.getDiscountAmount());
log.info("Total after discount: {}", totalAmount);
log.info("Final total (after negative check): {}", totalAmount);
```

**After Order Save:**
```java
log.info("=== ORDER SAVED ===");
log.info("Order ID: {}", savedOrder.getOrderId());
log.info("Order totalAmount: {}", savedOrder.getTotalAmount());
log.info("Order discountCode: {}", savedOrder.getDiscountCode());
log.info("Order discountAmount: {}", savedOrder.getDiscountAmount());
```

**In Response Conversion:**
```java
log.info("=== ORDER RESPONSE CREATED ===");
log.info("Response totalAmount: {}", response.getTotalAmount());
log.info("Response discountCode: {}", response.getDiscountCode());
log.info("Response discountAmount: {}", response.getDiscountAmount());
```

### Frontend Changes

**1. ProductDetail.jsx - Order Creation**

**Before Sending:**
```javascript
console.log('=== SENDING ORDER DATA ===');
console.log('appliedDiscount object:', appliedDiscount);
console.log('orderData.discountCode:', orderData.discountCode);
console.log('orderData.discountAmount:', orderData.discountAmount);
console.log('Full orderData:', orderData);
```

**After Receiving Response:**
```javascript
console.log('=== ORDER CREATED RESPONSE ===');
console.log('Full response.data:', response.data);
console.log('response.data.totalAmount:', response.data.totalAmount);
console.log('response.data.discountCode:', response.data.discountCode);
console.log('response.data.discountAmount:', response.data.discountAmount);
```

**2. PaymentModal.jsx - Modal Load**
```javascript
console.log('=== PAYMENT MODAL RECEIVED ===');
console.log('Full order object:', order);
console.log('order.totalAmount:', order?.totalAmount);
console.log('order.discountCode:', order?.discountCode);
console.log('order.discountAmount:', order?.discountAmount);
console.log('typeof order.totalAmount:', typeof order?.totalAmount);
console.log('typeof order.discountAmount:', typeof order?.discountAmount);
```

**3. OrderDetail.jsx - Fetch Order**
```javascript
console.log('OrderDetail - Fetched order:', orderResponse.data);
console.log('OrderDetail - totalAmount:', orderResponse.data.totalAmount);
console.log('OrderDetail - discountCode:', orderResponse.data.discountCode);
console.log('OrderDetail - discountAmount:', orderResponse.data.discountAmount);
```

---

## 🧪 Step-by-Step Testing Instructions

### **STEP 1: Restart Backend** ⚠️ CRITICAL

```bash
# Stop current backend (Ctrl+C in terminal 2)
cd /home/premcharan/Documents/shopsphere/backend
mvn spring-boot:run
```

**Wait for:** "ShopSphere Backend is running on port 8080"

### **STEP 2: Open Browser Console**

1. Open Chrome/Firefox
2. Press `F12` or `Ctrl+Shift+I`
3. Go to "Console" tab
4. Clear the console (click the 🚫 icon)

### **STEP 3: Redeem a Fresh Reward**

1. Go to http://localhost:5173/loyalty
2. Scroll to "Available Rewards"
3. **For testing ₹150 OFF:** Click "Claim Reward" on the "₹150 Off" reward (1500 points required)
4. Copy the generated code (e.g., `REWARD-1-1769460000000`)

**Backend Logs Should Show:**
```
INFO: Redeemed: ₹150 Off (Code: REWARD-1-...)
INFO: Points deducted: 1500 for user 1
```

### **STEP 4: Apply Discount in Checkout**

1. Go to any product (e.g., http://localhost:5173/product/1)
2. Click "Buy Now"
3. In the checkout modal:
   - Scroll to "Have a Discount Code?"
   - Paste your code
   - Click "Apply"

**Browser Console Should Show:**
```
Validating discount code: REWARD-1-...
Validation response: { valid: true, discountAmount: 150, code: "REWARD-1-...", message: "Discount code is valid" }
Discount applied successfully: 150
```

**Backend Logs Should Show:**
```
INFO: GET /api/loyalty/validate-code/REWARD-1-... - Validating discount code
INFO: Validating discount code: REWARD-1-...
INFO: Extracted userId 1 from code
INFO: Found X REDEEMED transactions for user 1
INFO: Discount code validated successfully: REWARD-1-... - ₹150 off
```

**✅ Expected in UI:**
- Green checkmark appears
- Shows: "REWARD-1-... ₹150 discount applied!"
- **Total updates to:** ₹(Original Price - 150)
  - Example: Laptop ₹65000 → **₹64850**

**❌ If It Shows ₹50 Instead:**
- Check browser console: `Validation response: { ... discountAmount: ?? ... }`
- The `discountAmount` value here is what the backend returned
- If it's 50 instead of 150, the issue is in backend validation

### **STEP 5: Place Order**

1. Fill in shipping address (if online order)
2. Click "Place Order"

**Browser Console Should Show:**
```
=== SENDING ORDER DATA ===
appliedDiscount object: { code: "REWARD-1-...", amount: 150 }
orderData.discountCode: REWARD-1-...
orderData.discountAmount: 150
Full orderData: { customerId: 1, orderType: "ONLINE", ..., discountCode: "REWARD-1-...", discountAmount: 150 }

=== ORDER CREATED RESPONSE ===
Full response.data: { orderId: 15, totalAmount: 64850, discountCode: "REWARD-1-...", discountAmount: 150, ... }
response.data.totalAmount: 64850
response.data.discountCode: REWARD-1-...
response.data.discountAmount: 150
```

**Backend Logs Should Show:**
```
INFO: Creating new order for customer: 1
INFO: === DISCOUNT INFO RECEIVED ===
INFO: Discount Code: REWARD-1-...
INFO: Discount Amount: 150.0
INFO: === APPLYING DISCOUNT ===
INFO: Subtotal before discount: 65000
INFO: Discount code: REWARD-1-...
INFO: Discount amount from request: 150.0
INFO: Total after discount: 64850
INFO: Final total (after negative check): 64850
INFO: === ORDER SAVED ===
INFO: Order ID: 15
INFO: Order totalAmount: 64850.00
INFO: Order discountCode: REWARD-1-...
INFO: Order discountAmount: 150.00
INFO: === ORDER RESPONSE CREATED ===
INFO: Response totalAmount: 64850.00
INFO: Response discountCode: REWARD-1-...
INFO: Response discountAmount: 150.00
INFO: Order created successfully with ID: 15
```

### **STEP 6: Check Payment Modal**

**Browser Console Should Show:**
```
=== PAYMENT MODAL RECEIVED ===
Full order object: { orderId: 15, totalAmount: 64850, discountCode: "REWARD-1-...", discountAmount: 150, ... }
order.totalAmount: 64850
order.discountCode: REWARD-1-...
order.discountAmount: 150
typeof order.totalAmount: number
typeof order.discountAmount: number
```

**✅ Expected in Payment Modal:**
- Header shows: "Amount to Pay: ₹64850.00"
- Green badge shows: "REWARD-1-... Saved ₹150.00"

**❌ If It Shows ₹65000 (Full Price):**
- Check browser console logs from STEP 6
- Verify `order.totalAmount` is 64850, not 65000
- Verify `order.discountAmount` is 150

### **STEP 7: Complete Payment**

1. Select payment method (UPI or COD)
2. Complete payment
3. Navigate to order details page

**Browser Console Should Show:**
```
OrderDetail - Fetched order: { orderId: 15, totalAmount: 64850, discountCode: "REWARD-1-...", discountAmount: 150, ... }
OrderDetail - totalAmount: 64850
OrderDetail - discountCode: REWARD-1-...
OrderDetail - discountAmount: 150
```

**✅ Expected in Order Details:**
```
Order Items
... (product details)

Subtotal: ₹65000.00
Discount: [REWARD-1-...] - ₹150.00
Total: ₹64850.00
You saved ₹150.00!
```

**❌ If It Shows Full Price:**
- Check browser console from STEP 7
- Verify the order was fetched with correct values
- Check if `order.discountCode` and `order.discountAmount` are null or have values

---

## 🔍 Diagnosis Guide

### Problem: "Validation returns ₹50 instead of ₹150"

**Symptom:** Browser console shows:
```
Validation response: { valid: true, discountAmount: 50, ... }
```

**Root Cause:** Backend is parsing the wrong discount amount from the loyalty transaction description.

**Check Backend Logs:**
```
INFO: Parsing discount from description: ...
```

**Solution:** Check the transaction description format:
- Should be: "Redeemed: ₹150 Off (Code: REWARD-1-...)"
- Check database: 
  ```sql
  SELECT description FROM loyalty_transactions 
  WHERE description LIKE '%REWARD-1-1769460000000%';
  ```

---

### Problem: "Order is created with wrong totalAmount"

**Symptom:** Backend logs show:
```
INFO: Discount amount from request: 150.0
INFO: Total after discount: 65000  <-- Should be 64850!
```

**Root Cause:** Discount not being subtracted correctly.

**Check:**
1. Verify request.getDiscountAmount() is not null
2. Verify subtraction logic: `totalAmount.subtract(discountAmount)`
3. Check if condition is being entered: `if (request.getDiscountCode() != null && request.getDiscountAmount() != null && request.getDiscountAmount() > 0)`

---

### Problem: "Frontend receives wrong values"

**Symptom:** Browser console shows:
```
=== ORDER CREATED RESPONSE ===
response.data.discountAmount: 50  <-- Should be 150!
```

**Root Cause:** Order was saved with wrong values.

**Check:**
1. Backend logs for "ORDER SAVED" section
2. Database directly:
   ```sql
   SELECT order_id, total_amount, discount_code, discount_amount 
   FROM orders 
   WHERE order_id = 15;
   ```

---

### Problem: "Payment modal shows full price"

**Symptom:** Payment modal displays ₹65000 instead of ₹64850

**Check Browser Console:**
```
=== PAYMENT MODAL RECEIVED ===
order.totalAmount: 65000  <-- Should be 64850!
```

**Root Cause:** Order response has wrong totalAmount.

**Trace Back:**
1. Check "ORDER CREATED RESPONSE" logs
2. Check "ORDER SAVED" backend logs
3. Check database values

---

### Problem: "Order details page shows full price"

**Symptom:** Order details shows original price without discount

**Check:**
1. Is this an old order created before discount feature?
   ```sql
   SELECT created_at, discount_code FROM orders WHERE order_id = 15;
   ```
   - If `discount_code` is NULL and `created_at` is before Jan 27, 2026 → Old order, expected behavior
2. Is it a new order? Check browser console:
   ```
   OrderDetail - discountAmount: null  <-- Should have a value!
   ```

---

## 💡 Common Issues & Solutions

### Issue 1: "discount_code or discount_amount is NULL in database"

**Cause:** Order was created before the feature was implemented.

**Solution:** Create a new order with discount after restarting the backend.

---

### Issue 2: "Backend logs show 'No discount applied'"

**Symptom:**
```
INFO: No discount applied - discountCode: null, discountAmount: null
```

**Cause:** Frontend is not sending discount data.

**Check:**
1. Browser console: "SENDING ORDER DATA" logs
2. Verify `appliedDiscount` state is not null
3. Verify discount was validated before placing order

---

### Issue 3: "Discount amount is always 50, regardless of coupon"

**Cause:** Backend validation is returning wrong amount.

**Fix:** Check `LoyaltyService.validateDiscountCode()` parsing logic:
```java
if (description.contains("₹50 Off") || description.contains("50 Off")) {
    discountAmount = 50;
} else if (description.contains("₹150 Off") || description.contains("150 Off")) {
    discountAmount = 150;
} else if (description.contains("₹500 Off") || description.contains("500 Off")) {
    discountAmount = 500;
}
```

Check database:
```sql
SELECT description FROM loyalty_transactions 
WHERE type = 'REDEEMED' AND user_id = 1
ORDER BY created_at DESC;
```

---

## 🗄️ Direct Database Queries

### Check Order Data:
```sql
SELECT 
    order_id,
    total_amount,
    discount_code,
    discount_amount,
    status,
    created_at
FROM orders
ORDER BY order_id DESC
LIMIT 5;
```

### Check Loyalty Transactions:
```sql
SELECT 
    transaction_id,
    user_id,
    type,
    points,
    description,
    created_at
FROM loyalty_transactions
WHERE type = 'REDEEMED'
ORDER BY created_at DESC
LIMIT 5;
```

### Check Specific Order:
```sql
SELECT * FROM orders WHERE order_id = 15;
```

---

## 📊 Expected vs Actual Comparison

| Step | Expected Value | Check Location | What to Look For |
|------|----------------|----------------|------------------|
| 1. Validate Discount | `discountAmount: 150` | Browser Console | `Validation response` object |
| 2. Apply in State | `appliedDiscount.amount: 150` | Browser Console | `appliedDiscount object` log |
| 3. Send to Backend | `orderData.discountAmount: 150` | Browser Console | `SENDING ORDER DATA` log |
| 4. Backend Receives | `Discount Amount: 150.0` | Backend Logs | `DISCOUNT INFO RECEIVED` section |
| 5. Backend Subtracts | `Total after discount: 64850` | Backend Logs | `APPLYING DISCOUNT` section |
| 6. Backend Saves | `Order discountAmount: 150.00` | Backend Logs | `ORDER SAVED` section |
| 7. Response Created | `Response discountAmount: 150.00` | Backend Logs | `ORDER RESPONSE CREATED` section |
| 8. Frontend Receives | `response.data.discountAmount: 150` | Browser Console | `ORDER CREATED RESPONSE` log |
| 9. Payment Modal | `order.discountAmount: 150` | Browser Console | `PAYMENT MODAL RECEIVED` log |
| 10. Order Details | Shows "- ₹150.00" | UI + Console | `OrderDetail` logs |

---

## ✅ Success Criteria

After fixes, you should see:

**For ₹150 Discount:**
- Validation returns: 150
- Order created with totalAmount: (original - 150)
- Payment modal shows: (original - 150)
- Order details shows: Discount - ₹150.00

**For ₹50 Discount:**
- Validation returns: 50
- Order created with totalAmount: (original - 50)
- Payment modal shows: (original - 50)
- Order details shows: Discount - ₹50.00

**For ₹500 Discount:**
- Validation returns: 500
- Order created with totalAmount: (original - 500)
- Payment modal shows: (original - 500)
- Order details shows: Discount - ₹500.00

---

## 🚀 Next Steps

1. **Restart Backend** (CRITICAL - changes won't apply without restart!)
2. **Clear Browser Console**
3. **Follow STEP 3-7** above with a ₹150 discount code
4. **Capture all logs** from both browser console and backend terminal
5. **If issues persist:** Share the complete logs from one full flow

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2026  
**Status:** 🔍 Ready for Testing
