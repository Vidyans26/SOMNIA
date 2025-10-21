# 🌙 SOMNIA - Sleep Health Monitoring System

> **"Somnia knows your sleep better than you do."**

SOMNIA is an advanced multimodal sleep health monitoring system that analyzes sleep patterns, detects sleep disorders, and provides personalized insights for better sleep quality.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Mobile App](#mobile-app)
- [Team](#team)
- [Documentation](#documentation)
- [License](#license)

---

## 🎯 Overview

SOMNIA is a comprehensive sleep monitoring solution that combines:
- **Audio Analysis**: Detects snoring, sleep talking, and respiratory patterns
- **Movement Tracking**: Monitors sleep positions and restlessness
- **Heart Rate Monitoring**: Tracks cardiovascular health during sleep
- **Sleep Stage Classification**: Identifies REM, NREM, and deep sleep phases
- **Disorder Detection**: Recognizes common sleep disorders like sleep apnea, insomnia, and narcolepsy

The system provides users with actionable insights and personalized recommendations to improve sleep quality and overall health.

---

## ✨ Features

### Backend API
- ✅ RESTful API with FastAPI framework
- ✅ 7+ endpoints for sleep analysis and monitoring
- ✅ Authentication and authorization system
- ✅ Sleep disorder detection algorithms
- ✅ Real-time data processing
- ✅ Comprehensive error handling
- ✅ CORS support for mobile and web clients

### Mobile Application
- ✅ React Native cross-platform app
- ✅ Audio recording for sleep analysis
- ✅ Real-time sleep monitoring
- ✅ Results dashboard with visualizations
- ✅ User profile management
- ✅ Sleep disorder information library
- ✅ Offline data storage

### Sleep Analysis
- ✅ Audio-based snoring detection
- ✅ Sleep stage classification
- ✅ Movement pattern analysis
- ✅ Heart rate variability monitoring
- ✅ Disorder probability scoring
- ✅ Personalized sleep recommendations

---

## 🏗️ System Architecture

SOMNIA uses a **multimodal approach** combining:

```
User (Mobile App)
       ↓
Audio/Sensor Data
       ↓
Backend API (FastAPI)
       ↓
Sleep Analysis Models
├─ Audio Analysis
├─ Movement Detection
├─ Heart Rate Analysis
└─ Machine Learning Classifiers
       ↓
Database
       ↓
Results & Recommendations
       ↓
Mobile Dashboard
```

For detailed architecture, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

## 🚀 Quick Start


For setup instructions, please refer to [SETUP.md](./docs/SETUP.md)

---

## 📁 Project Structure

```
SOMNIA/
├── .gitignore                               
├── LICENSE                         
├── README.md                  
│
├── backend/                            
│   ├── __init__.py                      
│   ├── .env.example                    
│   ├── config.py                     
│   ├── main.py                         
│   ├── requirements.txt                        
│   ├── models/                                
│   │   ├── __init__.py
│   │   ├── sleep_analyzer.py                  
│   │   └── sleep_report.py                    
│   └── utils/                                 
│       └── auth.py                            
│
├── somnia-app/SOMNIA app/Somnia/           
│   ├── .gitignore                             
│   ├── README.md                              
│   ├── app.json                             
│   ├── package.json                          
│   ├── tsconfig.json                         
│   ├── babel.config.js                      
│   ├── metro.config.js                      
│   ├── app/                                  
│   │   ├── (tabs)/
│   │   │   ├── home.tsx
│   │   │   ├── recording.tsx
│   │   │   ├── results.tsx
│   │   │   ├── profile.tsx
│   │   │   └── disorders.tsx
│   │   ├── _layout.tsx
│   │   └── +not-found.tsx
│   ├── components/                            
│   ├── context/                              
│   ├── utils/                                  
│   ├── types/                                 
│   ├── assets/                                
│   │   └── images/
│   └── node_modules/                          
│
└── docs/                                      
    ├── mid-submission.md                      
    ├── SETUP.md                                
    ├── API.md                                
    └── ARCHITECTURE.md                         

```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/disorders` | List all sleep disorders |
| GET | `/team` | Team information |
| POST | `/demo-analysis` | Analyze sleep data |
| GET | `/sleep-logs` | Get user sleep logs |
| POST | `/feedback` | Submit user feedback |
| GET | `/resources` | Get sleep resources |

### Example Request

```bash
curl -X GET http://localhost:8000/api/v1/disorders
```

### Example Response

```json
{
  "disorders": [
    "Insomnia",
    "Sleep Apnea",
    "Narcolepsy",
    "Restless Legs Syndrome"
  ]
}
```

For comprehensive API documentation, see [API.md](./docs/API.md)

---

## 📱 Mobile App

### Screens

1. **Home Screen**: Welcome page with quick stats
2. **Recording Screen**: Start/stop sleep recording
3. **Results Screen**: View analysis results with charts
4. **Profile Screen**: User settings and preferences
5. **Disorders Screen**: Information about sleep disorders

### Features

- Real-time audio recording
- Background data sync
- Offline mode support
- Push notifications
- Data visualization
- Export reports

---

## 👥 Team

**Current Development Team:**
Vidyans Sankalp
Khushbu Sharma
Dharmesh Sahu
Ved Pashine
---

## 📚 Documentation

- **[mid-submission.md](./docs/mid-submission.md)** - Comprehensive mid-submission report with progress updates
- **[SETUP.md](./docs/SETUP.md)** - Detailed installation and setup instructions
- **[API.md](./docs/API.md)** - Complete API endpoint documentation
- **[ARCHITECHTURE.md](./docs/ARCHITECTURE.md)** - System architecture and design decisions

---

## 🛠️ Technologies Used

### Backend
- **FastAPI** - Modern web framework for building APIs
- **Python 3.8+** - Core programming language
- **NumPy & SciPy** - Numerical computing
- **Librosa** - Audio analysis
- **TensorFlow/Keras** - Machine learning models
- **Scikit-learn** - ML utilities
- **SQLAlchemy** - Database ORM
- **PyJWT** - JWT authentication

### Mobile
- **React Native** - Cross-platform mobile framework
- **JavaScript/TypeScript** - Application logic
- **Context API** - State management
- **Axios** - HTTP client

### Tools
- **Git** - Version control
- **GitHub** - Repository hosting
- **Uvicorn** - ASGI server
- **Docker** - Containerization (optional)

---

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration for safe API access
- Input validation and sanitization
- Environment variables for sensitive data
- HTTPS ready for production

---

## 📊 Current Status

### Mid-Submission
✅ **Completed:**
- Backend API with 7+ endpoints
- Mobile app UI with 5 screens
- Sleep analysis models
- Authentication system
- Comprehensive documentation (50+ pages)
- GitHub repository setup

⏳ **In Progress:**
- Advanced ML models for disorder detection
- Mobile app backend integration
- Real-time data processing
- Performance optimization

---

## 📞 Support & Feedback

For questions, issues, or suggestions:
- Open an issue on GitHub: [SOMNIA Issues](https://github.com/Vidyans26/SOMNIA/issues)
- Check documentation: [/docs](./docs/)

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](./LICENSE) file for details.

---

## 🎉 Acknowledgments

- Sleep health research community
- FastAPI and React Native communities
- All contributors and team members
- Special thanks to everyone supporting the project

---

## 📞 Contact

**Project:** SOMNIA - Sleep Health Monitoring System
**Repository:** https://github.com/Vidyans26/SOMNIA
**Status:** Active Development

---

**"Sleep is not a luxury. Sleep is a necessity. SOMNIA helps you reclaim yours."** 🌙
