# 🚀 SOMNIA - Complete Setup Guide# SOMNIA - Setup & Installation Guide



**Welcome!** This guide will help you set up SOMNIA from scratch in under 15 minutes.**Team:** Chimpanzini Bananini  

**Project:** SOMNIA - Sleep Health Monitoring System  

> **📌 Quick Links:**  **Version:** 0.1.0  

> [System Requirements](#-system-requirements) • [Docker Setup](#-quick-start-docker) • [Manual Setup](#-manual-setup) • [Testing](#-testing) • [Troubleshooting](#-troubleshooting)**Last Updated:** October 21, 2025



------



## 📋 System Requirements## Table of Contents



| Component | Minimum | Recommended |1. [Quick Start (5 minutes)](#quick-start)

|-----------|---------|-------------|2. [Backend Setup](#backend-setup)

| **RAM** | 4 GB | 8 GB |3. [Mobile App Setup](#mobile-app-setup)

| **Storage** | 2 GB free | 5 GB free |4. [Development Environment](#development-environment)

| **OS** | Windows 10+, macOS 10.15+, Ubuntu 20.04+ | Latest versions |5. [Testing](#testing)

| **Internet** | Required for setup | Required |6. [Troubleshooting](#troubleshooting)



### Required Software---



**For Docker Setup (⭐ RECOMMENDED):**## Quick Start

- [Docker Desktop 4.0+](https://www.docker.com/get-started)

- [Node.js 18+](https://nodejs.org/)### Prerequisites

- [Expo Go app](https://expo.dev/client) on your mobile device

Make sure you have installed:

**For Manual Setup:**- **Python 3.11+** - https://www.python.org/downloads/

- [Python 3.11+](https://www.python.org/downloads/)- **Node.js 18+** - https://nodejs.org/

- [Node.js 18+](https://nodejs.org/)- **Git** - https://git-scm.com/

- [Git](https://git-scm.com/)- **Android Studio** or **Xcode** (for mobile testing)

- [Expo Go app](https://expo.dev/client)

### 1. Clone Repository

---

```bash

## 🚀 Quick Start (Docker)git clone https://github.com/Vidyans26/SOMNIA.git

cd SOMNIA

**⏱️ Time: 5-10 minutes**```



### Step 1: Clone Repository### 2. Backend (FastAPI)

```bash

git clone https://github.com/Vidyans26/SOMNIA.git```bash

cd SOMNIA# Navigate to backend

```cd backend



### Step 2: Configure Environment# Create virtual environment

```bashpython -m venv venv

cp .env.example .env

```# Activate virtual environment

# On Windows:

### Step 3: Start Backendvenv\Scripts\activate

```bash# On Mac/Linux:

# Windowssource venv/bin/activate

.\run.ps1

# Install dependencies

# macOS/Linuxpip install -r requirements.txt

chmod +x run.sh && ./run.sh

```# Run backend server

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

**Expected output:**```

```

🤖 Initializing ML models...**Backend running at:** http://localhost:8000  

✅ ML models initialized successfully**API Docs at:** http://localhost:8000/docs

🔹 Backend API: http://localhost:8000

🔹 API Docs: http://localhost:8000/docs### 3. Mobile App (React Native)

```

```bash

### Step 4: Start Mobile App# Navigate to mobile app

```bashcd mobile-app

cd "somnia-app/SOMNIA app/Somnia"

npm install# Install dependencies

npx expo startnpm install

```

#To run

### Step 5: Open on Mobilenpx expo start

1. Install [Expo Go](https://expo.dev/client) on your phone

2. Scan the QR code displayed in terminal```

3. Grant camera and microphone permissions

### 4. Test the System

### ✅ Done!

- Backend: http://localhost:8000```bash

- API Docs: http://localhost:8000/docs# Test backend (in new terminal)

- Mobile: Running on your devicecurl http://localhost:8000/



---# Expected response:

# {"status": "healthy", "service": "SOMNIA API", ...}

## 🛠️ Manual Setup```



**⏱️ Time: 15-20 minutes****That's it!** You now have SOMNIA running locally. 🎉



### Part A: Backend Setup---



#### 1. Clone and Navigate## Backend Setup

```bash

git clone https://github.com/Vidyans26/SOMNIA.git### Detailed Backend Installation

cd SOMNIA

```#### Step 1: Environment Setup



#### 2. Create Virtual Environment```bash

```bash# Navigate to backend directory

# Create venvcd backend

python -m venv venv

# Create Python virtual environment

# Activatepython -m venv venv

# Windows:

venv\Scripts\activate# Activate virtual environment

# Windows:

# macOS/Linux:venv\Scripts\activate

source venv/bin/activate# Mac/Linux:

```source venv/bin/activate



#### 3. Install Dependencies# Verify Python version

```bashpython --version  # Should be 3.11+

pip install -r backend/requirements.txt```

```

#### Step 2: Install Dependencies

**This installs:**

- FastAPI 0.104```bash

- TensorFlow 2.20# Upgrade pip

- Keras 3.12pip install --upgrade pip

- Librosa 0.11

- And more...# Install all required packages

pip install -r requirements.txt

**⏱️ Takes:** 5-10 minutes

# Verify installations

#### 4. Configure Environmentpip list

```bash```

cp .env.example .env

```#### Step 3: Environment Variables



**Default `.env` (production-ready):**```bash

```env# Copy example env file

ENABLE_ML_MODELS=truecp .env.example .env

USE_MOCK=false

ENABLE_SNORING=true# Edit .env file with your settings

SPO2_MODEL_PATH=backend/models/SpO2_weights.hdf5# Windows: notepad .env

ECG_MODEL_PATH=backend/models/ecg_weights.hdf5# Mac/Linux: nano .env

```

# Required settings:

#### 5. Start BackendDEBUG=True

```bashENVIRONMENT=development

uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000DATABASE_URL=sqlite:///./somnia.db

```SECRET_KEY=your-secret-key-here-min-50-chars

```

**Expected output:**

```#### Step 4: Run Backend

🤖 Initializing ML models...

  - SpO2 model: backend/models/SpO2_weights.hdf5```bash

  - ECG model: backend/models/ecg_weights.hdf5# Start development server

✅ ML models initialized successfullypython -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

INFO: Application startup complete.

```# Output should show:

# INFO:     Uvicorn running on http://0.0.0.0:8000

**✅ Backend running at:** http://localhost:8000```



### Part B: Mobile App Setup#### Step 5: Verify Backend



#### 1. Navigate to App DirectoryOpen browser and visit:

**Open NEW terminal** (keep backend running):

```bash```

cd "somnia-app/SOMNIA app/Somnia"http://localhost:8000/docs

``````



#### 2. Install DependenciesYou should see the **Swagger UI** with all API endpoints listed.

```bash

npm install### API Endpoints Reference

```

| Endpoint | Method | Purpose |

**⏱️ Takes:** 2-5 minutes|----------|--------|---------|

| `/` | GET | Health check |

#### 3. Start Expo| `/api/v1/health` | GET | Detailed status |

```bash| `/api/v1/upload/audio` | POST | Upload audio file |

npx expo start| `/api/v1/analyze` | POST | Analyze sleep data |

```| `/api/v1/disorders` | GET | Get all disorders info |

| `/api/v1/team` | GET | Get team information |

**Expected output:**| `/api/v1/demo-analysis` | GET | Get demo analysis result |

```

▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄### Testing Backend with Curl

[QR Code displayed]

```bash

› Metro waiting on exp://192.168.1.100:8081# Health check

› Scan the QR code with Expo Gocurl http://localhost:8000/

```

# Get disorders info

#### 4. Open on Mobilecurl http://localhost:8000/api/v1/disorders

1. Download [Expo Go](https://expo.dev/client)

2. Open Expo Go app# Get team info

3. Scan QR codecurl http://localhost:8000/api/v1/team

4. Wait for app to load (30-60s first time)

# Get demo analysis

### ✅ Manual Setup Complete!curl http://localhost:8000/api/v1/demo-analysis

- Backend: http://localhost:8000```

- ML Models: Loaded (SpO2 + ECG)

- Mobile App: Running on device---



---## Mobile App Setup



## 🔧 Network Configuration### Detailed Mobile App Installation



If mobile app can't connect to backend:#### Step 1: Environment Setup



### 1. Find Your Computer's IP```bash

# Navigate to mobile app directory

**Windows:**cd "somnia-app/SOMNIA app/Somnia"

```bash

ipconfig# Verify Node.js installation

# Look for "IPv4 Address"node --version  # Should be 18+

# Example: 192.168.1.100npm --version

``````



**macOS/Linux:**#### Step 2: Install Dependencies

```bash

ifconfig```bash

# Look for "inet" under en0/wlan0# Install npm packages

# Example: 192.168.1.100npm install

```

# This will create node_modules/ directory

### 2. Update API URL# (may take 2-3 minutes)



Edit `somnia-app/SOMNIA app/Somnia/services/apiService.ts`:# Verify installation

npm list

```typescript```

// Change this line:

const API_BASE_URL = 'http://localhost:8000';#### Step 3: Install Expo Go on Your Mobile Device



// To your computer's IP:```bash

const API_BASE_URL = 'http://192.168.1.100:8000';Android: Install from Google Play Store

```iOS: Install from App Store



### 3. Restart Expo# This is required to scan the QR code and run the app on your phone.

```bash```

# Press Ctrl+C, then:

npx expo start --clear#### Step 4: Start the server

```

```bash

---# Start the Expo server

npx expo start

## ✅ Testing```



### 1. Backend Health Check#### Step 5: Development Server



**Browser:**```bash

```# Optional: Start via npm script (equivalent)

http://localhost:8000/api/v1/healthnpm start

```

# This provides live reloading

**Expected Response:**# Use if needed

```json

{```

  "status": "operational",

  "service": "SOMNIA - Sleep Health Monitoring",---

  "version": "0.1.0"

}## Development Environment

```

### Docker Setup (Optional)

### 2. API Documentation

Minimal backend-only Docker files are included for a quick demo with mock-friendly endpoints.

**Open:**

```#### Install Docker

http://localhost:8000/docs

```- Windows/Mac: https://www.docker.com/products/docker-desktop

- Linux: https://docs.docker.com/engine/install/

You should see Swagger UI with all endpoints.

#### Run with Docker Compose (backend only)

### 3. Run E2E Tests

```powershell

```bash# From the repo root

python test_e2e.pydocker compose up --build

```

# The backend will be available at http://localhost:8000

**Expected:**# Swagger UI at http://localhost:8000/docs

``````

🧪 SOMNIA E2E INTEGRATION TESTING

Notes:

✅ PASS - Backend Health Endpoint- Uploaded files are stored under `./uploads` (bind-mounted into the container).

✅ PASS - ML Analysis with Wearable Data  - Optional feature flags (disabled by default): `ENABLE_SNORING`, `ENABLE_VIDEO_POSE`.

✅ PASS - Swagger API Documentation- The previously planned multi-service stack (PostgreSQL/Redis/Adminer) is not required for this submission.



Success Rate: 50.0%### VS Code Setup (Recommended IDE)

ML INTEGRATION VERIFIED ✅

```#### Install Extensions



### 4. Mobile App Test1. **Python** (Microsoft)

2. **FastAPI** (Mongkok)

On your mobile device:3. **React Native Tools** (Microsoft)

4. **Prettier - Code formatter**

1. Open SOMNIA app (via Expo Go)5. **ESLint** (Microsoft)

2. Grant camera/microphone permissions6. **Thunder Client** (API testing)

3. Tap "Start Recording"

4. Wait 10-30 seconds#### Create VS Code Workspace

5. Tap "Stop Recording"

6. Tap "Analyze Sleep"```json

7. View ML-enhanced results! 🎉// .vscode/somnia.code-workspace

{

---  "folders": [

    { "path": "backend", "name": "Backend (FastAPI)" },

## 🔥 Troubleshooting    { "path": "mobile-app", "name": "Mobile (React Native)" },

    { "path": "docs", "name": "Documentation" }

### Issue: "Docker is not running"  ],

  "settings": {

**Solution:**    "python.defaultInterpreterPath": "${workspaceFolder:Backend (FastAPI)}/venv/bin/python",

1. Open Docker Desktop    "python.linting.enabled": true,

2. Wait for green indicator    "python.linting.pylintEnabled": true,

3. Run `.\run.ps1` again    "editor.formatOnSave": true,

    "editor.defaultFormatter": "esbenp.prettier-vscode"

### Issue: "Port 8000 already in use"  }

}

**Windows:**```

```bash

netstat -ano | findstr :8000### Database Setup

taskkill /PID <PID> /F

```#### PostgreSQL (Production - Planned)



**macOS/Linux:**```bash

```bash# Install PostgreSQL

lsof -ti:8000 | xargs kill -9# Windows: https://www.postgresql.org/download/windows/

```# Mac: brew install postgresql

# Linux: sudo apt-get install postgresql

### Issue: "ML models not loading"

# Start PostgreSQL service

**Check:**# Windows: Services → Start PostgreSQL

1. Model files exist:# Mac: brew services start postgresql

   ```bash# Linux: sudo systemctl start postgresql

   dir backend\models\*.hdf5  # Windows

   ls backend/models/*.hdf5   # macOS/Linux# Create database

   ```createdb somnia_db



2. `.env` configuration:# Create user

   ```envcreateuser somnia_user

   ENABLE_ML_MODELS=true

   USE_MOCK=false# Set password

   ```psql -U postgres -c "ALTER USER somnia_user WITH PASSWORD 'password123';"



3. Restart backend# Grant privileges

psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE somnia_db TO somnia_user;"

### Issue: "Network request failed" (Mobile)

# Update .env file

**Solutions:**DATABASE_URL=postgresql://somnia_user:password123@localhost:5432/somnia_db

```

1. **Update API URL** with your computer's IP:

   - Edit `services/apiService.ts`#### SQLite (Development - Default)

   - Use `http://YOUR_IP:8000` instead of `localhost`

```bash

2. **Same WiFi network:**# SQLite is built into Python, no setup needed

   - Computer and phone must be on same network# Database file will be created automatically

DATABASE_URL=sqlite:///./somnia.db

3. **Firewall:**```

   - Allow port 8000 in Windows Firewall

   - Or temporarily disable firewall to test---



4. **Try tunnel mode:**## Testing

   ```bash

   npx expo start --tunnel### Backend Testing (Optional)

   ```

#### Unit Tests

### Issue: "npm install fails"

```bash

```bash# Navigate to backend

npm cache clean --forcecd backend

rm -rf node_modules package-lock.json

npm install# Run all tests (if tests are added)

```pytest



### Issue: "TensorFlow installation errors"# Run specific test file

pytest tests/test_api.py

**Windows:**

- Use Python 3.11 specifically# Run with verbose output

- Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)pytest -v



**macOS:**# Run with coverage

```bashpytest --cov=backend tests/

brew install python@3.11```

python3.11 -m venv venv

source venv/bin/activate#### Manual API Testing

pip install -r backend/requirements.txt

```**Using Thunder Client (VS Code):**



---```

1. Open Thunder Client extension

## ⚙️ Advanced Configuration2. Create new request

3. Set method to GET

### Environment Variables4. URL: http://localhost:8000/api/v1/disorders

5. Click "Send"

Full list in `.env`:6. View response

```

```env

# Application**Using Postman:**

DEBUG=true

ENVIRONMENT=development```

HOST=0.0.0.01. Download Postman: https://www.postman.com/

PORT=80002. Import collection from docs/postman-collection.json

3. Set environment variable: base_url = http://localhost:8000

# ML Models4. Run requests

ENABLE_ML_MODELS=true```

USE_MOCK=false

ENABLE_SNORING=true### Mobile App Testing

ENABLE_VIDEO_POSE=false

```bash

# Model Paths# Make sure your mobile device has Expo Go installed

SPO2_MODEL_PATH=backend/models/SpO2_weights.hdf5# Android: Google Play Store

ECG_MODEL_PATH=backend/models/ecg_weights.hdf5# iOS: App Store

```

# Start the Expo development server

### Docker Commandscd "somnia-app/SOMNIA app/Somnia"

npx expo start

```bash

# Start# Scan the QR code provided in the terminal using the Expo Go app on the phone. 

docker compose up```



# Start in background### Integration Testing

docker compose up -d

```bash

# Stop# Backend + Frontend test

docker compose down1. Start backend: python -m uvicorn main:app --reload

2. Start mobile app: npm run android

# View logs3. Open RecordingScreen

docker compose logs -f backend4. Tap "Start Sleep Monitoring"

5. Verify it shows "Recording active"

# Rebuild6. Wait 5 seconds

docker compose up --build7. Tap "Stop Monitoring"

8. Verify it navigates to Results screen

# Clean everything9. Verify demo data is displayed

docker compose down -v --rmi all```

```

---

### Deployment Scripts

## Troubleshooting

**Windows:**

```powershell### Backend Issues

.\run.ps1           # Start dev mode

.\run.ps1 -Mode prod  # Start production#### Issue: "Module not found" error

.\run.ps1 -Stop      # Stop services

.\run.ps1 -Clean     # Clean containers```bash

```# Solution: Make sure virtual environment is activated

# Windows:

**Unix/Mac:**venv\Scripts\activate

```bash# Mac/Linux:

./run.sh            # Start dev modesource venv/bin/activate

./run.sh prod       # Start production

./run.sh --stop     # Stop services# Then reinstall dependencies

./run.sh --clean    # Clean containerspip install -r requirements.txt

``````



---#### Issue: "Port 8000 is already in use"



## 📚 Next Steps```bash

# Solution: Kill process using port 8000

After setup:# Windows (PowerShell):

netstat -ano | findstr :8000

1. **📖 Read Documentation:**taskkill /PID <PID> /F

   - [API Documentation](API.md)

   - [Architecture Guide](ARCHITECTURE.md)# Mac/Linux:

   - [Integration Guide](INTEGRATION.md)lsof -i :8000

   - [Model Card](MODEL_CARD.md)kill -9 <PID>



2. **🧪 Explore Features:**# Or use different port:

   - Record sleep audio/videopython -m uvicorn main:app --port 8001

   - View ML-enhanced analysis```

   - Check sleep stages

   - Review recommendations#### Issue: Database connection error



3. **🔍 API Testing:**```bash

   - Visit http://localhost:8000/docs# Solution: Check DATABASE_URL in .env file

   - Try Swagger UI# Verify PostgreSQL is running:

   - Test endpoints# Windows: Services → Check PostgreSQL status

# Mac: brew services list

---# Linux: systemctl status postgresql



## 🆘 Getting Help# For SQLite, delete existing database:

rm somnia.db

### Resources# It will be recreated automatically

```

- **📚 Docs:** [docs/](.) folder

- **🐛 Issues:** [GitHub Issues](https://github.com/Vidyans26/SOMNIA/issues)### Mobile App Issues

- **💬 Discussions:** [GitHub Discussions](https://github.com/Vidyans26/SOMNIA/discussions)

#### Issue: "npm ERR! code ERESOLVE"

### Quick Reference

```bash

```bash# Solution: Clear npm cache and reinstall

# Backendnpm cache clean --force

uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000rm -rf node_modules package-lock.json

npm install

# Mobile App```

npx expo start

#### Issue: "Unable to load script from assets"

# Docker

.\run.ps1  # Windows```bash

./run.sh   # Unix/Mac# Solution: Clear Metro cache

npm start -- --reset-cache

# Test```

python test_e2e.py

#### Issue: Android build failure

# Health Check

curl http://localhost:8000/api/v1/health```bash

```# Solution: Clean and rebuild

cd android

### Important URLs./gradlew clean

cd ..

- **Backend API:** http://localhost:8000npm run android

- **API Docs:** http://localhost:8000/docs```

- **Health Check:** http://localhost:8000/api/v1/health

#### Issue: "Could not connect to development server"

---

```bash

## 🎉 Success!# Solution: Make sure Metro is running

npm start

If you see:

- ✅ Backend running with ML models loaded# In another terminal:

- ✅ Mobile app connected and responsivenpm run android

- ✅ Health check returning "operational"

# Or check firewall settings

**You're all set!** Start monitoring your sleep! 😴```



---### General Issues



*Last Updated: October 29, 2025*  #### Issue: Git credentials not working

*SOMNIA v1.0 - Sleep Health Monitoring System*  

*Team: Chimpanzini Bananini*```bash

# Solution: Generate personal access token
# GitHub → Settings → Developer settings → Personal access tokens
# Create new token with repo scope
git remote set-url origin https://<token>@github.com/Vidyans26/SOMNIA.git
```

#### Issue: Commits not pushing

```bash
# Solution: Configure git
git config user.name "Chimpanzini Bananini"
git config user.email "your-email@example.com"

# Then try pushing again
git push origin main
```

---

## Quick Command Reference

### Backend Commands

```bash
# Start backend
python -m uvicorn main:app --reload

# Run tests
pytest

# Lint code
pylint backend/

# Format code
black backend/

# View API docs
# Open: http://localhost:8000/docs
```

### Mobile Commands

```bash
# Start Metro bundler
npm start

# Run on Android/iOS
npx expo start

# Run tests
npm test

# Lint code
npm run lint
```

### Git Commands

```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Your message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# View commit history
git log --oneline
```

---

## Next Steps

1. ✅ Backend running at http://localhost:8000
2. ✅ Mobile app running on device/emulator
3. ✅ API docs visible at http://localhost:8000/docs
4. 📝 Make changes and test
5. 🚀 Deploy to cloud (AWS/Railway)

## Support

For issues:
- Check [Troubleshooting](#troubleshooting) section above
- Review error messages carefully
- Check GitHub Issues: https://github.com/Vidyans26/SOMNIA/issues
- Contact team: chimpanzini.bananini@hackathon.com

---

**Happy coding! 🚀**
