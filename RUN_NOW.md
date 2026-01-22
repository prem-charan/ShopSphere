# 🚀 Run ShopSphere NOW!

## ✅ Your Setup is Ready!

Your system has:
- ✅ Java JDK 25
- ✅ Node.js v25
- ✅ MariaDB with `shopsphere_db` database
- ✅ User `admin` with password `7897613`
- ✅ Backend configured to use your database

---

## 🎯 Just Need 2 Things:

### 1. Install Maven (if not installed)
```bash
sudo pacman -S maven
```

### 2. Verify Database Connection (Optional)
```bash
./verify-db.sh
```

---

## 🚀 Start the Application (2 Terminals)

### Terminal 1: Start Backend
```bash
cd ~/Documents/shopsphere/backend
mvn clean install
mvn spring-boot:run
```

**Wait for this message:**
```
ShopSphere Backend is running on port 8080
```

### Terminal 2: Start Frontend
```bash
cd ~/Documents/shopsphere/frontend
npm install
npm run dev
```

**Wait for:**
```
Local: http://localhost:3000/
```

### Browser
Open: **http://localhost:3000**

---

## ⚡ Quick Start (One-liner for each terminal)

### Terminal 1 (Backend)
```bash
cd ~/Documents/shopsphere/backend && mvn clean install && mvn spring-boot:run
```

### Terminal 2 (Frontend)
```bash
cd ~/Documents/shopsphere/frontend && npm install && npm run dev
```

---

## 🧪 Test It's Working

### Test Backend API
```bash
curl http://localhost:8080/api/products
```

**Expected response:**
```json
{"success":true,"message":"Products retrieved successfully","data":[]}
```

### Test Frontend
Open browser: `http://localhost:3000`

You should see the **ShopSphere Dashboard**!

---

## 📊 Database Connection Details

The backend is now configured to use:
- **Database**: `shopsphere_db`
- **Host**: `localhost:3306`
- **Username**: `admin`
- **Password**: `7897613`

You can verify this in:
```
backend/src/main/resources/application.properties
```

---

## 🎯 What Happens on First Run?

When you start the backend for the first time:
1. ✅ Connects to your `shopsphere_db` database
2. ✅ Automatically creates the `products` table
3. ✅ Ready to accept API requests
4. ✅ Frontend can start adding products

---

## 🐛 Quick Troubleshooting

### Can't connect to database?
```bash
# Check MariaDB is running
sudo systemctl status mariadb

# Test connection manually
mysql -u admin -p7897613 shopsphere_db

# Grant permissions (if needed)
mysql -u root -p7897613
GRANT ALL PRIVILEGES ON shopsphere_db.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Port 8080 already in use?
```bash
sudo lsof -i :8080
sudo kill -9 <PID>
```

### Maven not found?
```bash
sudo pacman -S maven
mvn -version
```

---

## ⏱️ Time Estimates

First time:
- Backend build: 3-5 minutes (downloads dependencies)
- Backend startup: 15-30 seconds
- Frontend install: 2 minutes
- Frontend startup: 5 seconds

**Total: ~5-8 minutes**

Subsequent runs:
- Backend: 15-30 seconds
- Frontend: 5 seconds

---

## 🎉 You're All Set!

Once both servers are running:

1. 📊 **Dashboard** - View statistics and recent products
2. ➕ **Add Products** - Create new inventory items
3. ✏️ **Edit Products** - Update product details
4. 🔍 **Search & Filter** - Find products by name or category
5. ⚠️ **Low Stock Alerts** - Monitor inventory levels
6. 📦 **Manage Locations** - Track warehouse and store inventory

---

## 🎬 Start Now!

Open 2 terminals and run:

**Terminal 1:**
```bash
cd ~/Documents/shopsphere/backend && mvn spring-boot:run
```

**Terminal 2:**
```bash
cd ~/Documents/shopsphere/frontend && npm run dev
```

**Browser:**
```
http://localhost:3000
```

---

**That's it! Happy coding!** 🚀
