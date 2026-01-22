# 🛡️ Create Your First Admin User

## 🚀 Quick Command

After starting the backend, run this command to create your first admin:

```bash
curl -X POST http://localhost:8080/api/auth/admin/signup \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret-Key: ADMIN_SECRET_KEY_2024" \
  -d '{
    "name": "Admin",
    "email": "admin@shopsphere.com",
    "password": "admin123"
  }'
```

---

## 🔑 Admin Credentials

After running the command above:
- **Email**: admin@shopsphere.com
- **Password**: admin123

---

## 🎯 How to Login as Admin

1. Go to: `http://localhost:3000/login`
2. Click **"Admin"** button
3. Enter:
   - Email: `admin@shopsphere.com`
   - Password: `admin123`
4. Click "Sign in as Admin"
5. You'll be redirected to Admin Dashboard

---

## 📊 Admin Capabilities

Once logged in as admin, you can:
- ✅ View dashboard with statistics
- ✅ Add new products
- ✅ Edit existing products
- ✅ Delete products
- ✅ Update stock quantities
- ✅ View low stock alerts
- ✅ Manage entire inventory

---

## 👤 Create Customer Account

Customers can signup directly from the website:

1. Go to: `http://localhost:3000/signup`
2. Fill in details
3. Click "Create Account"
4. Automatically logged in

Or via API:
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## 🔒 Security Notes

### Admin Secret Key
The admin secret key is: `ADMIN_SECRET_KEY_2024`

**Location:** `backend/src/main/java/com/shopsphere/service/AuthService.java` (line 96)

**⚠️ Change this in production!**

### JWT Secret
**Location:** `backend/src/main/resources/application.properties`

```properties
jwt.secret=shopSphereSecretKeyForJWTTokenGenerationAndValidation2024!@#$%
```

**⚠️ Use environment variables in production!**

---

## 🧪 Testing

### Test Customer Flow
```bash
# 1. Signup
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# 2. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Test Admin Flow
```bash
# 1. Create admin
curl -X POST http://localhost:8080/api/auth/admin/signup \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret-Key: ADMIN_SECRET_KEY_2024" \
  -d '{"name":"Admin","email":"admin@test.com","password":"admin123"}'

# 2. Login as admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123","role":"ADMIN"}'

# 3. Use token to create product
TOKEN="paste_token_here"
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"New Product","category":"Test","price":99.99,"stockQuantity":50}'
```

---

## 📱 Pages Overview

### Public Pages (No Auth)
- **Homepage** (`/`) - Browse products, search, filter
- **Login** (`/login`) - Customer & admin login
- **Signup** (`/signup`) - Customer registration

### Protected Pages (Login Required)
- **Product Detail** (`/product/:id`) - Full product information

### Admin Pages (Admin Only)
- **Admin Dashboard** (`/admin/dashboard`) - Statistics
- **Manage Products** (`/admin/products`) - CRUD operations
- **Low Stock Alerts** (`/admin/low-stock`) - Inventory monitoring

---

## 🎨 UI Features

### Homepage
- Hero section with search
- Category filters
- Product grid (Amazon-style)
- Product cards with images
- Low stock badges
- Login/Signup buttons

### Login Page
- Toggle between Customer/Admin
- Visual differentiation
- Form validation
- Error messages
- Link to signup

### Admin Dashboard
- Separate admin navigation
- Purple/Indigo theme (vs blue for customers)
- Full product management
- Statistics overview
- Quick actions

---

## 🔄 Workflow

### Public to Customer
```
Homepage (public) 
  → Click Product 
  → Redirect to Login 
  → Login/Signup 
  → View Product Details
```

### Admin Workflow
```
Homepage 
  → Login (Admin) 
  → Admin Dashboard 
  → Manage Products
```

---

## 🆘 Troubleshooting

### Can't Login
- Check backend is running
- Verify credentials
- Check browser console for errors
- Verify token in localStorage

### Admin Can't Create Products
- Ensure logged in as admin (role: ADMIN)
- Check token is included in request headers
- Verify admin secret key matches

### Token Expired
- Login again (tokens expire in 24 hours)
- Automatic logout and redirect to login

---

## ✅ Quick Start Checklist

- [ ] Backend running on port 8080
- [ ] Frontend running on port 3000
- [ ] Created first admin user (via curl)
- [ ] Can login as admin
- [ ] Can access admin dashboard
- [ ] Can add products as admin
- [ ] Customer signup works
- [ ] Customer login works
- [ ] Product viewing requires login
- [ ] Customers cannot access admin pages

---

## 🎉 You're All Set!

Your authentication system is complete:
- Public can browse homepage
- Customers must login to see details
- Only admins can manage products
- Secure JWT-based authentication

**Happy building!** 🚀
