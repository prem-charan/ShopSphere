# ShopSphere - Omnichannel Retail Inventory & Customer Engagement System

## Module 1: Product Catalog & Inventory Management

A comprehensive inventory management system built with Spring Boot (Java) and React.js, featuring real-time inventory tracking, low-stock alerts, and multi-location warehouse management.

## 🚀 Features

- **Product Catalog Management**: Create, read, update, and delete products
- **Inventory Tracking**: Monitor stock levels across warehouses and stores
- **Low Stock Alerts**: Automatic alerts for products running low on inventory
- **Search & Filter**: Search products by name and filter by category
- **Real-time Updates**: Instant stock quantity updates
- **Responsive UI**: Modern, mobile-friendly interface
- **RESTful API**: Well-documented REST endpoints

## 🛠️ Tech Stack

### Backend
- **Java**: JDK 25
- **Framework**: Spring Boot 3.3.0
- **Build Tool**: Maven
- **Database**: MySQL/MariaDB
- **ORM**: Spring Data JPA (Hibernate)

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Styling**: Tailwind CSS 3.4.1
- **Language**: JavaScript (JSX)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Java JDK 25
- Maven 3.6+
- Node.js 18+ and npm
- MySQL Server or MariaDB
- Git (optional)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
cd /home/premcharan/Documents/shopsphere
```

### 2. Database Setup

Create a MySQL/MariaDB database:

```sql
CREATE DATABASE shopsphere;
```

Update database credentials in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/shopsphere
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend server will start on `http://localhost:8080`

### 4. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## 📚 API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/{id}` | Get product by ID |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| GET | `/api/products/category/{category}` | Get products by category |
| GET | `/api/products/low-stock` | Get low stock products |
| GET | `/api/products/search?name={name}` | Search products by name |
| GET | `/api/products/categories` | Get all categories |
| PATCH | `/api/products/{id}/stock` | Update stock quantity |
| GET | `/api/products/low-stock/count` | Get low stock count |

## 📁 Project Structure

```
shopsphere/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/shopsphere/
│   │   │   │   ├── config/          # Configuration classes
│   │   │   │   ├── controller/      # REST controllers
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   ├── exception/       # Exception handlers
│   │   │   │   ├── repository/      # Data repositories
│   │   │   │   ├── service/         # Business logic
│   │   │   │   └── ShopSphereApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                    # Test files
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/              # React components (styled with Tailwind)
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   └── LowStockAlert.jsx
│   │   ├── services/                # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                # Tailwind directives
│   ├── tailwind.config.js           # Tailwind configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🎯 Usage

### Dashboard
- View overall statistics
- Monitor low stock alerts
- See recent products and categories

### Product Management
- Add new products with detailed information
- Edit existing products
- Delete products
- Search and filter products
- View product details

### Low Stock Alerts
- View products with low inventory
- Quick stock update
- Edit product details
- Automated alerts based on threshold

## ⚙️ Configuration

### Low Stock Threshold

Adjust the low stock threshold in `backend/src/main/resources/application.properties`:

```properties
shopsphere.inventory.low-stock-threshold=10
```

### CORS Configuration

CORS is configured for development. Update allowed origins in `CorsConfig.java` for production.

### Tailwind CSS Customization

Customize colors, spacing, and more in `frontend/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#2563eb',
      secondary: '#10b981',
    },
  },
}
```

## 🔒 Security

- Input validation on both frontend and backend
- Prepared statements to prevent SQL injection
- CORS configuration for API security
- Error handling with meaningful messages

## 🚦 Build for Production

### Backend

```bash
cd backend
mvn clean package
java -jar target/shopsphere-backend-1.0.0.jar
```

### Frontend

```bash
cd frontend
npm run build
```

The production build will be in the `frontend/dist` directory.

## 📝 Database Schema

### Product Table

| Column | Type | Description |
|--------|------|-------------|
| product_id | BIGINT | Primary key |
| name | VARCHAR(200) | Product name |
| category | VARCHAR(100) | Product category |
| price | DECIMAL(10,2) | Product price |
| stock_quantity | INT | Current stock |
| description | TEXT | Product description |
| sku | VARCHAR(50) | Stock keeping unit |
| warehouse_location | VARCHAR(100) | Warehouse location |
| store_location | VARCHAR(100) | Store location |
| image_url | VARCHAR(500) | Product image URL |
| is_active | BOOLEAN | Active status |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

## 🐛 Troubleshooting

### Backend won't start
- Check if Java JDK 25 is installed: `java -version`
- Verify MySQL/MariaDB is running
- Check database credentials in `application.properties`
- Ensure port 8080 is not in use

### Frontend won't start
- Check if Node.js is installed: `node -v`
- Delete `node_modules` and run `npm install` again
- Ensure port 3000 is not in use
- Check if backend is running

### Database connection error
- Verify MySQL/MariaDB service is running
- Check database exists: `SHOW DATABASES;`
- Verify credentials are correct
- Check firewall settings

## 📄 License

This project is part of the ShopSphere Omnichannel Retail System.

## 👥 Contributors

- Module 1: Product Catalog & Inventory Management

## 📞 Support

For issues and questions, please check the documentation or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: January 2026
