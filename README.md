<div align="center">

# 🌿 Vesta AI — AI-Powered Surplus Food Rescue Platform

**Connecting bakeries, cafes & grocery stores with customers and food banks — powered by AI**

[![Java](https://img.shields.io/badge/Java_26-Spring_Boot_3.3-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/Python_3.11-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_19-Vite_8-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Google-Gemini_1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)

![Vesta AI Screenshot](https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=1200&h=400&fit=crop)

</div>

---

## 🧠 What is Vesta AI?

**Vesta AI** is a full-stack, AI-driven platform that tackles the UK's food waste crisis. Every day, millions of tonnes of surplus food go to waste while 8.1 million people face food insecurity. Vesta AI bridges this gap by:

- 📷 **Scanning shop shelves with AI** — Gemini 1.5 Flash identifies food items from a photo in seconds
- 💡 **Suggesting smart markdown prices** — a rule-based AI engine calculates the optimal discount based on expiry time, time of day, and quantity
- 🤝 **Matching surplus to food banks** — food banks are alerted in real-time when donations match their dietary requirements
- 🌍 **Tracking environmental impact** — CO₂ saved and meals rescued are tracked for every transaction

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                           │
│              React 19 + Vite 8 (localhost:5173)                 │
│         (Landing, Browse, Shop Dashboard, Food Bank)            │
└────────────────────────┬────────────────────────────────────────┘
                         │  REST + WebSocket (STOMP)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Spring Boot 3.3 Backend                        │
│              Java 26 + JWT Auth (localhost:8080)                │
│    /api/auth  /api/surplus  /api/claims  /api/donations         │
│    /api/impact  /api/users  /api/ai (proxy)                     │
│                     H2 In-Memory DB                             │
└────────────────────────┬────────────────────────────────────────┘
                         │  HTTP (internal proxy)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FastAPI AI Microservice                         │
│              Python 3.11 + Uvicorn (localhost:8000)             │
│    POST /scan   →  Gemini 1.5 Flash (image → JSON items)        │
│    POST /price  →  Smart markdown pricing algorithm             │
└─────────────────────────────────────────────────────────────────┘
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

## 🛠️ Tech Stack

### Backend — `vesta-ai/` (Spring Boot)
| Layer | Technology |
|-------|-----------|
| Language | Java 26 |
| Framework | Spring Boot 3.3.4 |
| Security | Spring Security + JWT (JJWT) |
| ORM | Spring Data JPA / Hibernate 6 |
| Database | H2 (in-memory, dev) |
| Real-time | Spring WebSocket + STOMP |
| Build | Maven (mvnw wrapper) |

### AI Microservice — `ai-service/` (FastAPI)
| Layer | Technology |
|-------|-----------|
| Language | Python 3.11 |
| Framework | FastAPI 0.111 |
| Server | Uvicorn |
| Vision AI | Google Gemini 1.5 Flash |
| Image Processing | Pillow |
| ML Utilities | scikit-learn, NumPy |

### Frontend — `frontend/` (React)
| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| WebSocket | STOMP.js + SockJS |
| Animations | Framer Motion 12 |
| Charts | Recharts |
| Notifications | react-hot-toast |

---

## 🚀 Quick Start

### Prerequisites
- **Java 21+** (tested on Java 26)
- **Python 3.10+**
- **Node.js 18+**
- A **free** [Google Gemini API key](https://aistudio.google.com/app/apikey) (optional — app works in demo mode without it)

### 1. Clone the repository
```bash
git clone https://github.com/dharmendra26-wiz/BiteBack-AI.git
cd BiteBack-AI
```

### 2. Start the AI Microservice (Terminal 1)
```bash
cd ai-service
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY (optional)

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
> ✅ Running at http://localhost:8000 | API docs: http://localhost:8000/docs

### 3. Start the Spring Boot Backend (Terminal 2)
```bash
cd vesta-ai/vesta-ai
./mvnw spring-boot:run       # Linux/Mac
# OR
.\mvnw.cmd spring-boot:run   # Windows
```
> ✅ Running at http://localhost:8080 | H2 Console: http://localhost:8080/h2-console
>
> 🌱 **Demo data auto-seeded on startup!**

### 4. Start the React Frontend (Terminal 3)
```bash
cd frontend
npm install
npm run dev
```
> ✅ Running at http://localhost:5173

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 🏪 **Shop Owner** | `shop@demo.com` | `demo123` | Scanner, listings, impact |
| 👤 **Customer** | `customer@demo.com` | `demo123` | Browse & claim |
| 🏦 **Food Bank** | `foodbank@demo.com` | `demo123` | Donation dashboard |

---

## 📁 Project Structure

```
BiteBack-AI/
├── frontend/                          # React 19 + Vite 8
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx        # Public marketing page
│   │   │   ├── LoginPage.jsx          # JWT auth
│   │   │   ├── RegisterPage.jsx       # Role-based registration
│   │   │   ├── BrowsePage.jsx         # Public surplus marketplace
│   │   │   ├── ShopDashboard.jsx      # Shop management + AI pricing
│   │   │   ├── AIScannerPage.jsx      # Gemini vision scanner
│   │   │   ├── ImpactDashboard.jsx    # CO₂ & meals impact tracker
│   │   │   └── FoodBankDashboard.jsx  # Donation management
│   │   ├── components/Navbar.jsx      # Authenticated nav
│   │   ├── AuthContext.jsx            # Global JWT auth state
│   │   └── api.js                     # Axios client + interceptors
│   └── vite.config.js
│
├── ai-service/                        # FastAPI AI Microservice
│   ├── main.py                        # App entry + CORS
│   ├── requirements.txt
│   └── routers/
│       ├── scan.py                    # Gemini 1.5 Flash image scanner
│       └── price.py                   # Smart markdown pricing engine
│
└── vesta-ai/vesta-ai/                 # Spring Boot Backend
    └── src/main/java/com/vesta/vestaai/
        ├── controller/
        │   ├── AuthController.java    # JWT register/login/me
        │   ├── SurplusController.java # CRUD + WebSocket broadcast
        │   ├── ClaimController.java   # Customer claim flow
        │   ├── DonationController.java# Food bank donation requests
        │   ├── ImpactController.java  # Environmental metrics
        │   └── AiController.java      # Proxy to AI microservice
        ├── model/                     # JPA entities (User, SurplusItem, Claim, Donation, ImpactRecord)
        ├── repository/                # Spring Data JPA repositories
        ├── security/                  # JWT filter + config (SecurityConfig)
        ├── config/                    # WebSocket STOMP config
        └── vestaai/DataSeeder.java    # Auto-seeds demo data on startup
```

---

## 🔌 API Reference

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account (SHOP / CUSTOMER / FOOD_BANK) |
| POST | `/api/auth/login` | Returns JWT token |
| GET | `/api/auth/me` | Get current user profile |

### Surplus Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/surplus` | Public | List all available surplus |
| GET | `/api/surplus?category=Bakery` | Public | Filter by category |
| GET | `/api/surplus/my` | SHOP | Get your listings |
| POST | `/api/surplus` | SHOP | Create new listing |
| PATCH | `/api/surplus/{id}` | SHOP | Update listing |
| DELETE | `/api/surplus/{id}` | SHOP | Delete listing |

### AI Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/scan` | SHOP | Scan shelf image → item list |
| POST | `/api/ai/price` | Auth | Get smart markdown suggestion |

### WebSocket
| Topic | Event |
|-------|-------|
| `/topic/new-surplus` | Broadcast when new item posted |

---

## 🧩 AI Pricing Algorithm

The markdown pricing engine (`ai-service/routers/price.py`) uses a multi-factor scoring model:

```
Urgency Tier (hours until expiry):
  ≤ 1h  → CRITICAL → 70% base discount
  ≤ 2h  → HIGH     → 55% base discount
  ≤ 4h  → MEDIUM   → 40% base discount
  > 4h  → LOW      → 25% base discount

Adjustments:
  🕛 Peak hours (lunch/dinner) → -5% (less urgency to discount)
  🌙 Late night / early AM     → +8% (maximize clearance)
  📦 High quantity (>20)       → +5% (need to move volume)
  📦 Low quantity (≤3)         → -5% (scarcity, less incentive)
  📉 Slow-moving category      → +8%
  📈 Fast-moving category      → -5%

Final price = max(original × (1 - discount), £0.50)
```

---

## 🌱 Environmental Impact Tracking

Each surplus item has a `co2Saved` field (kg). On the Impact Dashboard:
- **CO₂ Saved** — sum of co2Saved across all rescued items
- **Meals Rescued** — total quantity claimed/donated
- **Money Saved** — difference between original and discounted prices

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">
  Made with 💚 to fight food waste · Built with Java + Python + React + Gemini AI
</div>
