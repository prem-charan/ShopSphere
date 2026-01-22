#!/bin/bash

# ShopSphere - Automated Setup Script for Arch Linux
# This script will install and configure everything needed

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║         ShopSphere - Arch Linux Setup                ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to print status
print_status() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please don't run this script as root (without sudo)"
    exit 1
fi

echo ""
print_status "Checking system requirements..."
echo ""

# Check Java
print_status "Checking Java JDK..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2)
    print_success "Java installed: $JAVA_VERSION"
else
    print_error "Java not found! Installing OpenJDK 21..."
    sudo pacman -S --noconfirm jdk21-openjdk
    print_success "Java installed"
fi

# Check Maven
print_status "Checking Maven..."
if command -v mvn &> /dev/null; then
    MVN_VERSION=$(mvn -version | head -1)
    print_success "Maven installed: $MVN_VERSION"
else
    print_warning "Maven not found. Installing..."
    sudo pacman -S --noconfirm maven
    print_success "Maven installed"
fi

# Check Node.js
print_status "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_warning "Node.js not found. Installing..."
    sudo pacman -S --noconfirm nodejs npm
    print_success "Node.js installed"
fi

# Check MariaDB
print_status "Checking MariaDB..."
if systemctl is-active --quiet mariadb 2>/dev/null; then
    print_success "MariaDB is running"
elif command -v mysql &> /dev/null; then
    print_warning "MariaDB installed but not running. Starting..."
    sudo systemctl start mariadb
    sudo systemctl enable mariadb
    print_success "MariaDB started"
else
    print_warning "MariaDB not found. Installing..."
    sudo pacman -S --noconfirm mariadb
    
    print_status "Initializing MariaDB..."
    sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
    
    print_status "Starting MariaDB..."
    sudo systemctl start mariadb
    sudo systemctl enable mariadb
    
    print_success "MariaDB installed and started"
    
    print_warning "Please run: sudo mysql_secure_installation"
    print_warning "Set root password to: 7897613"
fi

echo ""
print_status "Setting up database..."
echo ""

# Check if database exists
if mysql -u root -p7897613 -e "USE shopsphere;" 2>/dev/null; then
    print_success "Database 'shopsphere' already exists"
else
    print_status "Creating database and user..."
    
    # Try with password
    if mysql -u root -p7897613 <<EOF 2>/dev/null
CREATE DATABASE IF NOT EXISTS shopsphere;
CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED BY '7897613';
GRANT ALL PRIVILEGES ON shopsphere.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
EOF
    then
        print_success "Database and user created successfully"
    else
        # Try without password (fresh install)
        print_warning "Trying without password (fresh MariaDB install)..."
        if sudo mysql <<EOF 2>/dev/null
ALTER USER 'root'@'localhost' IDENTIFIED BY '7897613';
CREATE DATABASE IF NOT EXISTS shopsphere;
CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED BY '7897613';
GRANT ALL PRIVILEGES ON shopsphere.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
EOF
        then
            print_success "Database and user created successfully"
        else
            print_error "Failed to create database. Please run mysql_secure_installation first"
            print_warning "Then run this script again"
            exit 1
        fi
    fi
fi

echo ""
print_status "Building backend..."
echo ""

cd backend

print_status "Cleaning and installing Maven dependencies..."
if mvn clean install -DskipTests; then
    print_success "Backend built successfully"
else
    print_error "Backend build failed"
    exit 1
fi

echo ""
print_status "Installing frontend dependencies..."
echo ""

cd ../frontend

print_status "Running npm install..."
if npm install; then
    print_success "Frontend dependencies installed"
else
    print_error "Frontend installation failed"
    exit 1
fi

cd ..

echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║              Setup Complete! ✓                        ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}To start the application:${NC}"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend && mvn spring-boot:run"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""
echo "Then open: ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Database Credentials:${NC}"
echo "  Database: shopsphere"
echo "  Username: admin"
echo "  Password: 7897613"
echo ""
echo -e "${BLUE}Happy coding! 🚀${NC}"
echo ""
