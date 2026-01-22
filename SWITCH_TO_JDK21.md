# 🔄 Switch to JDK 21 LTS - Final Fix

## ⚠️ The Issue

JDK 25 is too new - even the latest Lombok doesn't fully support it yet. We need **JDK 21 LTS** (Long Term Support).

---

## ✅ I've Already Updated pom.xml

Changed Java version from 25 → 21 in `pom.xml`. Now just need to switch your system Java.

---

## 🚀 Run These Commands (2 steps)

### Step 1: Install JDK 21 (if not installed)
```bash
sudo pacman -S jdk21-openjdk
```

### Step 2: Set JDK 21 as Default
```bash
sudo archlinux-java set java-21-openjdk
```

### Step 3: Verify Java Version
```bash
java -version
```

**Expected output:**
```
openjdk version "21.0.x"
```

### Step 4: Build Backend
```bash
cd ~/Documents/shopsphere/backend
mvn clean install
```

**Expected:** `BUILD SUCCESS` ✅

---

## 🎯 Complete Commands (Copy & Paste)

```bash
# Install JDK 21
sudo pacman -S jdk21-openjdk

# Set as default
sudo archlinux-java set java-21-openjdk

# Verify
java -version

# Build
cd ~/Documents/shopsphere/backend
mvn clean install

# If successful, start backend
mvn spring-boot:run
```

---

## 📊 Why JDK 21?

- ✅ **LTS Release** - Long Term Support (stable)
- ✅ **Fully Tested** - All libraries support it
- ✅ **Production Ready** - Used in enterprise
- ✅ **Spring Boot 3.3** - Fully compatible
- ✅ **Lombok** - Perfect compatibility

JDK 25 is experimental/preview. JDK 21 is the stable choice.

---

## 🎬 After Successful Build

### Terminal 1: Start Backend
```bash
cd ~/Documents/shopsphere/backend
mvn spring-boot:run
```

**Wait for:** `ShopSphere Backend is running on port 8080`

### Terminal 2: Start Frontend
```bash
cd ~/Documents/shopsphere/frontend
npm install
npm run dev
```

**Wait for:** `Local: http://localhost:3000/`

### Browser
```
http://localhost:3000
```

---

## ⏱️ Time Estimates

- Install JDK 21: 30 seconds
- First build: 3-5 minutes (downloads dependencies)
- Backend startup: 15-30 seconds
- Frontend: 2 minutes first time

---

## 🧪 Test Everything Works

### Test Backend API
```bash
curl http://localhost:8080/api/products
```

**Expected:**
```json
{"success":true,"message":"Products retrieved successfully","data":[]}
```

### Test Frontend
Open: `http://localhost:3000` → Should see ShopSphere Dashboard

---

## ✅ Success Checklist

- [ ] JDK 21 installed
- [ ] `java -version` shows 21.x
- [ ] `mvn clean install` → BUILD SUCCESS
- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:3000
- [ ] Can add/view products

---

## 🔍 Troubleshooting

### Still using JDK 25?
```bash
# Check available Java versions
archlinux-java status

# Force set to JDK 21
sudo archlinux-java set java-21-openjdk

# Verify
java -version
```

### Maven still fails?
```bash
# Clear Maven cache
rm -rf ~/.m2/repository/org/projectlombok

# Rebuild
mvn clean install
```

---

## 📝 What Changed

- `pom.xml`: Java 25 → 21
- System Java: Will switch to JDK 21 LTS
- Everything else: Stays the same

---

**Run the commands above and it will work!** 🚀

JDK 21 is the stable, production-ready choice.
