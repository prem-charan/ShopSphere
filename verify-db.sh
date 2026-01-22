#!/bin/bash

echo "🔍 Verifying database connection..."
echo ""

# Test connection
if mysql -u admin -p7897613 shopsphere_db -e "SELECT 1;" &>/dev/null; then
    echo "✅ Database connection successful!"
    echo ""
    
    # Show database info
    echo "📊 Database Information:"
    mysql -u admin -p7897613 shopsphere_db <<EOF
SELECT 
    'Database' as Info, 
    DATABASE() as Value
UNION ALL
SELECT 
    'User',
    USER()
UNION ALL
SELECT 
    'Connection',
    'Active';
    
SHOW TABLES;
EOF
    
    echo ""
    echo "✅ Everything looks good! You can start the backend now."
    echo ""
    echo "Run: cd backend && mvn spring-boot:run"
    
else
    echo "❌ Cannot connect to database."
    echo ""
    echo "Let's fix the permissions..."
    echo ""
    
    # Try to grant permissions
    if mysql -u root -p7897613 <<EOF 2>/dev/null
GRANT ALL PRIVILEGES ON shopsphere_db.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
EOF
    then
        echo "✅ Permissions granted! Try again."
    else
        echo "⚠️ Please run this manually:"
        echo ""
        echo "mysql -u root -p"
        echo "GRANT ALL PRIVILEGES ON shopsphere_db.* TO 'admin'@'localhost';"
        echo "FLUSH PRIVILEGES;"
        echo "EXIT;"
    fi
fi
