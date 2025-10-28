# 🌙 SOMNIA - Sleep Health Monitoring System

> **"Somnia knows your sleep better than you do."**

SOMNIA is an advanced multimodal sleep health monitoring system that analyzes sleep patterns, detects sleep disorders, and provides personalized insights for better sleep quality.

## 🎥 Demo Video

Watch the quick demo here: https://youtu.be/20hAvUPZS0k

---

## 🎯 Overview

SOMNIA is a comprehensive sleep monitoring solution that combines:
- **Audio Analysis**: Detects snoring, sleep talking, and respiratory patterns
- **Movement Tracking**: Monitors sleep positions and restlessness
- **Heart Rate Monitoring**: Tracks cardiovascular health during sleep
- **Sleep Stage Classification**: Identifies REM, NREM, and deep sleep phases
- **Disorder Detection**: Recognizes common sleep disorders like sleep apnea, insomnia, and narcolepsy

The system provides users with actionable insights and personalized recommendations to improve sleep quality and overall health.

For a judge-friendly walkthrough, see:
- Demo guide: [docs/DEMO.md](./docs/DEMO.md)
- API reference: [docs/API.md](./docs/API.md)
- Architecture: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- Model Card: [docs/MODEL_CARD.md](./docs/MODEL_CARD.md)
- Privacy: [docs/PRIVACY.md](./docs/PRIVACY.md)

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

Get SOMNIA up and running in under 5 minutes!

#### Prerequisites
- **Python 3.11+** ([download](https://www.python.org/downloads/))
- **Node.js 18+** ([download](https://nodejs.org/))
- **Git** ([download](https://git-scm.com/))
- **Expo Go App** (for mobile testing)

#### 1. Clone the Repository
```bash
git clone https://github.com/Vidyans26/SOMNIA.git
cd SOMNIA
```

#### 2. Set Up Backend (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
**Backend URL:** http://localhost:8000 (API docs at `/docs`)

#### 3. Set Up Mobile App (React Native)
```bash
cd mobile-app
npm install
npx expo start
```

#### 4. Test It
- Visit http://localhost:8000 in your browser or run `curl http://localhost:8000/` for a health check.
- Open the Expo app on your device to test the mobile interface.

You're all set! 🎉 For detailed setup or troubleshooting, check `docs/SETUP.md`.

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
| GET | `/health` | Root health check |
| GET | `/api/v1/health` | Detailed health check |
| POST | `/api/v1/upload/audio` | Upload audio file |
| POST | `/api/v1/analyze` | Analyze sleep data |
| GET | `/api/v1/disorders` | List all 8 sleep disorders |
| GET | `/api/v1/team` | Team information |
| GET | `/api/v1/demo-analysis` | Demo analysis results |

### Example Request

```bash
curl -X GET http://localhost:8000/api/v1/disorders
```

### Example Response

```json
{
  "total_disorders": 8,
  "disorders": [
    {
      "id": "sleep_apnea",
      "name": "Sleep Apnea & Snoring",
      "description": "Repeated breathing interruptions during sleep (>10 seconds)",
      "prevalence": "30-40 million undiagnosed Indians",
      "symptoms": ["Loud snoring", "Gasping for air", "Daytime fatigue"],
      "risk_level": "HIGH"
    }
    // ... 7 more disorders
  ]
}
```

For comprehensive API documentation, see [API.md](./docs/API.md)

Note: Snoring detection integration code (frozen TensorFlow graph inference) is included and disabled by default behind a feature flag for clean modularity. See the "Snoring Detection" section in [API.md](./docs/API.md) if you want to enable it locally.

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
- Ved Pashine
- Khushbu Sharma
- Dharmesh Sahu
- Vidyans Sankalp

---

## 📚 Documentation

- **[mid-submission.md](./docs/mid-submission.md)** - Comprehensive mid-submission report with progress updates
- **[SETUP.md](./docs/SETUP.md)** - Detailed installation and setup instructions
- **[API.md](./docs/API.md)** - Complete API endpoint documentation
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture and design decisions

---

## 🛠️ Technologies Used

### Backend
- **FastAPI** - Modern web framework for building APIs
- **Python 3.11+** - Core programming language
- **NumPy & SciPy** - Numerical computing
- **Librosa** - Audio analysis
- **TensorFlow/Keras** - Machine learning models
- **Scikit-learn** - ML utilities
- **SQLAlchemy** - Database ORM
- **PyJWT** - JWT authentication

### Mobile
- **Expo** - Development platform for React Native
- **React Native** - Cross-platform mobile framework
- **TypeScript** - Type-safe development
- **Expo Router** - File-based routing
- **Context API** - State management
- **AsyncStorage** - Data persistence
- **Expo Audio/AV** - Audio recording and playback
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
- GitHub repository setup

⏳ **In Progress:**
- Advanced ML models for disorder detection
- Mobile app backend integration
- Real-time data processing
- Comprehensive documentation (50+ pages)
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