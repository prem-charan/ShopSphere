# ShopSphere - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Database Setup (2 minutes)

1. Open MySQL/MariaDB terminal:
```bash
mysql -u root -p
```

2. Create database:
```sql
CREATE DATABASE shopsphere;
EXIT;
```

3. Update credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=your_password
```

### Step 2: Start Backend (2 minutes)

```bash
cd backend
mvn spring-boot:run
```

Wait for: `ShopSphere Backend is running on port 8080`

### Step 3: Start Frontend (1 minute)

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

### Step 4: Access Application

Open browser: `http://localhost:3000`

## ✅ Verification

1. **Backend Running**: Visit `http://localhost:8080/api/products`
   - Should return: `{"success":true,"message":"Products retrieved successfully","data":[],...}`

2. **Frontend Running**: Visit `http://localhost:3000`
   - Should see: ShopSphere Dashboard

## 🎯 First Steps

### Add Your First Product

1. Go to "Products" page
2. Click "Add Product"
3. Fill in:
   - Name: "Sample Laptop"
   - Category: "Electronics"
   - Price: 999.99
   - Stock: 5
4. Click "Create Product"

### Test Low Stock Alert

1. Create a product with stock ≤ 10
2. Go to "Low Stock Alerts"
3. You should see your product listed

## 🔧 Common Issues & Solutions

### Issue: Port 8080 already in use

**Solution**: Stop other applications or change port in `application.properties`:
```properties
server.port=8081
```

Also update frontend API URL in `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8081/api';
```

### Issue: Database connection error

**Solution**: 
1. Check MySQL/MariaDB is running:
   ```bash
   sudo systemctl status mysql
   # or
   sudo systemctl status mariadb
   ```

2. Start if not running:
   ```bash
   sudo systemctl start mysql
   ```

### Issue: Maven build fails

**Solution**: 
1. Check Java version:
   ```bash
   java -version
   ```
   Should show version 25.x.x

2. Clean and rebuild:
   ```bash
   mvn clean install -U
   ```

### Issue: Frontend shows connection error

**Solution**:
1. Ensure backend is running first
2. Check browser console for errors
3. Verify API URL in `frontend/src/services/api.js`

## 📱 Testing the Application

### API Testing with curl

```bash
# Get all products
curl http://localhost:8080/api/products

# Create a product
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "category": "Electronics",
    "price": 299.99,
    "stockQuantity": 15
  }'

# Get low stock products
curl http://localhost:8080/api/products/low-stock
```

## 🎨 Features to Try

1. **Dashboard**
   - View statistics
   - See recent products
   - Monitor alerts

2. **Product Management**
   - Create products
   - Edit products
   - Delete products
   - Search products
   - Filter by category

3. **Low Stock Management**
   - View low stock products
   - Quick stock update
   - Edit product details

## 📊 Sample Data

Want to populate with sample data? Run these SQL commands:

```sql
USE shopsphere;

INSERT INTO products (name, category, price, stock_quantity, description, sku, warehouse_location, is_active, created_at, updated_at)
VALUES 
('Laptop Pro 15"', 'Electronics', 1299.99, 8, 'High-performance laptop', 'LAP-001', 'Warehouse A-1', true, NOW(), NOW()),
('Wireless Mouse', 'Electronics', 29.99, 50, 'Ergonomic wireless mouse', 'MOU-001', 'Warehouse A-2', true, NOW(), NOW()),
('Office Chair', 'Furniture', 249.99, 5, 'Comfortable office chair', 'CHR-001', 'Warehouse B-1', true, NOW(), NOW()),
('USB-C Cable', 'Accessories', 19.99, 100, '2m USB-C charging cable', 'CBL-001', 'Warehouse A-3', true, NOW(), NOW()),
('Desk Lamp', 'Furniture', 39.99, 3, 'LED desk lamp', 'LMP-001', 'Warehouse B-2', true, NOW(), NOW());
```

## 🔐 Default Configuration

- Backend Port: 8080
- Frontend Port: 3000
- Database: shopsphere
- Low Stock Threshold: 10
- CORS: Enabled for localhost:3000

## 📞 Need Help?

If you encounter issues:
1. Check the terminal logs for errors
2. Verify all prerequisites are installed
3. Ensure ports 3000 and 8080 are available
4. Check MySQL/MariaDB is running
5. Review the main README.md for detailed documentation

## 🎓 Next Steps

After successful setup:
1. Explore the Dashboard
2. Add more products
3. Test search and filters
4. Try the low stock alerts
5. Customize the low stock threshold

---

**Happy coding!** 🚀
