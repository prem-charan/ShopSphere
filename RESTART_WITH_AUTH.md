# 🔥 RESTART WITH AUTHENTICATION

## ⚡ Quick Actions (Do This Now)

### 1️⃣ Stop Current Servers
Press `Ctrl+C` in both backend and frontend terminals

### 2️⃣ Rebuild Backend (1 command)
```bash
cd ~/Documents/shopsphere/backend && mvn clean install && mvn spring-boot:run
```

**Time: 3-5 minutes** (downloads Spring Security & JWT)

### 3️⃣ Restart Frontend (New Terminal)
```bash
cd ~/Documents/shopsphere/frontend && npm run dev
```

**Time: 5 seconds**

### 4️⃣ Create Admin User (New Terminal)
```bash
curl -X POST http://localhost:8080/api/auth/admin/signup \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret-Key: ADMIN_SECRET_KEY_2024" \
  -d '{"name":"Admin","email":"admin@shopsphere.com","password":"admin123"}'
```

### 5️⃣ Open Browser
```
http://localhost:3000
```

---

## 🎯 What You'll See

### Homepage (Public - No Login)
- Beautiful product grid
- Search bar
- Category filters
- Login/Signup buttons

### Click a Product
- Redirects to login page
- Must login to see details

### Login Page
- Toggle between Customer/Admin
- Enter credentials
- Different dashboards based on role

---

## 🔑 Test Credentials

### Admin Login
```
Email: admin@shopsphere.com
Password: admin123
```

### Customer
Create via signup page at:
```
http://localhost:3000/signup
```

---

## 🎨 What Changed

### Before
- ❌ No authentication
- ❌ Everyone could edit products
- ❌ Simple dashboard

### After
- ✅ Public homepage (like Amazon)
- ✅ Login required for product details
- ✅ Role-based access (Customer/Admin)
- ✅ Admins can manage products
- ✅ Customers can only view
- ✅ Separate admin panel
- ✅ JWT authentication

---

## 📊 User Roles

### 👤 Customer
- Browse homepage ✅
- View products ✅ (after login)
- Search & filter ✅
- Cannot manage products ❌

### 🛡️ Admin
- Everything customers can do ✅
- Add products ✅
- Edit products ✅
- Delete products ✅
- Admin dashboard ✅
- Low stock monitoring ✅

---

## 🎬 Complete Command Sequence

**Run all these:**

```bash
# Terminal 1: Backend
cd ~/Documents/shopsphere/backend
mvn clean install
mvn spring-boot:run

# Terminal 2: Frontend (after backend starts)
cd ~/Documents/shopsphere/frontend
npm run dev

# Terminal 3: Create admin (after backend starts)
curl -X POST http://localhost:8080/api/auth/admin/signup \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret-Key: ADMIN_SECRET_KEY_2024" \
  -d '{"name":"Admin","email":"admin@shopsphere.com","password":"admin123"}'
```

**Then open:** http://localhost:3000

---

## ✅ Success Checklist

- [ ] Backend rebuilt successfully
- [ ] Backend running on port 8080
- [ ] Frontend running on port 3000
- [ ] Admin user created
- [ ] Homepage loads with products
- [ ] Can click login
- [ ] Can toggle between Customer/Admin
- [ ] Admin login works
- [ ] Admin dashboard accessible
- [ ] Customer signup works
- [ ] Product click redirects to login

---

## 🎉 You're Ready!

The system is now complete with:
- 🏠 Public homepage for browsing
- 🔐 Secure authentication
- 👥 Two user types (Customer & Admin)
- 🛡️ Protected admin panel
- 🎨 Beautiful modern UI

**Run the commands above and enjoy!** 🚀
