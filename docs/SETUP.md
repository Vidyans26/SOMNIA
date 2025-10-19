# SOMNIA - Setup & Installation Guide

**Team:** Chimpanzini Bananini  
**Project:** SOMNIA - Sleep Health Monitoring System  
**Version:** 0.1.0  
**Last Updated:** October 19, 2025

---

## Table of Contents

1. [Quick Start (5 minutes)](#quick-start)
2. [Backend Setup](#backend-setup)
3. [Mobile App Setup](#mobile-app-setup)
4. [Development Environment](#development-environment)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

Make sure you have installed:
- **Python 3.11+** - https://www.python.org/downloads/
- **Node.js 18+** - https://nodejs.org/
- **Git** - https://git-scm.com/
- **Android Studio** or **Xcode** (for mobile testing)

### 1. Clone Repository

```bash
git clone https://github.com/Vidyans26/SOMNIA.git
cd SOMNIA
```

### 2. Backend (FastAPI)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend running at:** http://localhost:8000  
**API Docs at:** http://localhost:8000/docs

### 3. Mobile App (React Native)

```bash
# Navigate to mobile app
cd mobile-app

# Install dependencies
npm install

# Run on Android
npm run android

# OR run on iOS
npm run ios
```

### 4. Test the System

```bash
# Test backend (in new terminal)
curl http://localhost:8000/

# Expected response:
# {"status": "healthy", "service": "SOMNIA API", ...}
```

**That's it!** You now have SOMNIA running locally. 🎉

---

## Backend Setup

### Detailed Backend Installation

#### Step 1: Environment Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Verify Python version
python --version  # Should be 3.11+
```

#### Step 2: Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install all required packages
pip install -r requirements.txt

# Verify installations
pip list
```

#### Step 3: Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your settings
# Windows: notepad .env
# Mac/Linux: nano .env

# Required settings:
DEBUG=True
ENVIRONMENT=development
DATABASE_URL=sqlite:///./somnia.db
SECRET_KEY=your-secret-key-here-min-50-chars
```

#### Step 4: Run Backend

```bash
# Start development server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Output should show:
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### Step 5: Verify Backend

Open browser and visit:

```
http://localhost:8000/docs
```

You should see the **Swagger UI** with all API endpoints listed.

### API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/api/v1/health` | GET | Detailed status |
| `/api/v1/upload/audio` | POST | Upload audio file |
| `/api/v1/analyze` | POST | Analyze sleep data |
| `/api/v1/disorders` | GET | Get all disorders info |
| `/api/v1/team` | GET | Get team information |
| `/api/v1/demo-analysis` | GET | Get demo analysis result |

### Testing Backend with Curl

```bash
# Health check
curl http://localhost:8000/

# Get disorders info
curl http://localhost:8000/api/v1/disorders

# Get team info
curl http://localhost:8000/api/v1/team

# Get demo analysis
curl http://localhost:8000/api/v1/demo-analysis
```

---

## Mobile App Setup

### Detailed Mobile App Installation

#### Step 1: Environment Setup

```bash
# Navigate to mobile app directory
cd mobile-app

# Verify Node.js installation
node --version  # Should be 18+
npm --version
```

#### Step 2: Install Dependencies

```bash
# Install npm packages
npm install

# This will create node_modules/ directory
# (may take 2-3 minutes)

# Verify installation
npm list
```

#### Step 3: Configure for Android (Windows/Mac)

```bash
# Install Android build tools (if not already installed)
# Download Android Studio from: https://developer.android.com/studio

# Set ANDROID_HOME environment variable
# Windows:
setx ANDROID_HOME %USERPROFILE%\AppData\Local\Android\sdk
# Mac:
export ANDROID_HOME=~/Library/Android/sdk

# Verify ADB (Android Debug Bridge)
adb --version
```

#### Step 4: Configure for iOS (Mac Only)

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods

# Install iOS dependencies
cd ios
pod install
cd ..
```

#### Step 5: Run on Android

```bash
# Make sure Android emulator is running or physical device connected
# Check connected devices
adb devices

# Run app
npm run android

# App should launch in emulator/device
```

#### Step 6: Run on iOS (Mac Only)

```bash
# Run on iOS simulator
npm run ios

# iOS app should launch automatically
```

#### Step 7: Development Server

```bash
# In separate terminal, start Metro bundler
npm start

# This provides live reloading
# Press 'a' for Android or 'i' for iOS
```

---

## Development Environment

### Docker Setup (Optional but Recommended)

#### Install Docker

- **Windows/Mac:** https://www.docker.com/products/docker-desktop
- **Linux:** https://docs.docker.com/engine/install/

#### Run with Docker Compose

```bash
# Navigate to project root
cd SOMNIA

# Build and start all services
docker-compose up -d

# Services running:
# - Backend: http://localhost:8000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
# - Adminer (DB UI): http://localhost:8080

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### VS Code Setup (Recommended IDE)

#### Install Extensions

1. **Python** (Microsoft)
2. **FastAPI** (Mongkok)
3. **React Native Tools** (Microsoft)
4. **Prettier - Code formatter**
5. **ESLint** (Microsoft)
6. **Thunder Client** (API testing)

#### Create VS Code Workspace

```json
// .vscode/somnia.code-workspace
{
  "folders": [
    { "path": "backend", "name": "Backend (FastAPI)" },
    { "path": "mobile-app", "name": "Mobile (React Native)" },
    { "path": "docs", "name": "Documentation" }
  ],
  "settings": {
    "python.defaultInterpreterPath": "${workspaceFolder:Backend (FastAPI)}/venv/bin/python",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Database Setup

#### PostgreSQL (Production)

```bash
# Install PostgreSQL
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Start PostgreSQL service
# Windows: Services → Start PostgreSQL
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database
createdb somnia_db

# Create user
createuser somnia_user

# Set password
psql -U postgres -c "ALTER USER somnia_user WITH PASSWORD 'password123';"

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE somnia_db TO somnia_user;"

# Update .env file
DATABASE_URL=postgresql://somnia_user:password123@localhost:5432/somnia_db
```

#### SQLite (Development - Default)

```bash
# SQLite is built into Python, no setup needed
# Database file will be created automatically
DATABASE_URL=sqlite:///./somnia.db
```

---

## Testing

### Backend Testing

#### Unit Tests

```bash
# Navigate to backend
cd backend

# Run all tests
pytest

# Run specific test file
pytest tests/test_api.py

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=backend tests/
```

#### Manual API Testing

**Using Thunder Client (VS Code):**

```
1. Open Thunder Client extension
2. Create new request
3. Set method to GET
4. URL: http://localhost:8000/api/v1/disorders
5. Click "Send"
6. View response
```

**Using Postman:**

```
1. Download Postman: https://www.postman.com/
2. Import collection from docs/postman-collection.json
3. Set environment variable: base_url = http://localhost:8000
4. Run requests
```

### Mobile App Testing

#### Android Testing

```bash
# Connect Android device via USB (or use emulator)

# Verify connection
adb devices

# Run app
npm run android

# View logs
adb logcat

# Clear app data
adb shell pm clear com.somnia
```

#### iOS Testing

```bash
# Open iOS project in Xcode
open ios/SOMNIA.xcworkspace

# Select simulator or device
# Click Build & Run
```

### Integration Testing

```bash
# Backend + Frontend test
1. Start backend: python -m uvicorn main:app --reload
2. Start mobile app: npm run android
3. Open RecordingScreen
4. Tap "Start Sleep Monitoring"
5. Verify it shows "Recording active"
6. Wait 5 seconds
7. Tap "Stop Monitoring"
8. Verify it navigates to Results screen
9. Verify demo data is displayed
```

---

## Troubleshooting

### Backend Issues

#### Issue: "Module not found" error

```bash
# Solution: Make sure virtual environment is activated
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Then reinstall dependencies
pip install -r requirements.txt
```

#### Issue: "Port 8000 is already in use"

```bash
# Solution: Kill process using port 8000
# Windows (PowerShell):
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :8000
kill -9 <PID>

# Or use different port:
python -m uvicorn main:app --port 8001
```

#### Issue: Database connection error

```bash
# Solution: Check DATABASE_URL in .env file
# Verify PostgreSQL is running:
# Windows: Services → Check PostgreSQL status
# Mac: brew services list
# Linux: systemctl status postgresql

# For SQLite, delete existing database:
rm somnia.db
# It will be recreated automatically
```

### Mobile App Issues

#### Issue: "npm ERR! code ERESOLVE"

```bash
# Solution: Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Issue: "Unable to load script from assets"

```bash
# Solution: Clear Metro cache
npm start -- --reset-cache
```

#### Issue: Android build failure

```bash
# Solution: Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

#### Issue: "Could not connect to development server"

```bash
# Solution: Make sure Metro is running
npm start

# In another terminal:
npm run android

# Or check firewall settings
```

### General Issues

#### Issue: Git credentials not working

```bash
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

# Run on Android
npm run android

# Run on iOS
npm run ios

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