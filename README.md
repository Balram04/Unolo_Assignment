# Unolo Field Force Tracker

A web application to track field employee check-ins at client locations with real-time distance calculation, manager dashboards, and daily reports.

---

## ✨ Key Features

- ✅ Employee check-in and check-out at client locations
- ✅ Real-time distance calculation between employee and client
- ✅ Warning shown if employee is more than 500 meters from client
- ✅ Manager dashboard to monitor team activity
- ✅ Daily summary reports with analytics
- ✅ Check-in history with date filters
- ✅ Role-based access (Manager / Employee)
- ✅ JWT-based authentication
- ✅ Responsive UI built with Tailwind CSS

---

## 🛠 Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router

### Backend

- Node.js
- Express.js
- SQLite (better-sqlite3)

### Auth & Security

- JWT authentication
- Password hashing using bcrypt

### Location & Maps

- Browser Geolocation API
- Haversine formula for distance calculation

---

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm run setup
cp .env.example .env
npm run dev
```

**Backend runs on:** http://localhost:3001

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Frontend runs on:** http://localhost:5173

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend` folder:

```env
PORT=3001
JWT_SECRET=your-strong-secret-key
NODE_ENV=development
```

---

## 🧪 Test Credentials

| Role     | Email              | Password    |
|----------|-------------------|-------------|
| Manager  | manager@unolo.com | password123 |
| Employee | rahul@unolo.com   | password123 |
| Employee | priya@unolo.com   | password123 |

---

## 📁 Project Structure

```
starter-code/
├── backend/
│   ├── config/        # Database configuration
│   ├── middleware/    # Auth & role checks
│   ├── routes/        # Auth, check-in, dashboard, reports
│   ├── scripts/       # DB initialization
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/     # Login, Dashboard, Check-in, History
│   │   ├── components/
│   │   └── utils/
├── BUG_FIXES.md
├── QUESTIONS.md
├── RESEARCH.md
└── README.md
```

---

## 🐛 Bugs Fixed

All intentional bugs were identified and fixed, including:

- ❌ Password comparison bug in login
- ❌ JWT security issue (password removed from token)
- ❌ Incorrect HTTP status codes
- ❌ SQL injection vulnerability
- ❌ Latitude/longitude mismatch
- ❌ History page crash
- ❌ Role-based access issues

**👉 See [BUG_FIXES.md](BUG_FIXES.md) for detailed explanations.**

---

## 🚀 New Features

### 1️⃣ Real-Time Distance Calculation

- Distance calculated using Haversine formula
- Stored in database during check-in
- Warning shown if distance > 500 meters
- Visible on check-in page and history page

### 2️⃣ Daily Summary Reports

- Manager-only API
- Per-employee breakdown
- Team-level statistics
- Date and employee filtering supported

**Endpoint:**

```
GET /api/reports/daily-summary
```

---

## 🔒 Security Highlights

- ✅ JWT-based authentication
- ✅ Role-based authorization
- ✅ Parameterized SQL queries (prevents SQL injection)
- ✅ Input validation for dates and required fields

### ⚠️ Future improvements (documented in [QUESTIONS.md](QUESTIONS.md)):

- Token refresh mechanism
- HTTP-only cookies
- Rate limiting
- Logout token invalidation

---

## 🧠 Architecture Decisions

- SQLite used for simplicity and easy setup (production can move to PostgreSQL)
- Distance calculated server-side for consistency
- REST APIs follow proper HTTP status codes
- Clean separation of concerns (routes, middleware, config)

---

## 📚 Additional Docs

- **[BUG_FIXES.md](BUG_FIXES.md)** – All bugs explained with fixes
- **[QUESTIONS.md](QUESTIONS.md)** – Answers on scalability, security, DB design
- **[RESEARCH.md](RESEARCH.md)** – Real-time location tracking architecture

---

## ✅ Assignment Status

- ✔ All bugs fixed
- ✔ Distance calculation implemented
- ✔ Daily summary reports added
- ✔ Research assignment completed
- ✔ Code documented and structured

---

## 📄 License

This project was built as part of the **Unolo Full Stack Intern Assignment**.
