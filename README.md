<div align="center">

# 🌿 Vesta AI — AI-Powered Surplus Food Rescue Platform

**Connecting bakeries, cafes & grocery stores with customers and food banks — powered by AI**

[![Live Demo](https://img.shields.io/badge/Live_Demo-bite--back--ai.vercel.app-22c55e?style=for-the-badge&logo=vercel&logoColor=white)](https://bite-back-ai.vercel.app)
[![Java](https://img.shields.io/badge/Java_21-Spring_Boot_3.3-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/Python_3.11-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_19-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Google-Gemini_1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)

![Vesta AI Screenshot](https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=1200&h=400&fit=crop)

**👉 [Try the live demo](https://bite-back-ai.vercel.app) — log in instantly with one click (no sign-up needed)**

</div>

---

## 🧠 What is Vesta AI?

**Vesta AI** is a full-stack, AI-driven platform that tackles food waste. Every day, surplus food is discarded while millions face food insecurity. Vesta AI bridges this gap by:

- 📷 **Scanning shop shelves with AI** — Gemini 1.5 Flash identifies food items from a photo in seconds
- 💡 **Suggesting smart markdown prices** — a multi-factor pricing engine calculates the optimal discount based on expiry time, time of day, foot traffic, and quantity
- 🤝 **Matching surplus to food banks** — food banks are alerted in real-time when donations match their dietary requirements
- 🌍 **Tracking environmental impact** — CO₂ saved and meals rescued are tracked for every transaction

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                 React 19 + Vite  (Vercel)                            │
│         Landing · Browse · Shop Dashboard · Food Bank Dashboard      │
└──────────────────────┬───────────────────────────────────────────────┘
                       │  REST + WebSocket/STOMP  (via Vercel proxy)
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│              Spring Boot 3.3  (Render)                               │
│  /api/auth  /api/surplus  /api/claims  /api/donations                │
│  /api/impact  /api/users  /api/ai (internal proxy)                   │
│              PostgreSQL  ·  JWT  ·  WebSocket                        │
└──────────────────────┬───────────────────────────────────────────────┘
                       │  HTTP (internal)
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│              FastAPI AI Microservice  (Render)                       │
│   POST /scan   →  Gemini 1.5 Flash (image → structured JSON)         │
│   POST /price  →  Multi-factor markdown pricing algorithm            │
└──────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🏪 For Shop Owners
| Feature | Description |
|---------|-------------|
| **AI Inventory Scanner** | Point camera at shelf → Gemini identifies all food items, quantities & dietary tags automatically |
| **Smart Markdown Pricing** | AI suggests optimal discount based on hours-to-expiry, time of day, foot traffic & quantity |
| **Surplus Listings** | Post, edit, and manage surplus food listings with one click |
| **Impact Dashboard** | Track CO₂ saved, meals rescued, and revenue recovered in real time |
| **Real-time Notifications** | WebSocket alerts when food banks claim a donation |

### 👤 For Customers
| Feature | Description |
|---------|-------------|
| **Browse Surplus** | Filter by category, dietary tags (Vegan, Halal, Gluten-Free, etc.) |
| **Claim Items** | Reserve surplus bags at up to 70% off before they expire |

### 🏦 For Food Banks
| Feature | Description |
|---------|-------------|
| **Donation Requests** | Post specific dietary-matched food needs |
| **Smart Matching** | Get alerted only when donations match your requirements |
| **Food Bank Dashboard** | View incoming donations, manage collection slots |

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 🏪 **Shop Owner** | `shop@demo.com` | `demo123` | Scanner, listings, impact |
| 👤 **Customer** | `customer@demo.com` | `demo123` | Browse & claim |
| 🏦 **Food Bank** | `foodbank@demo.com` | `demo123` | Donation dashboard |

---

## 🛠️ Tech Stack

### Backend — `backend/` (Spring Boot)
| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 3.3.4 |
| Security | Spring Security 6 + JWT (JJWT 0.12) |
| ORM | Spring Data JPA / Hibernate 6 |
| Database | PostgreSQL (prod) · H2 (tests) |
| Migrations | Flyway |
| Real-time | Spring WebSocket + STOMP |
| Build | Maven (mvnw wrapper) |

### AI Microservice — `ai-service/` (FastAPI)
| Layer | Technology |
|-------|-----------|
| Language | Python 3.11 |
| Framework | FastAPI |
| Server | Uvicorn |
| Vision AI | Google Gemini 1.5 Flash |
| Image Processing | Pillow |
| Tests | pytest + httpx |

### Frontend — `frontend/` (React)
| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite |
| Routing | React Router v7 |
| HTTP Client | Axios |
| WebSocket | STOMP.js + SockJS |
| Animations | Framer Motion |
| Charts | Recharts |
| Notifications | react-hot-toast |
| Hosting | Vercel (with API reverse proxy) |

---

## 📁 Project Structure

```
BiteBack-AI/
├── frontend/                          # React 19 + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── BrowsePage.jsx
│   │   │   ├── ShopDashboard.jsx
│   │   │   ├── AIScannerPage.jsx
│   │   │   ├── ImpactDashboard.jsx
│   │   │   └── FoodBankDashboard.jsx
│   │   ├── components/Navbar.jsx
│   │   ├── AuthContext.jsx
│   │   └── api.js
│   ├── vercel.json                    # SPA rewrites + API proxy rules
│   └── vite.config.js
│
├── ai-service/                        # FastAPI AI Microservice
│   ├── main.py
│   ├── requirements.txt
│   ├── tests/
│   │   ├── test_price.py
│   │   └── test_scan.py
│   └── routers/
│       ├── scan.py                    # Gemini 1.5 Flash image scanner
│       └── price.py                   # Multi-factor markdown pricing engine
│
├── backend/                           # Spring Boot Backend
│   └── src/main/java/com/vesta/vestaai/
│       ├── controller/
│       ├── model/                     # JPA entities
│       ├── repository/
│       ├── security/                  # JWT filter + SecurityConfig
│       ├── config/                    # WebSocket STOMP config
│       └── DataSeeder.java
│
└── docker-compose.yml                 # Local dev: Postgres + backend + ai-service
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account (SHOP / CUSTOMER / FOOD_BANK) |
| POST | `/api/auth/login` | Returns JWT token |
| GET | `/api/auth/me` | Get current user profile |

### Surplus
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/surplus` | Public | List all available surplus |
| GET | `/api/surplus/my` | SHOP | Your listings |
| POST | `/api/surplus` | SHOP | Create listing |
| PATCH | `/api/surplus/{id}` | SHOP | Update listing |
| DELETE | `/api/surplus/{id}` | SHOP | Delete listing |

### AI
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/scan` | SHOP | Scan shelf image → item list |
| POST | `/api/ai/price` | Auth | Smart markdown suggestion |

### WebSocket
| Topic | Event |
|-------|-------|
| `/topic/new-surplus` | Broadcast when new item posted |

---

## 🧩 AI Pricing Algorithm

The pricing engine (`ai-service/routers/price.py`) uses a multi-factor model:

```
Urgency Tier (hours until expiry):
  ≤ 1h  → CRITICAL → 70% base discount
  ≤ 2h  → HIGH     → 55% base discount
  ≤ 4h  → MEDIUM   → 40% base discount
  > 4h  → LOW      → 25% base discount

Adjustments:
  🕛 Peak hours (lunch/dinner) → −5%
  🌙 Late night / early AM     → +8%
  📦 High quantity (>20)       → +5%
  📦 Low quantity (≤3)         → −5%
  📉 Slow-moving category      → +8%
  📈 Fast-moving category      → −5%

Final price = max(original × (1 − discount), £0.50)
```

---

## 🛠 Local Development

### Prerequisites
- **Java 21+**
- **Python 3.10+**
- **Node.js 18+**
- **Docker & Docker Compose** (for local Postgres)
- A free [Google Gemini API key](https://aistudio.google.com/app/apikey) (optional — mock mode works without it)

### 1. Clone
```bash
git clone https://github.com/dharmendra26-wiz/BiteBack-AI.git
cd BiteBack-AI
```

### 2. Configure environment
```bash
# AI service
cp ai-service/.env.example ai-service/.env
# Edit ai-service/.env and add your GEMINI_API_KEY (optional)

# Backend (auto-configured via Docker Compose)
cp backend/.env.example backend/.env
```

### 3. Start with Docker Compose (recommended)
```bash
docker-compose up
```
This starts Postgres, the Spring Boot backend, and the FastAPI AI service in one command.

### 4. Start the frontend
```bash
cd frontend
npm install
npm run dev
```
> ✅ App at http://localhost:5173 · Backend at http://localhost:8080 · AI at http://localhost:8000

### Manual startup (without Docker)
```bash
# Terminal 1 — AI service
cd ai-service && pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Backend (requires local Postgres on port 5432)
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Terminal 3 — Frontend
cd frontend && npm run dev
```

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">
  Made with 💚 to fight food waste · Java + Python + React + Gemini AI
</div>
