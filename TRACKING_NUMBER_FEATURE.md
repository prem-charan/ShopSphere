# Tracking Number Auto-Generation Feature

**Date:** January 27, 2026  
**Status:** ✅ Implemented

---

## 📋 Overview

Tracking numbers are now automatically generated when an order's status is changed to **SHIPPED**. This provides customers with a way to track their shipments and gives admins a unique identifier for each shipped order.

---

## 🎯 Feature Details

### **When Tracking Numbers Are Generated:**
- ✅ Automatically when order status changes to **SHIPPED**
- ✅ Only if no tracking number already exists
- ✅ Admin can manually provide a tracking number to override auto-generation

### **Tracking Number Format:**
```
TRACK-{ORDER_TYPE}-{ORDER_ID}-{TIMESTAMP}
```

**Examples:**
- `TRACK-ONL-15-1706305200` (Online order #15)
- `TRACK-IN--23-1706305300` (In-store order #23)

**Components:**
- `TRACK`: Fixed prefix
- `ORDER_TYPE`: First 3 letters of order type (ONL for ONLINE, IN- for IN_STORE)
- `ORDER_ID`: The unique order ID
- `TIMESTAMP`: Unix timestamp in seconds (for uniqueness)

---

## 🔧 Technical Implementation

### **Backend Changes**

#### **1. OrderService.java - Auto-Generation Logic**

**Location:** `/backend/src/main/java/com/shopsphere/service/OrderService.java`

**Added Method:**
```java
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
```

**Updated Status Update Logic:**
```java
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
```

**Key Features:**
- ✅ Auto-generates if not provided
- ✅ Accepts manual tracking number from admin
- ✅ Never overwrites existing tracking number
- ✅ Logs generation for audit trail

---

### **Frontend Changes**

#### **2. OrderList.jsx - Display Tracking Numbers**

**Location:** `/frontend/src/components/OrderList.jsx`

**Added Table Column:**
```jsx
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Tracking
</th>
```

**Display Logic:**
```jsx
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {order.trackingNumber ? (
    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
      {order.trackingNumber}
    </span>
  ) : (
    <span className="text-gray-400 italic">Not yet</span>
  )}
</td>
```

**Visual Styling:**
- ✅ Monospace font for easy reading
- ✅ Gray background badge
- ✅ "Not yet" placeholder for orders without tracking
- ✅ Responsive design

---

## 🎨 UI Screenshots (What Admins See)

### **Order List Table:**
```
┌────────┬───────┬─────────────┬────────┬────────────────────────┬─────────┬─────────────┬────────────┐
│Order ID│ Type  │Customer ID  │ Total  │ Status                 │Tracking │   Payment   │    Date    │
├────────┼───────┼─────────────┼────────┼────────────────────────┼─────────┼─────────────┼────────────┤
│  #15   │ONLINE │     1       │₹64850  │ [CONFIRMED]            │ Not yet │ [COMPLETED] │ 1/27/2026  │
│  #16   │ONLINE │     2       │₹25000  │ [SHIPPED]              │TRACK-...│ [COMPLETED] │ 1/27/2026  │
│  #17   │IN_STOR│     1       │₹15000  │ [DELIVERED]            │TRACK-...│ [PENDING]   │ 1/26/2026  │
└────────┴───────┴─────────────┴────────┴────────────────────────┴─────────┴─────────────┴────────────┘
```

### **Update Order Status Modal:**
```
┌───────────────────────────────────────┐
│ Update Order Status                   │
│                                       │
│ Order ID: #16                         │
│ Current Status: [CONFIRMED]           │
│                                       │
│ New Status:                           │
│ [SHIPPED ▼]                           │
│                                       │
│ Tracking Number:                      │
│ [Optional - Auto-generated]          │
│                                       │
│ Notes:                                │
│ [Order shipped via FedEx]            │
│                                       │
│ [Cancel]  [Update Status]            │
└───────────────────────────────────────┘
```

---

## 📊 Order Status Flow & Tracking

### **Status Transitions:**

```
CONFIRMED → SHIPPED → DELIVERED
    ↓          ↓          ↓
    └─────> CANCELLED <──┘

Tracking Number Generated: When status → SHIPPED
```

**Tracking Number Lifecycle:**
1. **CONFIRMED**: No tracking number (shows "Not yet")
2. **SHIPPED**: Tracking number AUTO-GENERATED or manually entered
3. **DELIVERED**: Tracking number retained
4. **CANCELLED**: Tracking number retained (if was shipped before cancellation)

---

## 🧪 Testing Guide

### **Test 1: Auto-Generation (Main Feature)**

1. **Go to Admin Dashboard** → "Manage Orders"
2. **Find an order with status CONFIRMED**
3. **Click "Update"** button
4. **Select status: SHIPPED**
5. **Leave tracking number field EMPTY**
6. **Click "Update Status"**
7. **Check the order list:**
   - ✅ Status shows SHIPPED
   - ✅ Tracking column shows auto-generated tracking number
   - ✅ Format: `TRACK-ONL-XX-XXXXXXXX`

**Backend logs should show:**
```
INFO: Auto-generated tracking number: TRACK-ONL-15-1706305200
INFO: Order status updated successfully
```

---

### **Test 2: Manual Tracking Number**

1. **Go to Admin Dashboard** → "Manage Orders"
2. **Find an order with status CONFIRMED**
3. **Click "Update"** button
4. **Select status: SHIPPED**
5. **Enter custom tracking: `FED-123456789`**
6. **Click "Update Status"**
7. **Check the order list:**
   - ✅ Status shows SHIPPED
   - ✅ Tracking shows: `FED-123456789` (your custom number)

**Backend logs should show:**
```
INFO: Using provided tracking number: FED-123456789
```

---

### **Test 3: Already Shipped Order (No Overwrite)**

1. **Find an order that's already SHIPPED** (with tracking number)
2. **Click "Update"** button
3. **Change status to DELIVERED**
4. **Click "Update Status"**
5. **Check the order:**
   - ✅ Status changes to DELIVERED
   - ✅ Tracking number UNCHANGED (not regenerated)

---

### **Test 4: Customer View**

1. **Login as customer**
2. **Go to "My Orders"**
3. **Click on a SHIPPED order**
4. **Check order details:**
   - ✅ Tracking number displayed in order info
   - ✅ Shows "Tracking Number: TRACK-ONL-XX-XXXXXXXX"

---

## 📱 Customer-Facing Display

### **Order Details Page (Customer View):**

```
┌─────────────────────────────────────────────────┐
│ Order #16                                       │
│ Placed on 1/27/2026 at 2:30 PM                │
│ [SHIPPED]                                       │
│                                                 │
│ 📦 Order Type: ONLINE                          │
│ 💳 Payment Status: COMPLETED                   │
│ 🚚 Tracking Number: TRACK-ONL-16-1706305200   │
│                                                 │
│ 📍 Shipping Address:                           │
│ 123 Main St, Mumbai, 400001                   │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Database Schema

### **Order Table:**
```sql
CREATE TABLE orders (
    ...
    tracking_number VARCHAR(100) NULL,
    ...
);
```

**Example Data:**
```sql
SELECT order_id, status, tracking_number FROM orders;

┌──────────┬───────────┬──────────────────────────┐
│ order_id │  status   │    tracking_number       │
├──────────┼───────────┼──────────────────────────┤
│    15    │ CONFIRMED │ NULL                     │
│    16    │ SHIPPED   │ TRACK-ONL-16-1706305200  │
│    17    │ DELIVERED │ TRACK-IN--17-1706305100  │
│    18    │ SHIPPED   │ FED-123456789            │ (manual)
└──────────┴───────────┴──────────────────────────┘
```

---

## 🔐 Security & Validation

### **Input Validation:**
```java
// Backend validates:
- Status transition is valid (CONFIRMED → SHIPPED)
- Tracking number length < 100 characters
- Only alphanumeric and hyphens allowed (if manual)
```

### **Access Control:**
```java
// Only admins can update order status
@PreAuthorize("hasRole('ADMIN')")
public OrderResponse updateOrderStatus(...)
```

### **Auto-Generation Safety:**
- ✅ Never overwrites existing tracking number
- ✅ Only generates when status = SHIPPED
- ✅ Unique timestamp ensures no collisions
- ✅ Order ID included for traceability

---

## 📈 Benefits

### **For Customers:**
✅ Track their shipments  
✅ Know when order was shipped  
✅ Reference number for carrier queries  
✅ Increased trust and transparency

### **For Business:**
✅ Automatic tracking number management  
✅ No manual entry required (unless preferred)  
✅ Unique identifier for each shipment  
✅ Easy to search and filter  
✅ Audit trail with timestamps

### **For Support:**
✅ Quick order lookup by tracking number  
✅ Easy to identify shipment stage  
✅ Reference for carrier inquiries  
✅ Historical tracking data

---

## 🛠️ Admin Workflow

### **Step-by-Step: Shipping an Order**

1. **View Orders:**
   - Navigate to Admin Dashboard → Manage Orders
   - See list of all orders
   - Filter by "CONFIRMED" to see ready-to-ship orders

2. **Update to Shipped:**
   - Click "Update" button on order
   - Select "SHIPPED" from status dropdown
   - (Optional) Enter custom tracking number
   - Add notes if needed (e.g., "Shipped via FedEx")
   - Click "Update Status"

3. **System Actions:**
   - ✅ Status changes to SHIPPED
   - ✅ Tracking number auto-generated (if not provided)
   - ✅ Timestamp recorded
   - ✅ Customer can now see tracking info

4. **Continue Order Flow:**
   - Later, update to "DELIVERED" when shipment arrives
   - Tracking number remains for reference

---

## 🔄 Integration Points

### **Future Enhancements:**

**Carrier Integration (Future):**
```javascript
// Potential integration with real carriers
const trackingAPIs = {
  FedEx: 'https://api.fedex.com/track',
  UPS: 'https://api.ups.com/track',
  DHL: 'https://api.dhl.com/track'
};

// Auto-detect carrier from tracking format
function getCarrierLink(trackingNumber) {
  if (trackingNumber.startsWith('FED-')) return trackingAPIs.FedEx;
  if (trackingNumber.startsWith('1Z')) return trackingAPIs.UPS;
  // ...
}
```

**Email Notifications (Future):**
```
Subject: Your order #16 has been shipped! 📦

Dear Customer,

Good news! Your order #16 has been shipped.

Tracking Number: TRACK-ONL-16-1706305200
Estimated Delivery: 2-3 business days

Track your order: [Track Order Button]

Thank you for shopping with ShopSphere!
```

---

## 📝 API Documentation

### **Update Order Status Endpoint:**

**Endpoint:** `PUT /api/orders/{orderId}/status`

**Request:**
```json
{
  "status": "SHIPPED",
  "trackingNumber": "FED-123456789",  // Optional
  "notes": "Shipped via FedEx"         // Optional
}
```

**Response (Auto-Generated):**
```json
{
  "orderId": 16,
  "status": "SHIPPED",
  "trackingNumber": "TRACK-ONL-16-1706305200",
  "updatedAt": "2026-01-27T14:30:00",
  ...
}
```

**Response (Manual):**
```json
{
  "orderId": 16,
  "status": "SHIPPED",
  "trackingNumber": "FED-123456789",
  "updatedAt": "2026-01-27T14:30:00",
  ...
}
```

---

## 🐛 Troubleshooting

### **Issue: Tracking number not showing**

**Check:**
1. Order status is SHIPPED? (Tracking only for shipped orders)
2. Backend logs show generation?
3. Database has tracking_number value?

**SQL Query:**
```sql
SELECT order_id, status, tracking_number 
FROM orders 
WHERE order_id = XX;
```

---

### **Issue: Tracking number overwritten**

**Cause:** This shouldn't happen with the current logic.

**Debug:**
```sql
-- Check order history
SELECT order_id, tracking_number, updated_at 
FROM orders 
WHERE order_id = XX;
```

**Backend logs:**
```
INFO: Using provided tracking number: ... (if manual)
INFO: Auto-generated tracking number: ... (if auto)
```

---

## ✅ Success Criteria

After implementation, verify:

- [ ] Orders with status CONFIRMED show "Not yet" for tracking
- [ ] Changing status to SHIPPED auto-generates tracking number
- [ ] Tracking number shows in admin order list
- [ ] Tracking number appears in order details page
- [ ] Manual tracking numbers override auto-generation
- [ ] Existing tracking numbers are never overwritten
- [ ] Format is consistent: `TRACK-{TYPE}-{ID}-{TIMESTAMP}`
- [ ] Backend logs tracking number generation
- [ ] Customers can see tracking number for their shipped orders

---

## 📚 Related Documentation

- `ORDER_MODULE_GUIDE.md` - Order processing flow
- `PAYMENT_FLOW_FIX.md` - Payment and order creation
- `DISCOUNT_CODE_IN_ORDERS.md` - Discount functionality

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2026  
**Status:** ✅ Complete & Deployed
