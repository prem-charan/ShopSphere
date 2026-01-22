# 📦 SKU Code - Complete Guide

## 🤔 What is SKU?

**SKU** = **Stock Keeping Unit**

It's a **unique identifier** (like a code or ID) for each product in your inventory. Think of it as a product's "serial number" that helps you track it.

---

## 📝 What Should You Enter?

### Option 1: Simple Format (Recommended for Small Stores)
```
ELEC-001
ELEC-002
CLOTH-001
SHOES-025
```

**Pattern:** `CATEGORY-NUMBER`

### Option 2: Detailed Format (For Larger Inventories)
```
LPTOP-HP-15-BLK-001
PHONE-SAMSG-S24-BLU-042
SHIRT-NIKE-M-RED-123
```

**Pattern:** `CATEGORY-BRAND-MODEL-COLOR-NUMBER`

### Option 3: Random Alphanumeric
```
A1B2C3
XYZ789
PRD001
```

**Pattern:** Any unique combination

---

## 🎯 Examples for ShopSphere

### Electronics:
- `LAPTOP-001` - First laptop
- `PHONE-002` - Second phone
- `TV-SAMSUNG-001` - Samsung TV
- `HEADPHONE-SONY-001` - Sony headphones

### Clothing:
- `TSHIRT-001` - First t-shirt
- `JEANS-LEVIS-002` - Levi's jeans
- `SHOE-NIKE-045` - Nike shoes

### Books:
- `BOOK-FICTION-001`
- `BOOK-TECH-JAVA-001`

### General Products:
- `PROD-001`, `PROD-002`, `PROD-003`

---

## ✅ Good SKU Practices

### DO:
- ✅ Keep it **short** (5-15 characters)
- ✅ Use **UPPERCASE** for consistency
- ✅ Use **hyphens** (-) for readability
- ✅ Make it **unique** for each product
- ✅ Include **category** prefix
- ✅ Use **sequential numbers** (001, 002, 003)

### DON'T:
- ❌ Don't use special characters (@, #, $, %, &)
- ❌ Don't make it too long
- ❌ Don't use spaces (use hyphens instead)
- ❌ Don't duplicate SKUs
- ❌ Don't use confusing characters (O vs 0, I vs 1)

---

## 🎨 SKU Templates for Common Categories

### Electronics:
```
LAPTOP-[BRAND]-[NUMBER]     → LAPTOP-HP-001
PHONE-[BRAND]-[NUMBER]      → PHONE-APPLE-001
TV-[SIZE]-[NUMBER]          → TV-55-001
CAMERA-[TYPE]-[NUMBER]      → CAMERA-DSLR-001
```

### Fashion:
```
[TYPE]-[BRAND]-[SIZE]-[NUMBER]
SHIRT-NIKE-M-001
JEANS-LEVIS-32-001
SHOE-ADIDAS-42-001
```

### Home & Kitchen:
```
FURN-[TYPE]-[NUMBER]        → FURN-CHAIR-001
KITCHEN-[ITEM]-[NUMBER]     → KITCHEN-MIXER-001
```

### Books:
```
BOOK-[GENRE]-[NUMBER]       → BOOK-TECH-001
BOOK-[AUTHOR]-[NUMBER]      → BOOK-ROWLING-001
```

---

## 💡 Quick Start Guide

### For Your First Products:

**If you're just starting out, use this simple format:**

1. **First Product:**  
   SKU: `PROD-001`

2. **Second Product:**  
   SKU: `PROD-002`

3. **Third Product:**  
   SKU: `PROD-003`

**Then gradually adopt category-based SKUs:**

```
Electronics → ELEC-001, ELEC-002
Clothing    → CLOTH-001, CLOTH-002
Books       → BOOK-001, BOOK-002
```

---

## 🔍 Example: Adding Products

### Product 1: Laptop
```
Name: Dell Inspiron 15
Category: Electronics
SKU: LAPTOP-DELL-001  ← Unique identifier
Price: $799.99
Stock: 25
```

### Product 2: T-Shirt
```
Name: Nike Sports T-Shirt
Category: Clothing
SKU: TSHIRT-NIKE-001  ← Unique identifier
Price: $29.99
Stock: 100
```

### Product 3: Programming Book
```
Name: Java Programming Guide
Category: Books
SKU: BOOK-JAVA-001  ← Unique identifier
Price: $49.99
Stock: 50
```

---

## 🎯 Why SKU is Important

### Benefits:
1. **Inventory Tracking** - Easy to count and track products
2. **Quick Search** - Find products fast by SKU
3. **Order Management** - Reference in orders and invoices
4. **Stock Control** - Monitor specific product quantities
5. **Prevent Confusion** - Even similar products have unique IDs

### Example Scenario:
You have 3 different iPhone models:
- `PHONE-IPHONE-13-BLK-001` - iPhone 13 Black
- `PHONE-IPHONE-13-WHT-002` - iPhone 13 White
- `PHONE-IPHONE-14-BLK-003` - iPhone 14 Black

Each has a unique SKU, so there's no confusion!

---

## 🤖 SKU vs Barcode

**SKU** (Internal use):
- Created by YOU (the store)
- Used for inventory management
- Unique to your store
- Example: `LAPTOP-HP-001`

**Barcode** (Universal):
- Created by manufacturer
- Used globally (same for all stores)
- Like UPC/EAN codes
- Example: `012345678905`

**In ShopSphere, we use SKU for inventory tracking.**

---

## 📝 SKU Field in ShopSphere

### When Adding a Product:

```
┌─────────────────────────────────────────┐
│  Product Name *                         │
│  [Dell Inspiron 15 Laptop____________]  │
│                                         │
│  Category *                             │
│  [Electronics_____________________▼]    │
│                                         │
│  SKU Code                               │
│  [LAPTOP-DELL-001_________________]     │  ← Enter here
│                                         │
│  Price *                                │
│  [799.99__________________________]     │
│                                         │
└─────────────────────────────────────────┘
```

**You can enter:**
- Simple: `PROD-001`
- Category-based: `LAPTOP-001`
- Detailed: `LAPTOP-DELL-15-001`

---

## ✨ Pro Tips

### Starting Out:
If you're unsure, just use:
```
PROD-001
PROD-002
PROD-003
...
```

### Growing Store:
Use category prefixes:
```
ELEC-001 (Electronics)
CLOTH-001 (Clothing)
FOOD-001 (Food)
```

### Large Store:
Add more details:
```
LAPTOP-HP-15-I5-8GB-001
PHONE-SAMSUNG-S24-256GB-BLK-001
```

---

## 🎯 Quick Examples for Testing

Copy these SKUs for your test products:

```
LAPTOP-001
PHONE-002
TABLET-003
CAMERA-004
HEADPHONE-005
KEYBOARD-006
MOUSE-007
MONITOR-008
PRINTER-009
ROUTER-010
```

---

## ❓ FAQ

**Q: Is SKU mandatory?**  
A: No, it's optional in ShopSphere, but highly recommended!

**Q: Can two products have the same SKU?**  
A: No! Each SKU must be unique.

**Q: What if I make a mistake?**  
A: You can edit the SKU later from the admin panel.

**Q: Can I use lowercase?**  
A: Yes, but UPPERCASE is recommended for consistency.

**Q: How long should it be?**  
A: 5-15 characters is ideal.

**Q: Can I skip it?**  
A: Yes, but you'll miss out on better inventory tracking.

---

## 🎉 Summary

**For ShopSphere:**
- **Simple format:** `PROD-001`, `PROD-002`, etc.
- **Category format:** `ELEC-001`, `CLOTH-001`, etc.
- **Detailed format:** `LAPTOP-DELL-001`, etc.

**Choose what works for you!** Start simple and evolve as your store grows.

---

## 📚 Need Help?

When adding products in the admin panel:
1. **Name** - Product name (required)
2. **Category** - Product category (required)
3. **SKU** - Unique identifier (optional but recommended)
4. **Price** - Product price (required)
5. **Stock** - Quantity in stock (required)

**Example Product:**
- Name: Gaming Laptop
- Category: Electronics
- **SKU: LAPTOP-GAMING-001** ← Your unique code
- Price: 1299.99
- Stock: 15

---

**Start with simple SKUs like PROD-001 and build from there!** 🚀
