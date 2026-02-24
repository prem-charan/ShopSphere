# 🛍️ ShopSphere - Omnichannel Retail Management System

A comprehensive, full-stack e-commerce and retail management platform that seamlessly integrates online and in-store shopping experiences with advanced inventory management, loyalty programs, and analytics.

## 📋 Table of Contents

- [🌟 Features Overview](#-features-overview)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Technology Stack](#️-technology-stack)
- [📦 Installation & Setup](#-installation--setup)
- [🚀 Quick Start](#-quick-start)
- [👥 User Roles & Access](#-user-roles--access)
- [📱 Features Deep Dive](#-features-deep-dive)
- [🔧 Configuration](#-configuration)
- [📊 Database Schema](#-database-schema)
- [🔐 Security Features](#-security-features)
- [🧪 Testing](#-testing)
- [📈 Performance & Optimization](#-performance--optimization)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🌟 Features Overview

### 🛒 Customer Features
- **Product Browsing**: Search, filter, and browse products by category
- **Shopping Cart**: Add/remove items, quantity management, persistent cart
- **Order Management**: Place orders, track status, view order history
- **Dual Order Types**: Online delivery and in-store pickup
- **Payment Processing**: Multiple payment methods (UPI, Cash on Delivery)
- **Loyalty Program**: Earn points, redeem rewards, discount coupons
- **Campaign Discounts**: Automatic and manual coupon application
- **User Profile**: Personal information management, order tracking
- **Invoice Generation**: Download order invoices

### 🏪 Admin Features
- **Dashboard**: Comprehensive analytics and overview
- **Product Management**: CRUD operations, inventory tracking
- **Order Management**: View, update status, manage all orders
- **Campaign Management**: Create and manage promotional campaigns
- **Store Inventory**: Multi-location inventory management
- **Low Stock Alerts**: Automated notifications for inventory
- **Customer Management**: View customer details and loyalty data
- **Sales Analytics**: Detailed reports and insights
- **User Management**: Admin account creation and management

### 🔧 Technical Features
- **Omnichannel Support**: Seamless online and in-store integration
- **Real-time Inventory**: Live stock tracking across stores
- **Secure Authentication**: JWT-based auth with role-based access
- **Responsive Design**: Mobile-first, modern UI/UX
- **RESTful APIs**: Comprehensive backend services
- **Data Validation**: Input validation and error handling
- **CORS Support**: Cross-origin resource sharing configured

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React)       │◄──►│  (Spring Boot)  │◄──►│   (MySQL)       │
│                 │    │                 │    │                 │
│ • User Interface│    │ • REST APIs     │    │ • Products      │
│ • State Mgmt    │    │ • Business Logic│    │ • Orders        │
│ • Routing       │    │ • Security      │    │ • Users         │
│ • API Calls     │    │ • Validation    │    │ • Loyalty Data  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Structure
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   ├── ProductList.jsx
│   ├── MyOrders.jsx
│   ├── PaymentModal.jsx
│   └── ...
├── pages/              # Page components
│   ├── Home.jsx
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Login.jsx
│   └── ...
├── context/            # React Context
│   └── AuthContext.jsx
├── services/           # API service layer
│   ├── axiosInstance.js
│   ├── authAPI.js
│   ├── productAPI.js
│   └── ...
└── utils/              # Utility functions
```

### Backend Structure
```
src/main/java/com/shopsphere/
├── controller/         # REST controllers
├── service/           # Business logic
├── repository/         # Data access layer
├── entity/            # JPA entities
├── dto/               # Data transfer objects
├── config/            # Configuration classes
└── validation/        # Custom validators
```

---

## 🛠️ Technology Stack

### Frontend Technologies
- **React 18.3.1** - Modern UI framework with hooks
- **React Router 6.22.0** - Client-side routing
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Axios 1.6.7** - HTTP client for API calls
- **React Icons 5.0.1** - Icon library
- **React Slick 0.31.0** - Carousel component
- **Vite 5.4.10** - Build tool and dev server

### Backend Technologies
- **Spring Boot 3.3.0** - Java application framework
- **Java 21** - Latest Java LTS version
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database abstraction layer
- **Hibernate** - ORM implementation
- **MySQL** - Relational database
- **Maven** - Build and dependency management
- **JWT** - JSON Web Tokens for authentication
- **Lombok** - Code generation library

### Development Tools
- **ESLint** - JavaScript linting
- **PostCSS** - CSS processing
- **Spring Boot DevTools** - Hot reload for development
- **Hibernate Debug Mode** - SQL logging

---

## 📦 Installation & Setup

### Prerequisites
- **Java 21** or higher
- **Node.js 18** or higher
- **MySQL 8.0** or higher
- **Maven 3.8** or higher

### Database Setup
1. **Install MySQL** on your system
2. **Create database**:
   ```sql
   CREATE DATABASE shopsphere_db;
   ```
3. **Create user** (optional):
   ```sql
   CREATE USER 'admin'@'localhost' IDENTIFIED BY '7897613';
   GRANT ALL PRIVILEGES ON shopsphere_db.* TO 'admin'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Backend Setup
1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```
2. **Update database credentials** in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/shopsphere_db
   spring.datasource.username=admin
   spring.datasource.password=your_password
   ```
3. **Install dependencies and run**:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
4. **Backend will start** at `http://localhost:8081`

### Frontend Setup
1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start development server**:
   ```bash
   npm run dev
   ```
4. **Frontend will start** at `http://localhost:5173`

---

## 🚀 Quick Start

### 1. Admin Setup
1. **Access admin panel**: `http://localhost:5173/admin`
2. **Create admin account**:
   - Click "Sign Up" 
   - Use admin registration with secret key
3. **Add products** to inventory
4. **Create campaigns** for promotions

### 2. Customer Experience
1. **Register/Login** at `http://localhost:5173`
2. **Browse products** on homepage
3. **Add items to cart**
4. **Apply discount codes** (if available)
5. **Complete purchase** with preferred payment method
6. **Track orders** in "My Orders"

### 3. Store Operations
1. **Monitor inventory** levels
2. **Receive low stock alerts**
3. **Process orders** and update status
4. **View analytics** and sales reports

---

## 👥 User Roles & Access

### 👤 Customer Role
- **Browse products** and view details
- **Add to cart** and manage items
- **Place orders** (online/in-store)
- **Track order status**
- **Earn loyalty points**
- **Redeem rewards and discounts**
- **Manage profile**

### 👨‍💼 Admin Role
- **Full system access**
- **Product management** (CRUD)
- **Order management** (view/update)
- **Campaign creation** and management
- **Inventory tracking** across stores
- **Customer data** access
- **Analytics and reports**
- **User management**

### 🔐 Authentication Flow
1. **JWT-based authentication**
2. **Role-based access control**
3. **Protected routes** with guards
4. **Token refresh** mechanism
5. **Secure API endpoints**

---

## 📱 Features Deep Dive

### 🛍️ Product Management
- **Product Catalog**: Comprehensive product information
- **Category Filtering**: Browse by product categories
- **Search Functionality**: Find products quickly
- **Stock Tracking**: Real-time inventory levels
- **Multi-store Support**: Different stock per location
- **Product Images**: Visual product representation
- **Pricing Management**: Dynamic pricing with campaigns

### 🛒 Shopping Cart System
- **Persistent Cart**: Items saved across sessions
- **Quantity Management**: Add/remove/update quantities
- **Price Calculation**: Real-time total with discounts
- **Discount Integration**: Auto-apply available coupons
- **Stock Validation**: Prevent over-ordering
- **Mobile Responsive**: Works on all devices

### 📦 Order Management
- **Dual Order Types**: 
  - **Online Orders**: Home delivery
  - **In-Store Orders**: Store pickup
- **Order Status Tracking**: 
  - PLACED → CONFIRMED → SHIPPED → DELIVERED
  - CANCELLED (when applicable)
- **Payment Integration**: Multiple payment methods
- **Order History**: Complete order records
- **Invoice Generation**: Downloadable PDF invoices
- **Shipping Address Management**: Save multiple addresses

### 💳 Payment Processing
- **Multiple Payment Methods**:
  - **UPI Payment**: Digital wallet integration
  - **Cash on Delivery**: Pay on receipt
- **Secure Payment Flow**: OTP verification for UPI
- **Payment Status Tracking**: PENDING → COMPLETED → FAILED
- **Refund Support**: Handle order cancellations
- **Payment History**: Complete transaction records

### 🎁 Loyalty Program
- **Points System**: Earn points on purchases
- **Reward Redemption**: Convert points to discounts
- **Tier-based Benefits**: Different reward levels
- **Coupon Management**: Generate and distribute coupons
- **Auto-apply Discounts**: Seamless coupon application
- **Loyalty Analytics**: Track program effectiveness
- **Customer Engagement**: Increase repeat purchases

### 📊 Campaign Management
- **Promotional Campaigns**: Create marketing campaigns
- **Discount Rules**: Percentage or fixed amount discounts
- **Product Targeting**: Apply to specific products
- **Campaign Scheduling**: Date-based campaign periods
- **Performance Tracking**: Monitor campaign success
- **Banner Management**: Visual campaign representation
- **Multi-product Support**: Bulk discount application

### 📈 Analytics & Reporting
- **Sales Analytics**: Comprehensive sales data
- **Product Performance**: Best-selling products
- **Customer Insights**: Purchase behavior analysis
- **Inventory Reports**: Stock movement tracking
- **Revenue Tracking**: Financial performance metrics
- **Campaign Analytics**: Marketing effectiveness
- **Dashboard Visualization**: Interactive charts and graphs

### 🏪 Store Inventory Management
- **Multi-location Support**: Manage multiple stores
- **Real-time Stock Tracking**: Live inventory updates
- **Low Stock Alerts**: Automated notifications
- **Stock Transfers**: Move inventory between stores
- **Store-specific Products**: Different products per location
- **Inventory Reports**: Detailed stock analysis
- **Bulk Operations**: Mass update capabilities

---

## 🔧 Configuration

### Backend Configuration
```properties
# Server Configuration
server.port=8081
spring.application.name=shopsphere-backend

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/shopsphere_db
spring.datasource.username=admin
spring.datasource.password=your_password

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:3000,http://localhost:5173
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*

# Logging Configuration
logging.level.com.shopsphere=DEBUG
logging.level.org.hibernate.SQL=DEBUG

# Business Configuration
shopsphere.inventory.low-stock-threshold=10
```

### Frontend Configuration
```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:8081/api';

// Axios Instance Configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});
```

---

## 📊 Database Schema

### Core Entities

#### 📦 Product
```sql
CREATE TABLE products (
  product_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  category VARCHAR(100),
  stock_quantity INT DEFAULT 0,
  image_url VARCHAR(500),
  store_location VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 🛒 Order
```sql
CREATE TABLE orders (
  order_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  order_type ENUM('ONLINE', 'IN_STORE') NOT NULL,
  status ENUM('PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  discount_code VARCHAR(50),
  discount_amount DECIMAL(10,2),
  shipping_address VARCHAR(500),
  store_location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 👤 User
```sql
CREATE TABLE users (
  user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role ENUM('CUSTOMER', 'ADMIN') DEFAULT 'CUSTOMER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 🎁 Loyalty Account
```sql
CREATE TABLE loyalty_accounts (
  loyalty_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNIQUE NOT NULL,
  total_points INT DEFAULT 0,
  available_points INT DEFAULT 0,
  tier ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM') DEFAULT 'BRONZE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

---

## 🔐 Security Features

### Authentication & Authorization
- **JWT Token-based Authentication**: Secure token generation and validation
- **Role-based Access Control**: Different permissions for customers and admins
- **Password Encryption**: BCrypt hashing for secure password storage
- **Input Validation**: Comprehensive validation using Bean Validation
- **SQL Injection Prevention**: Parameterized queries and JPA protection
- **CORS Configuration**: Controlled cross-origin access
- **Session Management**: Secure token handling and refresh

### API Security
- **Protected Endpoints**: Role-based route protection
- **Request Validation**: Input sanitization and validation
- **Error Handling**: Secure error responses without information leakage
- **Rate Limiting**: Prevent abuse and brute force attacks
- **HTTPS Support**: Secure communication channels

### Data Protection
- **Sensitive Data Encryption**: Passwords and personal information
- **Audit Logging**: Track user actions and system changes
- **Data Privacy**: GDPR-compliant data handling
- **Secure Headers**: Security headers for web applications

---

## 🧪 Testing

### Backend Testing
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=AuthServiceTest

# Generate test coverage report
mvn jacoco:report
```

### Frontend Testing
```bash
# Run ESLint
npm run lint

# Run tests (when implemented)
npm test

# Build for production
npm run build
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Add to cart functionality
- [ ] Order placement and tracking
- [ ] Payment processing
- [ ] Loyalty program features
- [ ] Admin dashboard functionality
- [ ] Campaign management
- [ ] Inventory management
- [ ] Analytics and reporting

---

## 📈 Performance & Optimization

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Compressed product images
- **Caching Strategy**: Browser caching for static assets
- **Bundle Size Optimization**: Tree shaking and minification
- **React Performance**: Memoization and optimization hooks

### Backend Optimizations
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Caching Layer**: Redis integration for frequently accessed data
- **Query Optimization**: Efficient JPA queries
- **Lazy Loading**: Optimized entity relationships

### Database Performance
- **Index Strategy**: Proper indexing on frequently queried columns
- **Query Optimization**: Efficient SQL queries
- **Connection Management**: Optimal connection pool configuration
- **Data Archiving**: Archive old order data periodically

---

## 🤝 Contributing

### Development Guidelines
1. **Follow Code Standards**: Consistent formatting and naming
2. **Write Tests**: Unit tests for new features
3. **Document Changes**: Update documentation
4. **Git Workflow**: Feature branches and pull requests
5. **Code Review**: Peer review for all changes

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create pull request
git push origin feature/new-feature
```

### Code Style
- **Java**: Follow Google Java Style Guide
- **JavaScript**: ESLint configuration with React rules
- **CSS**: Tailwind CSS utility classes
- **Comments**: JSDoc for JavaScript, Javadoc for Java

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

### 🐛 Bug Reports
- Create an issue on GitHub with detailed description
- Include steps to reproduce
- Provide environment details

### 💡 Feature Requests
- Submit feature requests via GitHub issues
- Include use case and expected behavior
- Discuss implementation approach

### 📧 Contact Information
- **Project Maintainer**: ShopSphere Development Team
- **Email**: support@shopsphere.com
- **Documentation**: [Wiki](https://github.com/shopsphere/docs)

---

## 🎯 Future Roadmap

### Upcoming Features
- [ ] **Mobile App**: React Native mobile application
- [ ] **Advanced Analytics**: Machine learning insights
- [ ] **Multi-vendor Support**: Marketplace functionality
- [ ] **Advanced Search**: Elasticsearch integration
- [ ] **Real-time Notifications**: WebSocket implementation
- [ ] **Advanced Inventory**: RFID integration
- [ ] **Multi-currency Support**: International markets
- [ ] **Advanced Reporting**: Custom report builder
- [ ] **API Rate Limiting**: Advanced rate limiting
- [ ] **Microservices Architecture**: Service decomposition

### Performance Improvements
- [ ] **Caching Strategy**: Redis implementation
- [ ] **Database Optimization**: Advanced indexing
- [ ] **CDN Integration**: Content delivery network
- [ ] **Load Balancing**: Multiple server instances

### Security Enhancements
- [ ] **Two-Factor Authentication**: Enhanced security
- [ ] **Advanced Audit Logging**: Comprehensive tracking
- [ ] **API Security**: Advanced threat protection
- [ ] **Data Encryption**: End-to-end encryption

---

## 🙏 Acknowledgments

- **Spring Boot Team**: Excellent framework and documentation
- **React Team**: Amazing UI library and ecosystem
- **Tailwind CSS**: Beautiful utility-first CSS framework
- **MySQL Community**: Reliable database solution
- **Open Source Contributors**: All the amazing open source projects used

---

**Built with ❤️ by the ShopSphere Development Team**

*Last Updated: February 2026*
