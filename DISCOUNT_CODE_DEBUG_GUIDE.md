# Discount Code Debugging Guide

## ⚠️ Issue: "Failed to validate discount code"

### 🔍 **How to Debug**

#### **Step 1: Check Backend Logs**

When you apply a discount code, the backend will now log detailed information:

```
INFO: Validating discount code: REWARD-1-1769456287308
INFO: Extracted userId 1 from code
INFO: Found X REDEEMED transactions for user 1
INFO: Transaction description: Redeemed: ₹50 Off (Code: REWARD-1-1769456287308)
INFO: Parsing discount from description: Redeemed: ₹50 Off (Code: REWARD-1-1769456287308)
INFO: Discount code validated successfully: REWARD-1-1769456287308 - ₹50 off
```

**Look for these in your terminal running `mvn spring-boot:run`**

#### **Step 2: Check Frontend Console**

Open browser DevTools (F12) → Console tab:

```javascript
Validating discount code: REWARD-1-1769456287308
Validation response: { valid: true, discountAmount: 50, ... }
Discount applied successfully: 50
```

**OR if there's an error:**

```javascript
Error validating discount code: ...
Error response: { message: "..." }
Error status: 404 or 500
```

### 🐛 **Common Issues & Solutions**

#### **Issue 1: Code Not Found in Database**

**Symptoms:**
- Backend logs: "Found 0 REDEEMED transactions for user 1"
- Error: "Discount code not found or already used"

**Solution:**
```sql
-- Check if the reward was actually redeemed:
SELECT * FROM loyalty_transactions 
WHERE user_id = 1 AND type = 'REDEEMED' 
ORDER BY created_at DESC;

-- You should see a record like:
-- description: "Redeemed: ₹50 Off (Code: REWARD-1-1769456287308)"
```

**If NO records found:**
- The reward redemption failed
- Go back to Rewards page and redeem again
- Make sure you have enough points

#### **Issue 2: CORS Error**

**Symptoms:**
- Frontend console: "CORS policy blocked"
- Network tab shows request failed

**Solution:**
Check `LoyaltyController.java` has:
```java
@CrossOrigin(origins = "http://localhost:5173")
```

#### **Issue 3: Backend Not Running**

**Symptoms:**
- Frontend console: "Network Error" or "ERR_CONNECTION_REFUSED"
- No backend logs at all

**Solution:**
```bash
# Restart backend
cd backend
mvn spring-boot:run
```

#### **Issue 4: Wrong Code Format**

**Symptoms:**
- Backend logs: "Invalid code format - doesn't start with REWARD-"

**Solution:**
- Code must be EXACTLY: `REWARD-{userId}-{timestamp}`
- Case-sensitive (must be UPPERCASE)
- No spaces
- Example: `REWARD-1-1769456287308` ✅
- NOT: `reward-1-123` ❌

#### **Issue 5: Transaction Description Doesn't Match**

**Symptoms:**
- Backend logs: "Found 1 REDEEMED transactions"
- Backend logs: "Could not parse discount amount from description"

**Solution:**
```sql
-- Check the exact description format:
SELECT description FROM loyalty_transactions 
WHERE user_id = 1 AND type = 'REDEEMED';

-- Should be EXACTLY:
-- "Redeemed: ₹50 Off (Code: REWARD-1-XXX)"
-- "Redeemed: ₹150 Off (Code: REWARD-1-XXX)"
-- "Redeemed: ₹500 Off (Code: REWARD-1-XXX)"
```

---

## ✅ **Testing Steps**

### **Complete End-to-End Test:**

1. **Earn Points:**
   ```
   - Place order for ₹50,000
   - Backend logs: "Successfully awarded 500 points to user 1"
   ```

2. **Redeem Reward:**
   ```
   - Go to /loyalty page
   - Click "Claim Reward" on ₹50 Off (500 points)
   - Confirm redemption
   - Copy code: REWARD-1-XXXXXXXXXX
   ```

3. **Check Database:**
   ```sql
   SELECT * FROM loyalty_transactions 
   WHERE user_id = 1 AND type = 'REDEEMED' 
   ORDER BY created_at DESC LIMIT 1;
   ```
   
   **Expected:**
   ```
   | transaction_id | user_id | points | type     | description                                     |
   |---------------|---------|--------|----------|------------------------------------------------|
   | 5             | 1       | -500   | REDEEMED | Redeemed: ₹50 Off (Code: REWARD-1-1769456287308) |
   ```

4. **Apply Code:**
   ```
   - Go to any product
   - Click "Buy Now"
   - In "Have a Discount Code?" section
   - Paste: REWARD-1-1769456287308
   - Click "Apply"
   ```

5. **Verify Backend Logs:**
   ```
   INFO: Validating discount code: REWARD-1-1769456287308
   INFO: Extracted userId 1 from code
   INFO: Found 1 REDEEMED transactions for user 1
   INFO: Transaction description: Redeemed: ₹50 Off (Code: REWARD-1-1769456287308)
   INFO: Parsing discount from description: ...
   INFO: Discount code validated successfully: REWARD-1-1769456287308 - ₹50 off
   ```

6. **Verify Frontend:**
   ```
   ✅ Green success box appears
   ✅ "₹50 discount applied!"
   ✅ Total price reduced by ₹50
   ```

---

## 🔧 **Quick Fixes**

### **Fix 1: Restart Both Servers**

```bash
# Terminal 1 - Backend
cd backend
# Stop if running (Ctrl+C)
mvn clean spring-boot:run

# Terminal 2 - Frontend
cd frontend
# Stop if running (Ctrl+C)
npm run dev
```

### **Fix 2: Clear Browser Cache**

```
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

### **Fix 3: Check Database Connection**

```sql
-- Test query:
SELECT COUNT(*) FROM loyalty_transactions;

-- Should return a number, not an error
```

### **Fix 4: Verify API Endpoint**

Open browser and test directly:
```
http://localhost:8080/api/loyalty/validate-code/REWARD-1-1769456287308
```

**Expected Response:**
```json
{
  "valid": true,
  "discountAmount": 50,
  "message": "Discount code is valid",
  "code": "REWARD-1-1769456287308"
}
```

---

## 📊 **System Check**

Run these checks:

✅ **Backend Status:**
```bash
curl http://localhost:8080/api/analytics/sales
# Should return JSON (even if unauthorized)
```

✅ **Frontend Status:**
```bash
curl http://localhost:5173
# Should return HTML
```

✅ **Database Status:**
```sql
SHOW TABLES;
-- Should show: loyalty_transactions, loyalty_accounts, etc.
```

---

## 🎯 **Expected Behavior**

### **Valid Code:**
- Backend: "Discount code validated successfully"
- Frontend: Green success box
- Order total: Reduced by discount amount

### **Invalid Code:**
- Backend: "Discount code not found" (logged as WARN)
- Frontend: Red error message
- Order total: Unchanged

### **Server Error:**
- Backend: Stack trace in logs
- Frontend: "Failed to validate discount code"
- Check backend terminal for errors

---

## 🆘 **Still Not Working?**

1. **Copy your backend logs** (last 50 lines from when you apply code)
2. **Copy your frontend console** (all logs when you click Apply)
3. **Run this query and share results:**
   ```sql
   SELECT * FROM loyalty_transactions 
   WHERE description LIKE '%REWARD-1-%' 
   ORDER BY created_at DESC LIMIT 5;
   ```

4. **Check backend is actually running:**
   ```bash
   curl http://localhost:8080/api/analytics/sales
   ```

---

**Document Version:** 1.0  
**Last Updated:** January 26, 2026
