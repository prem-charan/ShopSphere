# 🎯 START HERE - ShopSphere Setup for Arch Linux

## 📊 Your Current System Status

Based on system check:
- ✅ **Java JDK 25**: Already installed
- ✅ **Node.js v25**: Already installed
- ❌ **Maven**: Need to install
- ❌ **MariaDB**: Need to install

---

## 🚀 Choose Your Setup Method

### Option 1: Automated Setup (Recommended - 5 minutes)
```bash
cd /home/premcharan/Documents/shopsphere
./setup.sh
```

This script will:
- Install Maven
- Install and configure MariaDB
- Create database and user
- Build backend
- Install frontend dependencies

### Option 2: Manual Setup (10 minutes)
Follow: `QUICK_START.md`

### Option 3: Detailed Guide (For troubleshooting)
Follow: `ARCH_LINUX_SETUP.md`

---

## ⚡ Quick Start (After Setup)

### Terminal 1 - Backend
```bash
cd ~/Documents/shopsphere/backend
mvn spring-boot:run
```
**Wait for:** "ShopSphere Backend is running on port 8080"

### Terminal 2 - Frontend
```bash
cd ~/Documents/shopsphere/frontend
npm run dev
```
**Wait for:** "Local: http://localhost:3000/"

### Browser
```
http://localhost:3000
```

---

## 📝 What You Need to Install

### 1. Maven (30 seconds)
```bash
sudo pacman -S maven
```

### 2. MariaDB (2 minutes)
```bash
# Install
sudo pacman -S mariadb

# Initialize
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql

# Start
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Secure (set password: 7897613)
sudo mysql_secure_installation
```

### 3. Create Database (30 seconds)
```bash
mysql -u root -p7897613
```
```sql
CREATE DATABASE shopsphere;
CREATE USER 'admin'@'localhost' IDENTIFIED BY '7897613';
GRANT ALL PRIVILEGES ON shopsphere.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🎬 Complete Command Sequence

Copy and paste this entire block:

```bash
# Install Maven
sudo pacman -S maven

# Install and setup MariaDB
sudo pacman -S mariadb
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
sudo systemctl start mariadb
sudo systemctl enable mariadb

echo "Running mysql_secure_installation..."
echo "Please set root password to: 7897613"
sudo mysql_secure_installation

# Create database
mysql -u root -p7897613 <<EOF
CREATE DATABASE shopsphere;
CREATE USER 'admin'@'localhost' IDENTIFIED BY '7897613';
GRANT ALL PRIVILEGES ON shopsphere.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "Setup complete! Now start the servers..."
```

---

## 🎯 Final Steps

### 1. Build & Start Backend
```bash
cd ~/Documents/shopsphere/backend
mvn clean install
mvn spring-boot:run
```

### 2. Install & Start Frontend (New Terminal)
```bash
cd ~/Documents/shopsphere/frontend
npm install
npm run dev
```

### 3. Open Application
```
http://localhost:3000
```

---

## ✅ Verify Everything Works

### Test Backend API
```bash
curl http://localhost:8080/api/products
```

**Expected:**
```json
{"success":true,"message":"Products retrieved successfully","data":[]}
```

### Test Frontend
Open browser to `http://localhost:3000` and you should see the Dashboard!

---

## 📚 Documentation Files

- **START_HERE.md** ← You are here
- **QUICK_START.md** - Fast setup guide
- **ARCH_LINUX_SETUP.md** - Complete detailed guide
- **TAILWIND_MIGRATION.md** - Frontend Tailwind CSS info
- **README.md** - Full project documentation
- **setup.sh** - Automated setup script

---

## 🆘 Quick Troubleshooting

### Maven not found
```bash
sudo pacman -S maven
```

### MariaDB not starting
```bash
sudo systemctl start mariadb
sudo systemctl status mariadb
```

### Port 8080 in use
```bash
sudo lsof -i :8080
sudo kill -9 <PID>
```

### Can't connect to database
```bash
# Check if MariaDB is running
sudo systemctl status mariadb

# Test connection
mysql -u admin -p7897613 shopsphere
```

---

## 🎉 Once Running

You can:
1. 📊 View Dashboard with statistics
2. ➕ Add new products
3. ✏️ Edit existing products
4. 🗑️ Delete products
5. 🔍 Search and filter products
6. ⚠️ Monitor low stock alerts
7. 📦 Manage inventory across locations

---

## ⏱️ Time Estimates

First-time setup:
- Maven installation: 30 seconds
- MariaDB setup: 2 minutes
- Database creation: 30 seconds
- Backend build: 3-5 minutes
- Frontend install: 2 minutes
- **Total: ~10 minutes**

Subsequent runs:
- Backend start: 15-30 seconds
- Frontend start: 5 seconds
- **Total: ~30 seconds**

---

## 🔑 Default Credentials

- **Database Name**: shopsphere
- **Database User**: admin
- **Database Password**: 7897613
- **Backend URL**: http://localhost:8080
- **Frontend URL**: http://localhost:3000

---

## 📞 Need Help?

1. Check `ARCH_LINUX_SETUP.md` for detailed troubleshooting
2. Check terminal logs for error messages
3. Verify all services are running:
   ```bash
   # Check MariaDB
   sudo systemctl status mariadb
   
   # Check if ports are available
   sudo ss -tulpn | grep -E ':(8080|3000|3306)'
   ```

---

## 🚀 Ready to Start!

Run the automated setup:
```bash
./setup.sh
```

Or follow the manual steps above.

**Happy coding!** 🎉
