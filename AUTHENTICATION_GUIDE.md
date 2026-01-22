# 🔐 Authentication System - ShopSphere

## ✅ What's Been Added

Complete authentication system with:
- ✅ Customer and Admin roles
- ✅ JWT-based authentication
- ✅ Public homepage (anyone can view products)
- ✅ Protected product details (login required)
- ✅ Admin-only product management
- ✅ Login/Signup pages
- ✅ Role-based access control

---

## 👥 User Types

### 1. **Customer** (Regular Users)
- Can view products on homepage
- Must login to view product details
- Cannot add/edit/delete products

### 2. **Admin** (Store Managers)
- Full access to product management
- Can add/edit/delete products
- Access to admin dashboard
- Monitor inventory and low stock

---

## 🎯 User Flow

### Customer Journey
```
1. Visit Homepage → View Products (No login required)
2. Click Product → Redirected to Login
3. Login/Signup → View Product Details
4. Browse products as authenticated user
```

### Admin Journey
```
1. Visit Homepage
2. Click "Login" → Select "Admin Login"
3. Enter admin credentials
4. Redirected to Admin Dashboard
5. Manage products, view inventory, check alerts
```

---

## 🚀 How to Use

### For Customers

#### 1. Signup
- Go to: `http://localhost:3000/signup`
- Fill in details
- Click "Create Account"
- Automatically logged in

#### 2. Login
- Go to: `http://localhost:3000/login`
- Select "Customer Login"
- Enter email and password
- Click "Sign in as Customer"

### For Admins

#### 1. Create First Admin (Via API)
Since there's no admin yet, create one using curl:

```bash
curl -X POST http://localhost:8080/api/auth/admin/signup \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret-Key: ADMIN_SECRET_KEY_2024" \
  -d '{
    "name": "Admin User",
    "email": "admin@shopsphere.com",
    "password": "admin123"
  }'
```

#### 2. Admin Login
- Go to: `http://localhost:3000/login`
- Click "Admin" button
- Enter admin email and password
- Click "Sign in as Admin"
- Redirected to Admin Dashboard

---

## 🔑 Default Admin Credentials

After creating the admin (using curl above):
- **Email**: admin@shopsphere.com
- **Password**: admin123

**⚠️ Change these in production!**

---

## 🛡️ Security Features

### Backend
- ✅ **JWT Tokens**: Secure token-based authentication
- ✅ **Password Encryption**: BCrypt hashing
- ✅ **Role-Based Access**: Spring Security with roles
- ✅ **Protected Endpoints**: Only admins can modify products
- ✅ **Token Validation**: Every request validated
- ✅ **CORS Configuration**: Secure cross-origin requests

### Frontend
- ✅ **Protected Routes**: Login required for certain pages
- ✅ **Token Storage**: Secure localStorage
- ✅ **Auto Logout**: On token expiry
- ✅ **Role Checking**: UI adapts based on user role
- ✅ **Context API**: Centralized auth state

---

## 📊 API Endpoints

### Authentication Endpoints (Public)
```
POST /api/auth/signup          - Customer registration
POST /api/auth/login           - User login (customer/admin)
POST /api/auth/admin/signup    - Admin registration (requires secret key)
```

### Product Endpoints

#### Public (No Auth Required)
```
GET /api/products              - Get all products
GET /api/products/{id}         - Get product by ID
GET /api/products/search       - Search products
GET /api/products/categories   - Get categories
```

#### Admin Only (Requires ADMIN role)
```
POST   /api/products           - Create product
PUT    /api/products/{id}      - Update product
DELETE /api/products/{id}      - Delete product
PATCH  /api/products/{id}/stock - Update stock
```

---

## 🎨 Frontend Pages

### Public Pages (No Login Required)
- `/` - Homepage with product listing
- `/login` - Login page (customer & admin)
- `/signup` - Signup page (customers only)

### Protected Pages (Login Required)
- `/product/:id` - Product detail page

### Admin Pages (Admin Only)
- `/admin/dashboard` - Admin dashboard with stats
- `/admin/products` - Product management
- `/admin/low-stock` - Low stock alerts

---

## 🧪 Testing Authentication

### 1. Create a Customer
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Login as Customer
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}
```

### 3. Create an Admin
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

### 4. Test Protected Endpoint (Admin Only)
```bash
# Get token from login response
TOKEN="your_admin_token_here"

# Create product (admin only)
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Product",
    "category": "Electronics",
    "price": 99.99,
    "stockQuantity": 50
  }'
```

---

## 🔧 Configuration

### JWT Settings (application.properties)
```properties
# JWT Secret Key (change in production!)
jwt.secret=shopSphereSecretKeyForJWTTokenGenerationAndValidation2024!@#$%

# JWT Expiration (24 hours = 86400000 milliseconds)
jwt.expiration=86400000
```

### Admin Secret Key
In `AuthService.java` (line 96):
```java
String expectedSecretKey = "ADMIN_SECRET_KEY_2024";
```

**⚠️ Change this in production!**

---

## 🎭 User Experience

### Customer View
1. **Homepage**: Browse products, search, filter by category
2. **Product Click**: Must login to see details
3. **After Login**: Can view all product information
4. **Navigation**: Clean, simple interface

### Admin View
1. **Admin Login**: Separate login option
2. **Admin Dashboard**: Statistics and overview
3. **Product Management**: Full CRUD operations
4. **Low Stock Alerts**: Inventory monitoring
5. **Quick Actions**: Update stock, edit products

---

## 📝 Database Tables

### Users Table
```sql
CREATE TABLE users (
  user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,  -- 'CUSTOMER' or 'ADMIN'
  phone VARCHAR(20),
  address VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME NOT NULL,
  updated_at DATETIME
);
```

---

## 🚀 Quick Start

### 1. Rebuild Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 2. Restart Frontend
```bash
cd frontend
npm install  # Install new dependencies
npm run dev
```

### 3. Create First Admin
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

### 4. Test the System

**As Customer:**
1. Open: `http://localhost:3000`
2. Click any product → Redirected to login
3. Click "Sign up" → Create account
4. Now you can view product details

**As Admin:**
1. Go to: `http://localhost:3000/login`
2. Click "Admin" button
3. Login with: `admin@shopsphere.com` / `admin123`
4. Access admin dashboard with full product management

---

## 🔐 Security Best Practices

### For Production:

1. **Change JWT Secret**
```properties
jwt.secret=your_very_long_and_secure_random_secret_key_here
```

2. **Change Admin Secret Key**
Edit `AuthService.java` line 96

3. **Use HTTPS**
```properties
server.ssl.enabled=true
```

4. **Enable CSRF** (if using cookie auth)

5. **Add Rate Limiting**

6. **Environment Variables**
```bash
export JWT_SECRET="your_secret"
export ADMIN_SECRET_KEY="your_admin_key"
```

---

## 🎯 Features Summary

### Authentication
- ✅ JWT-based authentication
- ✅ Secure password hashing (BCrypt)
- ✅ Role-based access (CUSTOMER, ADMIN)
- ✅ Token expiration (24 hours)
- ✅ Protected routes

### Authorization
- ✅ Public product viewing
- ✅ Login required for product details
- ✅ Admin-only product management
- ✅ Automatic role checking
- ✅ Unauthorized access prevention

### User Interface
- ✅ Beautiful login/signup pages
- ✅ Public homepage (Amazon-style)
- ✅ Customer and admin separated
- ✅ Seamless navigation
- ✅ Role-based UI rendering

---

## 📞 Support

For issues:
1. Check browser console for frontend errors
2. Check backend logs for authentication failures
3. Verify JWT token in localStorage
4. Test API endpoints with curl

---

## ✨ Next Steps

1. Create first admin using curl
2. Test customer signup/login
3. Test product viewing flow
4. Test admin dashboard
5. Add products as admin
6. Test customer can view but not edit

---

**Authentication system is ready!** 🚀

Public can browse, customers can view details, only admins can manage!
