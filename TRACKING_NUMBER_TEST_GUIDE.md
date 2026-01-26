# Tracking Number - Complete Testing Guide

**Date:** January 27, 2026  
**Status:** ⚠️ Awaiting Backend Restart

---

## ⚠️ CRITICAL: Backend Must Be Restarted!

The tracking number auto-generation feature **WILL NOT WORK** until you restart the backend with the updated code.

```bash
# In Terminal 2 (backend terminal):
# 1. Press Ctrl+C to stop the current server
# 2. Then run:
cd /home/premcharan/Documents/shopsphere/backend
mvn spring-boot:run

# 3. Wait for: "ShopSphere Backend is running on port 8080"
```

**Why?** The Java code changes (auto-generation logic) are only loaded when the server starts.

---

## 🧪 Step-by-Step Testing

### **STEP 1: Restart Backend** ⚠️ MANDATORY

Follow the commands above. Do not proceed to testing until you see:
```
ShopSphere Backend is running on port 8080
```

### **STEP 2: Open Browser Console**

1. Open Chrome/Firefox
2. Press `F12`
3. Go to "Console" tab
4. Clear console (click 🚫 icon)

### **STEP 3: Go to Manage Orders**

1. Navigate to: http://localhost:5173/admin/orders
2. You should see a table with columns:
   - Order ID
   - Type
   - Customer ID
   - Total Amount
   - Status
   - **Tracking** ← New column!
   - Payment
   - Date
   - Actions

### **STEP 4: Find a CONFIRMED Order**

Look for an order with:
- Status: CONFIRMED (blue badge)
- Tracking column: "Not yet" (gray italic text)

If you don't have any CONFIRMED orders:
1. Login as customer (different tab/window)
2. Create a new order
3. Come back to admin panel

### **STEP 5: Update Order to SHIPPED**

1. Click the "Update" button for the CONFIRMED order
2. Modal opens with title "Update Order Status"
3. **Select New Status: SHIPPED**
4. **Tracking Number field appears with:**
   - Label: "Tracking Number (Optional - Auto-generated if empty...)"
   - Placeholder: "Leave empty for auto-generation..."
   - Green text: "✓ Tracking number will be automatically generated"

5. **Leave the tracking number field EMPTY**
6. (Optional) Add notes: "Shipped today"
7. Click "Update Status"

### **STEP 6: Check Console Logs**

**Browser Console Should Show:**
```javascript
=== UPDATING ORDER STATUS ===
Order ID: 15
Update data: { status: "SHIPPED", trackingNumber: "", notes: "Shipped today" }

=== UPDATE RESPONSE ===
Updated order: { orderId: 15, status: "SHIPPED", trackingNumber: "TRACK-ONL-15-1706305200", ... }
Tracking number after update: TRACK-ONL-15-1706305200

Orders list refreshed
```

**Backend Logs Should Show:**
```
INFO: Updating order 15 status to SHIPPED
INFO: Auto-generated tracking number: TRACK-ONL-15-1706305200
INFO: Order status updated successfully
```

### **STEP 7: Verify in Order List Table**

After the modal closes, the order list should refresh automatically. Check the order you just updated:

**Expected:**
- Status column: SHIPPED (purple badge)
- **Tracking column:** `TRACK-ONL-15-1706305200` (in gray box with monospace font)

**If it shows "Not yet":**
- The order list didn't refresh properly
- Manually refresh the page (F5)
- Check console logs from STEP 6

### **STEP 8: Check Order Details Page**

1. Click "View" button on the shipped order
2. Navigate to order details page
3. Look for "Tracking Number" section

**Browser Console Should Show:**
```javascript
=== OrderDetail - Fetched order ===
Order status: SHIPPED
Tracking number: TRACK-ONL-15-1706305200
```

**Expected in UI:**
```
🚚 Tracking Number
   TRACK-ONL-15-1706305200
```

---

## 🔍 Troubleshooting

### Problem 1: "Backend logs don't show auto-generation"

**Symptom:** Backend logs show:
```
INFO: Updating order 15 status to SHIPPED
INFO: Order status updated successfully
```
(Missing: "Auto-generated tracking number" line)

**Cause:** Backend not running latest code OR tracking number was manually provided

**Fix:**
1. Stop backend (Ctrl+C)
2. Restart: `mvn spring-boot:run`
3. Try again

---

### Problem 2: "Tracking column still shows 'Not yet'"

**Symptom:** After updating to SHIPPED, table still shows "Not yet"

**Causes:**
A. **Order list didn't refresh** - Click browser refresh (F5)
B. **Backend didn't save tracking** - Check backend logs
C. **Database issue** - Check database directly

**Check Database:**
```sql
SELECT order_id, status, tracking_number, updated_at 
FROM orders 
WHERE order_id = 15;
```

**Expected:**
```
order_id: 15
status: SHIPPED
tracking_number: TRACK-ONL-15-1706305200
```

**If tracking_number is NULL:**
- Backend code not running
- Check backend logs for errors
- Restart backend

---

### Problem 3: "Console shows tracking number but UI doesn't"

**Symptom:** 
- Console: `Tracking number after update: TRACK-ONL-15-...`
- UI: Shows "Not yet"

**Cause:** Frontend display issue

**Fix:** Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

---

### Problem 4: "Update modal doesn't show tracking field"

**Symptom:** When selecting SHIPPED, no tracking number field appears

**Cause:** Frontend code issue

**Check:** The modal should have this code:
```jsx
{updateData.status === 'SHIPPED' && (
  <div className="mb-4">
    <label>Tracking Number...</label>
    <input ... />
  </div>
)}
```

**Fix:** Ensure frontend hot-reloaded properly. Restart frontend if needed.

---

## 📊 Expected Behavior Summary

| Action | Expected Result | Where to Check |
|--------|----------------|----------------|
| Select SHIPPED status | Tracking field appears with helper text | Update modal |
| Leave tracking empty | Green text: "will be auto-generated" | Update modal |
| Enter custom tracking | Blue text: "Using custom tracking..." | Update modal |
| Click Update (empty) | Backend logs: "Auto-generated..." | Terminal 2 |
| After update | Console: "Tracking number: TRACK-..." | Browser console |
| Order list | Shows tracking in monospace | Order list table |
| Order details | Shows tracking with truck icon | Order details page |
| Database | Has tracking_number value | MySQL query |

---

## 🗄️ Database Verification Queries

### Check All Shipped Orders:
```sql
SELECT 
    order_id,
    status,
    tracking_number,
    created_at,
    updated_at
FROM orders
WHERE status = 'SHIPPED'
ORDER BY updated_at DESC;
```

### Check Specific Order:
```sql
SELECT * FROM orders WHERE order_id = 15;
```

### Find Orders Without Tracking (That Should Have It):
```sql
SELECT order_id, status, tracking_number
FROM orders
WHERE status = 'SHIPPED' 
  AND (tracking_number IS NULL OR tracking_number = '');
```

**Expected:** No results (all SHIPPED orders should have tracking)

---

## ✅ Success Checklist

After following all steps, verify:

- [ ] Backend is running latest code (restarted after changes)
- [ ] Update modal shows tracking field when SHIPPED selected
- [ ] Helper text shows "Optional - Auto-generated if empty"
- [ ] Green message appears when field is empty + SHIPPED
- [ ] Backend logs show "Auto-generated tracking number: TRACK-..."
- [ ] Console shows tracking number in update response
- [ ] Order list table shows tracking number in Tracking column
- [ ] Order details page shows tracking number
- [ ] Database has tracking_number value for the order
- [ ] Tracking number format: `TRACK-{TYPE}-{ID}-{TIMESTAMP}`

---

## 🚨 If Still Not Working

### Checklist:
1. ✅ Backend restarted after code changes?
2. ✅ Backend logs showing auto-generation?
3. ✅ Console logs showing tracking in response?
4. ✅ Database has tracking_number value?
5. ✅ Frontend refreshed after update?

### Get Help:
If tracking still not showing, provide:
1. **Backend logs** from when you clicked "Update Status"
2. **Browser console logs** after update
3. **Database query result:**
   ```sql
   SELECT * FROM orders WHERE order_id = XX;
   ```

---

## 💡 Quick Test

**Fastest way to verify it's working:**

```bash
# 1. Stop backend (Ctrl+C)
# 2. Restart backend
mvn spring-boot:run

# 3. When ready, update any order to SHIPPED (leave tracking empty)
# 4. Check backend logs for: "Auto-generated tracking number: TRACK-..."
# 5. If you see that log, it's working!
```

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2026  
**Status:** ⚠️ Requires Backend Restart to Function
