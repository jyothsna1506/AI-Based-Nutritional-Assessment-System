# 🥗 AI-Based Nutritional Assessment System

An AI-powered full-stack application that assesses nutritional deficiencies, generates personalised meal plans, and tracks dietary habits. Built with **FastAPI**, **React + Vite**, and **scikit-learn** Random Forest models.

### Live Platform: [ai-based-nutritional-assessment-sys.vercel.app](https://ai-based-nutritional-assessment-sys.vercel.app)
---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend  React 18 + Vite + Tailwind v4 + Framer Motion│
│  http://localhost:5173                                   │
└───────────────────────┬─────────────────────────────────┘
                        │  REST / JSON
┌───────────────────────▼─────────────────────────────────┐
│  Backend   FastAPI + SQLAlchemy + SQLite                 │
│  http://localhost:8000                                   │
│                                                          │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────────┐  │
│  │ Auth (JWT)  │  │ ML Layer │  │ External APIs      │  │
│  │ BCrypt hash │  │ 6× RF    │  │ Spoonacular recipes│  │
│  └─────────────┘  └──────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧬 **Deficiency Prediction** | 6 Random Forest models predict Iron, Vitamin D, Calcium, Magnesium, Potassium, and Riboflavin deficiencies |
| 🍽️ **Smart Meal Planner** | Generates 7-day personalised meal plans targeting detected deficiencies with diet preference (veg/non-veg/vegan) |
| 📄 **Blood Report Parser** | Upload PDF/image blood reports — OCR + regex extract biomarkers automatically |
| 📊 **Dashboard** | Real-time nutrient summary, deficiency risk cards, food diary tracking |
| 🔬 **Symptom Assessment** | Submit 14 symptoms rated 0-5 for AI-driven analysis |
| 🔍 **Food Scanner** | QR code barcode scanner for food lookup |
| 👑 **Admin Panel** | User management, food database CRUD, analytics, prediction reports |

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Tesseract OCR** (for blood report image parsing)
  - Windows: [UB-Mannheim Tesseract](https://github.com/UB-Mannheim/tesseract/wiki)
  - Ubuntu: `sudo apt install tesseract-ocr`
  - macOS: `brew install tesseract`

### 1. Clone & Configure

```bash
git clone <repo-url>
cd AI-Based-Nutritional-Assessment-System
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env
# Edit .env and fill in:
#   JWT_SECRET  (generate with: python -c "import secrets; print(secrets.token_hex(32))")
#   SPOONACULAR_API_KEY  (from https://spoonacular.com/food-api)

# Seed admin user (optional)
python seed_admin.py

# Start the API server
uvicorn backend.app.main:app --reload --port 8000
```

API docs available at: **http://localhost:8000/docs**

### 3. Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend available at: **http://localhost:5173**

> The Vite dev server proxies `/api` requests to `http://localhost:8000` automatically.

---

## 🔑 Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ Yes | 64-char random hex string for signing JWTs |
| `JWT_ALGORITHM` | No | Default: `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Default: `1440` (24h) |
| `DATABASE_URL` | No | Default: `sqlite:///./nutrition.db` |
| `SPOONACULAR_API_KEY` | No | For recipe suggestions in meal plans |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins, default: `http://localhost:5173` |
| `MODEL_DIR` | No | Path to ML model `.joblib` files |
| `FOOD_CSV_PATH` | No | Path to the food nutrition CSV dataset |

---

## 🤖 ML Models

Located in `ml/saved_models/`. Six Random Forest classifiers predict:

| Model Key | Deficiency | DB Column |
|-----------|-----------|-----------|
| `Iron_Anemia_Deficiency` | Iron / Anemia | `iron_risk` |
| `Vitamin_D_Deficiency` | Vitamin D | `vitamin_d_risk` |
| `SCA_Deficiency` | Calcium | `calcium_risk` |
| `MAGN_Deficiency` | Magnesium | `magnesium_risk` |
| `SK_Deficiency` | Potassium | `potassium_risk` |
| `R_Deficiency` | Riboflavin (B2) | `vitamin_b12_risk`* |

> *Riboflavin risk is stored in `vitamin_b12_risk` due to current schema constraints.

**Feature inputs:** age, gender, BMI, 8 blood markers, 8 symptom scores.

---

## 📂 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/          API route handlers
│   │   ├── auth/         JWT & password hashing
│   │   ├── config/       Settings (env-based)
│   │   ├── database/     SQLAlchemy engine & session
│   │   ├── ml/           Prediction engine, meal recommender
│   │   ├── models/       ORM models (9 tables)
│   │   ├── schemas/      Pydantic v2 request/response schemas
│   │   └── services/     Spoonacular, OpenFoodFacts, food seeder
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/   Reusable UI (layout, charts, forms)
│       ├── context/      AuthContext (JWT state)
│       ├── pages/        14 user pages + 6 admin pages
│       ├── routes/       AppRouter (protected + admin guards)
│       └── services/     Axios API client + service modules
├── ml/
│   ├── datasets/         Raw & processed food nutrition data
│   ├── notebooks/        Training notebooks
│   ├── saved_models/     Trained .joblib model files
│   └── training/         Training scripts
├── database/
│   └── schema.sql        Reference schema (SQLite)
└── docs/
    └── AI-Based Nutritional Assessment System.pdf
```

---

## 🛡️ Security Notes

- JWT secrets must be set via environment variable — the app refuses to start without one
- Never commit `backend/.env` to version control (it's in `.gitignore`)
- Admin endpoints require `ADMIN` or `SUPER_ADMIN` role enforced server-side
- CORS is restricted to explicit allowed origins (configurable via `ALLOWED_ORIGINS`)

---

## 📋 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login → JWT token |
| GET | `/api/auth/user` | JWT | Get current user |
| POST | `/api/profile/health` | JWT | Create/update health profile |
| POST | `/api/assessment/symptoms` | JWT | Submit symptoms |
| POST | `/api/assessment/blood-report/parse` | None | Parse PDF/image blood report |
| POST | `/api/assessment/predict` | JWT | Run deficiency prediction |
| GET | `/api/meal-plan/weekly` | JWT | Get/generate weekly meal plan |
| POST | `/api/meal-plan/regenerate` | JWT | Force new meal plan |
| GET | `/api/foods/search` | None | Search food database |
| POST | `/api/food-diary` | JWT | Log food entry |
| GET | `/api/dashboard` | JWT | Aggregated dashboard stats |
| GET | `/api/admin/users` | ADMIN | List all users |

Full interactive docs: **http://localhost:8000/docs**
