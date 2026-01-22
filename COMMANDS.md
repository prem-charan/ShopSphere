# 🎯 ShopSphere - Command Cheat Sheet

## 🚀 Starting the Project

### Automated (Recommended)
```bash
cd /home/premcharan/Documents/shopsphere
./setup.sh  # First time only
```

### Manual Start
```bash
# Terminal 1: Backend
cd ~/Documents/shopsphere/backend
mvn spring-boot:run

# Terminal 2: Frontend  
cd ~/Documents/shopsphere/frontend
npm run dev
```

---

## 📦 Installation Commands

### Maven
```bash
sudo pacman -S maven
mvn -version
```

### MariaDB
```bash
# Install
sudo pacman -S mariadb

# Initialize
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql

# Start/Stop/Restart
sudo systemctl start mariadb
sudo systemctl stop mariadb
sudo systemctl restart mariadb
sudo systemctl status mariadb

# Enable on boot
sudo systemctl enable mariadb

# Secure installation
sudo mysql_secure_installation
```

---

## 🗄️ Database Commands

### Access Database
```bash
# As root
mysql -u root -p7897613

# As admin user
mysql -u admin -p7897613 shopsphere
```

### Create Database & User
```sql
CREATE DATABASE shopsphere;
CREATE USER 'admin'@'localhost' IDENTIFIED BY '7897613';
GRANT ALL PRIVILEGES ON shopsphere.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
```

### View Database
```sql
SHOW DATABASES;
USE shopsphere;
SHOW TABLES;
SELECT * FROM products;
```

### Drop/Reset Database
```sql
DROP DATABASE shopsphere;
CREATE DATABASE shopsphere;
```

---

## 🔧 Backend Commands

### Build
```bash
cd backend

# Clean and build
mvn clean install

# Build without tests
mvn clean install -DskipTests

# Just compile
mvn compile
```

### Run
```bash
# Development mode
mvn spring-boot:run

# Run with profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Build JAR
mvn clean package

# Run JAR
java -jar target/shopsphere-backend-1.0.0.jar
```

### Test
```bash
# Run all tests
mvn test

# Run specific test
mvn test -Dtest=ProductServiceTest
```

### Clean
```bash
# Clean build files
mvn clean

# Clean Maven cache
rm -rf ~/.m2/repository
```

---

## 🎨 Frontend Commands

### Install
```bash
cd frontend

# Install dependencies
npm install

# Install specific package
npm install axios
npm install react-icons
```

### Run
```bash
# Development server
npm run dev

# Specific port
npm run dev -- --port 3001

# Build for production
npm run build

# Preview production build
npm run preview
```

### Clean
```bash
# Remove node_modules
rm -rf node_modules package-lock.json

# Clear cache
npm cache clean --force

# Reinstall
npm install
```

---

## 🐛 Troubleshooting Commands

### Check Java Version
```bash
java -version
javac -version
which java
```

### Check Ports
```bash
# Check if ports are in use
sudo ss -tulpn | grep 8080
sudo ss -tulpn | grep 3000
sudo ss -tulpn | grep 3306

# Kill process on port
sudo lsof -i :8080
sudo kill -9 <PID>
```

### Check Services
```bash
# MariaDB status
sudo systemctl status mariadb
sudo journalctl -u mariadb -f

# Check if backend is running
curl http://localhost:8080/api/products

# Check processes
ps aux | grep java
ps aux | grep node
```

### Check Logs
```bash
# Backend logs (if running in background)
tail -f backend/backend.log

# Frontend logs
tail -f frontend/frontend.log

# MariaDB logs
sudo journalctl -u mariadb -n 50
```

---

## 🧪 Testing API

### Get All Products
```bash
curl http://localhost:8080/api/products
```

### Create Product
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "category": "Electronics",
    "price": 999.99,
    "stockQuantity": 10,
    "description": "High-end laptop"
  }'
```

### Get Product by ID
```bash
curl http://localhost:8080/api/products/1
```

### Update Product
```bash
curl -X PUT http://localhost:8080/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Laptop",
    "category": "Electronics",
    "price": 899.99,
    "stockQuantity": 15
  }'
```

### Delete Product
```bash
curl -X DELETE http://localhost:8080/api/products/1
```

### Get Low Stock Products
```bash
curl http://localhost:8080/api/products/low-stock
```

### Search Products
```bash
curl "http://localhost:8080/api/products/search?name=laptop"
```

---

## 🔄 Git Commands (Optional)

### Initialize Repository
```bash
cd /home/premcharan/Documents/shopsphere
git init
git add .
git commit -m "Initial commit: ShopSphere Module 1"
```

### Create .gitignore
```bash
cat > .gitignore << EOF
*.pdf
*.log
.DS_Store
.vscode/
.idea/
*~
EOF
```

---

## 🧹 Cleanup Commands

### Stop All Services
```bash
# Stop backend (Ctrl+C in terminal or)
pkill -f spring-boot

# Stop frontend (Ctrl+C in terminal or)
pkill -f vite

# Stop MariaDB
sudo systemctl stop mariadb
```

### Clean Everything
```bash
# Backend
cd backend
mvn clean
rm -rf target/

# Frontend
cd ../frontend
rm -rf node_modules/ dist/ .vite/
npm cache clean --force

# Logs
rm -f *.log
```

---

## 📊 Useful Queries

### Database Size
```sql
SELECT 
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'shopsphere'
GROUP BY table_schema;
```

### Product Statistics
```sql
-- Count products
SELECT COUNT(*) as total FROM products;

-- Products by category
SELECT category, COUNT(*) as count FROM products GROUP BY category;

-- Low stock products
SELECT * FROM products WHERE stock_quantity <= 10;

-- Average price
SELECT AVG(price) as avg_price FROM products;
```

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Start Backend | `cd backend && mvn spring-boot:run` |
| Start Frontend | `cd frontend && npm run dev` |
| Check Backend | `curl localhost:8080/api/products` |
| Access Database | `mysql -u admin -p7897613 shopsphere` |
| Check MariaDB | `sudo systemctl status mariadb` |
| View Ports | `sudo ss -tulpn \| grep -E ':(8080\|3000\|3306)'` |
| Stop Backend | Ctrl+C or `pkill -f spring-boot` |
| Stop Frontend | Ctrl+C or `pkill -f vite` |

---

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/products
- **API Docs**: See README.md for all endpoints

---

## 🔑 Credentials

- **Database**: shopsphere
- **Username**: admin
- **Password**: 7897613
- **Root Password**: 7897613

---

## 📞 Help

For detailed troubleshooting, see:
- `ARCH_LINUX_SETUP.md`
- `README.md`

**Happy Coding!** 🚀
