# ShopSphere - Complete Setup Guide for Arch Linux

## 📋 Prerequisites Installation

### Step 1: Update System
```bash
sudo pacman -Syu
```

### Step 2: Install JDK 25 (Oracle or OpenJDK)

#### Option A: Install OpenJDK 25 (Recommended)
```bash
# Install from AUR (yay is an AUR helper)
yay -S jdk25-openjdk

# Or if you have paru
paru -S jdk25-openjdk
```

#### Option B: If JDK 25 is not available, use JDK 21 (LTS)
```bash
# Install OpenJDK 21 (Long Term Support)
sudo pacman -S jdk21-openjdk

# Set as default Java
sudo archlinux-java set java-21-openjdk
```

**Note**: If JDK 25 is not available in AUR, JDK 21 will work fine. Update `pom.xml` to use Java 21 instead.

#### Verify Java Installation
```bash
java -version
# Should show: openjdk version "25" or "21"
```

### Step 3: Install Maven
```bash
sudo pacman -S maven
```

#### Verify Maven Installation
```bash
mvn -version
```

### Step 4: Install Node.js and npm
```bash
# Install latest LTS version
sudo pacman -S nodejs npm

# Verify installation
node -v
npm -v
```

### Step 5: Install MariaDB (MySQL-compatible)
```bash
# Install MariaDB
sudo pacman -S mariadb

# Initialize MariaDB data directory
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql

# Start MariaDB service
sudo systemctl start mariadb

# Enable MariaDB to start on boot
sudo systemctl enable mariadb

# Secure MariaDB installation (IMPORTANT!)
sudo mysql_secure_installation
```

**During `mysql_secure_installation`:**
- Enter root password: `7897613` (or your preferred password)
- Remove anonymous users: `Y`
- Disallow root login remotely: `Y`
- Remove test database: `Y`
- Reload privilege tables: `Y`

### Step 6: Install Git (if not installed)
```bash
sudo pacman -S git
```

---

## 🗄️ Database Setup

### 1. Login to MariaDB
```bash
mysql -u root -p
# Enter password: 7897613
```

### 2. Create Database and User
```sql
-- Create database
CREATE DATABASE shopsphere;

-- Create user with password (matching your application.properties)
CREATE USER 'admin'@'localhost' IDENTIFIED BY '7897613';

-- Grant all privileges
GRANT ALL PRIVILEGES ON shopsphere.* TO 'admin'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify database was created
SHOW DATABASES;

-- Exit
EXIT;
```

### 3. Verify Database Connection
```bash
mysql -u admin -p7897613 shopsphere
# If you can login, it's working!
```

---

## 🔧 Backend Setup (Spring Boot)

### 1. Navigate to Backend Directory
```bash
cd /home/premcharan/Documents/shopsphere/backend
```

### 2. Verify Database Credentials
Check that `src/main/resources/application.properties` has correct credentials:
```properties
spring.datasource.username=admin
spring.datasource.password=7897613
```

### 3. Build the Project
```bash
# Clean and build
mvn clean install

# If build fails, skip tests
mvn clean install -DskipTests
```

### 4. Run the Backend
```bash
mvn spring-boot:run
```

**Expected Output:**
```
ShopSphere Backend is running on port 8080
```

**Backend will be accessible at:** `http://localhost:8080`

### Verify Backend is Running
Open another terminal and test:
```bash
curl http://localhost:8080/api/products
```

**Keep this terminal running!**

---

## 🎨 Frontend Setup (React + Vite + Tailwind)

### 1. Open NEW Terminal
```bash
# Navigate to frontend directory
cd /home/premcharan/Documents/shopsphere/frontend
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- React
- React Router
- Axios
- Tailwind CSS
- React Icons
- Vite
- All other dependencies

### 3. Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
VITE v5.4.10  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Frontend will be accessible at:** `http://localhost:3000`

### 4. Open in Browser
```bash
# If you have xdg-open
xdg-open http://localhost:3000

# Or just open your browser and go to:
# http://localhost:3000
```

---

## 🚀 Quick Start Script (Run Everything)

Create a helper script to start everything:

```bash
# Create script file
cd /home/premcharan/Documents/shopsphere
nano start-shopsphere.sh
```

**Add this content:**

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   ShopSphere Startup Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if MariaDB is running
echo -e "${YELLOW}1. Checking MariaDB...${NC}"
if ! systemctl is-active --quiet mariadb; then
    echo "Starting MariaDB..."
    sudo systemctl start mariadb
else
    echo -e "${GREEN}✓ MariaDB is running${NC}"
fi

# Check if database exists
echo -e "\n${YELLOW}2. Checking database...${NC}"
if mysql -u admin -p7897613 -e "USE shopsphere;" 2>/dev/null; then
    echo -e "${GREEN}✓ Database 'shopsphere' exists${NC}"
else
    echo "Creating database..."
    mysql -u root -p7897613 -e "CREATE DATABASE IF NOT EXISTS shopsphere;"
    echo -e "${GREEN}✓ Database created${NC}"
fi

# Start backend in background
echo -e "\n${YELLOW}3. Starting Backend (Spring Boot)...${NC}"
cd backend
mvn spring-boot:run > backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo "   Logs: backend/backend.log"
echo "   URL: http://localhost:8080"

# Wait for backend to start
echo "   Waiting for backend to initialize..."
sleep 15

# Start frontend in background
echo -e "\n${YELLOW}4. Starting Frontend (React + Vite)...${NC}"
cd ../frontend
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo "   Logs: frontend/frontend.log"
echo "   URL: http://localhost:3000"

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✓ ShopSphere is running!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo ""
echo "To stop:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Or use: ./stop-shopsphere.sh"
echo ""

# Save PIDs for stop script
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid
```

**Make it executable:**
```bash
chmod +x start-shopsphere.sh
```

**Create stop script:**
```bash
nano stop-shopsphere.sh
```

**Add this content:**
```bash
#!/bin/bash

echo "Stopping ShopSphere..."

if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    kill $BACKEND_PID 2>/dev/null
    echo "✓ Backend stopped"
    rm .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    kill $FRONTEND_PID 2>/dev/null
    echo "✓ Frontend stopped"
    rm .frontend.pid
fi

echo "ShopSphere stopped!"
```

**Make it executable:**
```bash
chmod +x stop-shopsphere.sh
```

---

## 📝 Step-by-Step Manual Start

### Terminal 1: Backend
```bash
cd /home/premcharan/Documents/shopsphere/backend
mvn spring-boot:run
```

### Terminal 2: Frontend
```bash
cd /home/premcharan/Documents/shopsphere/frontend
npm run dev
```

### Browser
```
http://localhost:3000
```

---

## 🐛 Troubleshooting

### Issue 1: JDK 25 Not Available

**Solution**: Use JDK 21 instead

```bash
# Install JDK 21
sudo pacman -S jdk21-openjdk

# Set as default
sudo archlinux-java set java-21-openjdk

# Update pom.xml
cd /home/premcharan/Documents/shopsphere/backend
```

Edit `pom.xml` and change:
```xml
<java.version>21</java.version>
<maven.compiler.source>21</maven.compiler.source>
<maven.compiler.target>21</maven.compiler.target>
```

Remove or comment out the `--enable-preview` flag:
```xml
<!-- <arg>--enable-preview</arg> -->
```

### Issue 2: MariaDB Won't Start

```bash
# Check status
sudo systemctl status mariadb

# View logs
sudo journalctl -u mariadb -f

# Restart
sudo systemctl restart mariadb

# If database is corrupted, reinitialize
sudo rm -rf /var/lib/mysql
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
sudo systemctl start mariadb
```

### Issue 3: Port 8080 Already in Use

```bash
# Find process using port 8080
sudo lsof -i :8080

# Kill the process
sudo kill -9 <PID>

# Or use a different port in application.properties
server.port=8081
```

### Issue 4: Port 3000 Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Or Vite will automatically use next available port (5173)
```

### Issue 5: npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue 6: Maven build fails

```bash
# Update Maven
sudo pacman -S maven

# Clear Maven cache
rm -rf ~/.m2/repository

# Rebuild
mvn clean install -U
```

### Issue 7: Can't connect to database

```bash
# Test connection
mysql -u admin -p7897613 shopsphere

# Check MariaDB is running
sudo systemctl status mariadb

# Check credentials in application.properties
cat backend/src/main/resources/application.properties

# Recreate user
mysql -u root -p
DROP USER 'admin'@'localhost';
CREATE USER 'admin'@'localhost' IDENTIFIED BY '7897613';
GRANT ALL PRIVILEGES ON shopsphere.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
```

### Issue 8: Backend compiles but crashes immediately

Check logs for:
- Database connection errors
- Port conflicts
- Java version mismatches

```bash
# View full logs
cd backend
mvn spring-boot:run 2>&1 | tee backend.log
```

---

## 🧪 Testing the Application

### 1. Backend Health Check
```bash
curl http://localhost:8080/api/products
# Should return: {"success":true,"message":"Products retrieved successfully","data":[]}
```

### 2. Create a Test Product
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Laptop",
    "category": "Electronics",
    "price": 999.99,
    "stockQuantity": 5,
    "description": "A test product"
  }'
```

### 3. Get All Products
```bash
curl http://localhost:8080/api/products
```

### 4. Frontend Testing
1. Open `http://localhost:3000`
2. Check Dashboard loads
3. Go to Products page
4. Click "Add Product"
5. Create a product
6. Check Low Stock Alerts

---

## 📊 System Requirements

- **OS**: Arch Linux (up to date)
- **Java**: JDK 21 or 25
- **Maven**: 3.6+
- **Node.js**: 18+
- **npm**: 9+
- **MariaDB**: 10.6+
- **RAM**: 4GB minimum (8GB recommended)
- **Disk**: 2GB free space

---

## 🔒 Security Notes

### Production Deployment

1. **Change Database Password**
```sql
ALTER USER 'admin'@'localhost' IDENTIFIED BY 'strong_password_here';
```

2. **Update application.properties**
```properties
spring.datasource.password=strong_password_here
```

3. **Enable Firewall**
```bash
sudo pacman -S ufw
sudo ufw enable
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
```

4. **Use Environment Variables**
Instead of hardcoding passwords, use environment variables.

---

## 📚 Useful Commands

### MariaDB
```bash
# Start
sudo systemctl start mariadb

# Stop
sudo systemctl stop mariadb

# Restart
sudo systemctl restart mariadb

# Status
sudo systemctl status mariadb

# Login
mysql -u admin -p7897613 shopsphere
```

### Backend
```bash
# Build
mvn clean install

# Run
mvn spring-boot:run

# Build JAR
mvn clean package

# Run JAR
java -jar target/shopsphere-backend-1.0.0.jar
```

### Frontend
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎉 Success Checklist

- [ ] JDK installed and verified (`java -version`)
- [ ] Maven installed (`mvn -version`)
- [ ] Node.js and npm installed (`node -v`, `npm -v`)
- [ ] MariaDB installed and running (`sudo systemctl status mariadb`)
- [ ] Database `shopsphere` created
- [ ] User `admin` created with correct password
- [ ] Backend dependencies installed (`mvn clean install`)
- [ ] Backend running on port 8080
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend running on port 3000
- [ ] Can access `http://localhost:3000` in browser
- [ ] Can create/view products

---

## 🆘 Getting Help

If you encounter issues:

1. Check logs:
   - Backend: Console output or `backend.log`
   - Frontend: Console output or `frontend.log`
   - MariaDB: `sudo journalctl -u mariadb -f`

2. Check ports:
   ```bash
   sudo ss -tulpn | grep -E ':(8080|3000|3306)'
   ```

3. Check Java version:
   ```bash
   java -version
   javac -version
   ```

4. Verify database:
   ```bash
   mysql -u admin -p7897613 -e "SHOW DATABASES;"
   ```

---

**Ready to go!** 🚀

Start with: `./start-shopsphere.sh`

Or manually:
1. Terminal 1: `cd backend && mvn spring-boot:run`
2. Terminal 2: `cd frontend && npm run dev`
3. Browser: `http://localhost:3000`
