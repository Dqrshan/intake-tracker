# Intake Tracker - AI-Powered Nutrition & Health Companion

A modern, production-ready Progressive Web App (PWA) for tracking meals, calories, medications, and receiving AI-powered nutrition insights using **Google Gemini AI**.

![Intake Tracker](https://img.shields.io/badge/Powered%20by-Gemini%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

## ✨ Features

### 🍽️ Smart Meal Logging
- **📷 Camera Capture**: Take photos of your food for instant AI analysis
- **📁 Image Upload**: Upload food photos for nutrition detection
- **⚡ Quick Log**: Type what you ate in natural language
- **📝 Detailed Description**: Describe complex meals for accurate tracking

### 🤖 Gemini AI Integration
- **Food Recognition**: Automatically identify foods from images
- **Nutrition Analysis**: Get accurate calorie and macro estimates
- **Natural Language Processing**: Log meals by just describing them
- **AI Nutrition Chat**: Ask questions about diet, nutrition, and health
- **Personalized Tips**: Receive context-aware health suggestions

### 📊 Comprehensive Tracking
- **Daily Goals**: Set and track calorie & macro targets
- **Progress Visualization**: Beautiful animated charts and rings
- **Meal History**: View all logged meals with detailed nutrition info
- **Weekly/Monthly Reports**: Generate PDF health reports

### 💊 Medication Management
- **Schedule Tracking**: Set medication times and dosages
- **Take Reminders**: Track when medications are due
- **Adherence Reports**: Monitor medication compliance
- **Contraindication Alerts**: Warning for known drug-food interactions

### 🌙 Modern UI/UX
- **Dark Theme**: Beautiful glassmorphism design
- **Responsive**: Works on mobile, tablet, and desktop
- **PWA**: Install as a native app
- **Offline Support**: Core features work without internet

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MySQL database
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/intake-tracker.git
cd intake-tracker
```

2. **Set up the backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Set up the frontend**
```bash
cd frontend
npm install
```

4. **Configure environment variables**

Create `frontend/.env`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/intake_tracker"
ML_SERVICE_URL="http://localhost:8001"
GEMINI_API_KEY="your-gemini-api-key-here"
```

Create `backend/.env`:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

5. **Initialize the database**
```bash
cd frontend
npx prisma db push
npx prisma generate
```

6. **Start the application**

Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate
python ml.py
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Screenshots

| Dashboard | Meal Logging | AI Chat |
|-----------|--------------|---------|
| ![Dashboard](docs/dashboard.png) | ![Capture](docs/capture.png) | ![Chat](docs/chat.png) |

## 🏗️ Architecture

```
intake-tracker/
├── backend/
│   ├── ml.py              # FastAPI backend with Gemini AI
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   │   ├── api/       # API routes
│   │   │   ├── capture/   # Meal logging page
│   │   │   ├── meds/      # Medication tracking
│   │   │   └── report/    # Health reports
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities
│   ├── prisma/            # Database schema
│   └── public/            # Static assets
└── README.md
```

## 🔧 API Endpoints

### Backend (Python/FastAPI)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/infer` | POST | Analyze food image with Gemini Vision |
| `/analyze-text` | POST | Analyze meal description text |
| `/quick-log` | POST | Quick single-food analysis |
| `/nutrition-chat` | POST | AI nutrition chatbot |
| `/suggest-meals` | POST | Get meal suggestions |

### Frontend (Next.js API Routes)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/meal` | GET/POST | List/create meals |
| `/api/medicine` | GET/POST | List/create medications |
| `/api/medicine/[id]` | DELETE | Delete medication |
| `/api/medicine/[id]/take` | PATCH | Mark medication as taken |
| `/api/infer` | POST | Forward to ML service |
| `/api/analyze-text` | POST | Forward to ML service |
| `/api/nutrition-chat` | POST | Forward to ML service |

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Python, FastAPI, Google Generative AI
- **Database**: MySQL with Prisma ORM
- **AI**: Google Gemini 1.5 Flash
- **PDF**: pdf-lib for report generation
- **PWA**: next-pwa with Workbox

## 📄 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string | Yes |
| `ML_SERVICE_URL` | Backend API URL | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |

## 🔐 Security

- All API keys are stored in environment variables
- PDF reports can be password-protected
- No sensitive data is logged
- CORS is configured for production

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powerful AI capabilities
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling
- [Prisma](https://prisma.io/) for database management

