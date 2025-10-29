# 🚀 SOMNIA - 5-Minute Quickstart

**Get SOMNIA running in 5 minutes or less!**

---

## Prerequisites

✅ [Docker Desktop](https://www.docker.com/get-started) installed  
✅ [Node.js 18+](https://nodejs.org/) installed  
✅ Phone with **Expo Go SDK 51** - ⚠️ **IMPORTANT:**
   - **Android:** [Download SDK 51](https://expo.dev/go?sdkVersion=51&platform=android&device=true) (don't use Play Store!)
   - **iOS:** [App Store version](https://apps.apple.com/app/expo-go/id982107779) works fine

---

## Step 1: Clone Repository (30 seconds)

```bash
git clone https://github.com/Vidyans26/SOMNIA.git
cd SOMNIA
```

---

## Step 2: Start Backend (2 minutes)

### Windows:
```powershell
.\run.ps1
```

### macOS/Linux:
```bash
chmod +x run.sh && ./run.sh
```

**Wait for:**
```
🤖 Initializing ML models...
✅ ML models initialized successfully
🔹 Backend API: http://localhost:8000
```

**✅ Backend ready!** Open http://localhost:8000/docs to see API

---

## Step 3: Start Mobile App (2 minutes)

**Open new terminal:**
```bash
cd "somnia-app/SOMNIA app/Somnia"
npm install
npx expo start
```

**Wait for QR code to appear**

---

## Step 4: Open on Phone (30 seconds)

1. Install **Expo Go SDK 51** on your phone:
   - **Android:** [Download SDK 51 APK](https://expo.dev/go?sdkVersion=51&platform=android&device=true)
   - **iOS:** Download from App Store
   - ⚠️ **Don't use Android Play Store** (has incompatible SDK 54)
2. Open **Expo Go SDK 51** app
3. **Scan QR code** from terminal
4. Grant **camera & microphone** permissions
5. **Wait 30-60 seconds** for app to load

---

## Step 5: Test It! (1 minute)

**On your phone:**

1. Tap **"Start Recording"** button
2. Wait **10-30 seconds** (simulate sleep sounds)
3. Tap **"Stop Recording"**
4. Tap **"Analyze Sleep"**
5. **View results!** 🎉

**Expected output:**
- Sleep efficiency score
- Sleep stages breakdown
- ML-detected disorders
- Health recommendations

---

## ✅ Success Checklist

- [ ] Backend shows "ML models initialized" ✅
- [ ] http://localhost:8000/docs shows Swagger UI
- [ ] Mobile app opens on phone (Expo Go)
- [ ] Recording button works
- [ ] Analysis displays results

---

## 🆘 Quick Troubleshooting

### "Docker is not running"
→ Open Docker Desktop and wait for green indicator

### "Port 8000 already in use"
```bash
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:8000 | xargs kill -9
```

### "Network request failed" (Mobile)
1. Get your computer's IP:
   - Windows: `ipconfig` (look for IPv4)
   - Mac: `ifconfig` (look for inet)
2. Edit `somnia-app/SOMNIA app/Somnia/services/apiService.ts`
3. Change `localhost` → `YOUR_IP` (e.g., `192.168.1.100`)
4. Restart Expo: `npx expo start --clear`

### "npm install fails"
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Next Steps

**After quickstart:**

1. **📖 Read Docs:**
   - [Complete Setup Guide](docs/SETUP.md)
   - [API Documentation](docs/API.md)
   - [Architecture Guide](docs/ARCHITECTURE.md)

2. **🧪 Test Features:**
   - Try different recording lengths
   - View ML predictions
   - Explore disorder information

3. **🔍 Explore Code:**
   - Backend: `backend/main.py`
   - ML Models: `backend/models/inference.py`
   - Mobile App: `somnia-app/SOMNIA app/Somnia/`

---

## 📚 Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[README.md](README.md)** | Project overview | 5 min |
| **[SETUP.md](docs/SETUP.md)** | Detailed setup | 10 min |
| **[API.md](docs/API.md)** | API reference | 15 min |
| **[INTEGRATION.md](docs/INTEGRATION.md)** | Deep dive | 30 min |

---

##  Need Help?

- **📖 Full Setup:** [docs/SETUP.md](docs/SETUP.md)
- **🐛 Issues:** [GitHub Issues](https://github.com/Vidyans26/SOMNIA/issues)
- **💬 Questions:** [GitHub Discussions](https://github.com/Vidyans26/SOMNIA/discussions)

---

## ⚡ Ultra-Fast Reference

```bash
# Backend
.\run.ps1                              # Windows
./run.sh                               # Mac/Linux

# Mobile
cd "somnia-app/SOMNIA app/Somnia"
npx expo start

# Test
curl http://localhost:8000/api/v1/health
python test_e2e.py

# URLs
Backend: http://localhost:8000
API Docs: http://localhost:8000/docs
Health: http://localhost:8000/api/v1/health
```

---

**🎉 You're ready to use SOMNIA!**

*Sleep better with AI-powered insights* 😴🤖

---

*Last Updated: October 29, 2025*  
*SOMNIA v1.0 - Team Chimpanzini Bananini*
