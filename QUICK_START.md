# 🚀 ShopSphere - Quick Start Guide

## ✅ Current System Status

Based on your system check:
- ✅ **Java JDK 25**: INSTALLED (openjdk 25.0.1)
- ✅ **Node.js**: INSTALLED (v25.0.0)
- ❌ **Maven**: NOT INSTALLED - **Need to install**
- ❌ **MariaDB**: NOT INSTALLED - **Need to install**

---

## 📦 Install Missing Dependencies (2 commands)

### 1. Install Maven
```bash
sudo pacman -S maven
```

### 2. Install & Setup MariaDB
```bash
# Install
sudo pacman -S mariadb

# Initialize
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql

# Start service
sudo systemctl start mariadb

# Enable on boot
sudo systemctl enable mariadb

# Secure installation (set root password to: 7897613)
sudo mysql_secure_installation
```

**During secure installation:**
- Switch to unix_socket authentication? `N`
- Change root password? `Y` → Enter: `7897613`
- Remove anonymous users? `Y`
- Disallow root login remotely? `Y`
- Remove test database? `Y`
- Reload privilege tables? `Y`

---

## 🗄️ Create Database (3 SQL commands)

```bash
# Login to MariaDB
mysql -u root -p
# Password: 7897613
```

**Run these SQL commands:**
```sql
CREATE DATABASE shopsphere;
CREATE USER 'admin'@'localhost' IDENTIFIED BY '7897613';
GRANT ALL PRIVILEGES ON shopsphere.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🎯 Run the Project (3 steps)

### Step 1: Start Backend (Terminal 1)
```bash
cd /home/premcharan/Documents/shopsphere/backend
mvn clean install
mvn spring-boot:run
```

**Wait for:** `ShopSphere Backend is running on port 8080`

### Step 2: Start Frontend (Terminal 2 - NEW terminal)
```bash
cd /home/premcharan/Documents/shopsphere/frontend
npm install
npm run dev
```

**Wait for:** `Local: http://localhost:3000/`

### Step 3: Open Browser
```
http://localhost:3000
```

---

## 🎬 Complete Command Sequence (Copy & Paste)

```bash
# 1. Install Maven
sudo pacman -S maven

# 2. Install MariaDB
sudo pacman -S mariadb
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo mysql_secure_installation

# 3. Create database and user
mysql -u root -p7897613 <<EOF
CREATE DATABASE shopsphere;
CREATE USER 'admin'@'localhost' IDENTIFIED BY '7897613';
GRANT ALL PRIVILEGES ON shopsphere.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
EOF

# 4. Start Backend (in one terminal)
cd /home/premcharan/Documents/shopsphere/backend
mvn clean install && mvn spring-boot:run

# 5. Start Frontend (in another terminal)
cd /home/premcharan/Documents/shopsphere/frontend
npm install && npm run dev
```

---

## ⏱️ Time Estimates

- Maven installation: ~30 seconds
- MariaDB installation & setup: ~2 minutes
- Database creation: ~10 seconds
- Backend first build: ~3-5 minutes (downloads dependencies)
- Backend startup: ~15-30 seconds
- Frontend dependencies install: ~2 minutes (first time only)
- Frontend startup: ~5 seconds

**Total first-time setup: ~10 minutes**

---

## 🧪 Quick Test

### Test Backend
```bash
curl http://localhost:8080/api/products
```

**Expected response:**
```json
{"success":true,"message":"Products retrieved successfully","data":[]}
```

### Test Frontend
Open browser: `http://localhost:3000`
You should see the ShopSphere Dashboard!

---

## 🆘 Common Issues

### Issue: "Port 8080 already in use"
```bash
sudo lsof -i :8080
sudo kill -9 <PID>
```

### Issue: "Can't connect to database"
```bash
# Check MariaDB is running
sudo systemctl status mariadb

# Restart if needed
sudo systemctl restart mariadb
```

### Issue: "Maven command not found"
```bash
# Verify installation
which mvn

# If not found, install
sudo pacman -S maven
```

---

## 📝 Quick Reference

### Start Everything
```bash
# Terminal 1: Backend
cd ~/Documents/shopsphere/backend && mvn spring-boot:run

# Terminal 2: Frontend
cd ~/Documents/shopsphere/frontend && npm run dev
```

### Stop Everything
```bash
# Press Ctrl+C in both terminals
```

### Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/products
- **MariaDB**: localhost:3306

### Default Credentials
- **Database**: shopsphere
- **Username**: admin
- **Password**: 7897613

---

## ✅ Success Checklist

Before running the project, ensure:
- [ ] Maven installed: `mvn -version`
- [ ] MariaDB running: `sudo systemctl status mariadb`
- [ ] Database created: `mysql -u admin -p7897613 shopsphere`
- [ ] Backend builds: `cd backend && mvn clean install`
- [ ] Frontend installs: `cd frontend && npm install`

Then run:
- [ ] Backend: `mvn spring-boot:run` in backend folder
- [ ] Frontend: `npm run dev` in frontend folder
- [ ] Open: http://localhost:3000

---

## 🎉 You're All Set!

Once both servers are running, you can:
1. 📊 View Dashboard statistics
2. ➕ Add new products
3. ✏️ Edit products
4. 🗑️ Delete products
5. 🔍 Search and filter
6. ⚠️ Check low stock alerts

**Have fun building your inventory system!** 🚀
