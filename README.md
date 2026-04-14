# ✈️ TripFusion

## Project Overview

TripFusion is a full-stack, AI-powered travel platform built to simplify and elevate the trip planning experience. Users can explore curated travel packages, generate fully customized itineraries powered by Google Gemini AI,Amadeus api(Real time FLIGHTS and HOTELS data), unSplash(For Imaages), Weather  and manage their bookings end-to-end. The platform features role-based access with dedicated dashboards for users and administrators, real-time support chat via WebSockets, Google OAuth authentication, and automated transactional email notifications — delivering a seamless, modern travel planning solution.

---

## Key Features

- 🤖 **AI-Powered Itinerary Generation** — Generate personalized trip plans using Google Gemini AI with real-time Amadeus flight, hotel, weather, and POI data
- 📦 **Curated Travel Packages** — Browse, filter, and book pre-built travel packages with image galleries and detailed breakdowns
- 📊 **Role-Based Dashboards** — Separate user and admin dashboards with analytics, booking management, and package controls
- 💬 **Real-Time Support Chat** — Live customer support via Socket.IO with Redis-backed scalability
- 🔐 **Google OAuth + JWT Authentication** — Secure login with Google OAuth 2.0 and token-based session management
- ⚡ **Rate Limiting & Redis Caching** — Request throttling and intelligent caching with Redis for optimized performance
- 🖼️ **Cloudinary Image Uploads** — Cloud-based media management for package and profile images
- 📧 **Transactional Email Notifications** — Automated emails for bookings, approvals, cancellations, and password resets via Brevo
- ❤️ **Favorites System** — Save and manage favorite travel packages
- 🔑 **Forgot & Reset Password** — Secure password recovery flow with token-based verification
- 📈 **Admin Analytics** — Dashboard summaries with booking stats, revenue tracking, and user insights via Recharts

---

## Tech Stack

**Frontend:** React 19 (Vite), Tailwind CSS, Framer Motion, GSAP, Recharts, Socket.IO Client, React Router, Axios

**Backend:** Node.js, Express 5, MongoDB (Mongoose), Redis, Socket.IO, Google Gemini AI, Cloudinary, Brevo, JWT

---

## Installation

```bash
# Clone the repository
git clone https://github.com/JAWADAHMAD-18/FYP-project
cd fyp
```

**Frontend:**

```bash
cd frontend
npm install
```

**Backend:**

```bash
cd backend
npm install
```

---

## Running the Project

**Frontend:**

```bash
cd frontend
npm run dev
```

**Backend:**

```bash
cd backend
npm run dev
```

---

## Project Structure

```
TripFusion/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/                  # Axios instance & base config
│   │   ├── assets/               # Static assets (images, icons)
│   │   ├── components/
│   │   │   ├── BookingPage/      # Booking flow components
│   │   │   ├── Cards/            # Reusable card components
│   │   │   ├── ChatBot/          # AI chatbot interface
│   │   │   ├── Loader/           # Loading spinners & skeletons
│   │   │   ├── admin/            # Admin-specific components
│   │   │   ├── adminDashboard/   # Admin dashboard widgets
│   │   │   ├── buttons/          # Reusable button components
│   │   │   ├── customPackage/    # Custom trip builder components
│   │   │   ├── dashboard/        # User dashboard components
│   │   │   ├── header/           # Navigation & header
│   │   │   ├── inputs/           # Form input components
│   │   │   └── ui/               # Shared UI primitives
│   │   ├── context/              # Auth & Toast context providers
│   │   ├── customHook/           # Custom React hooks
│   │   ├── features/
│   │   │   └── supportChat/      # Real-time support chat feature
│   │   ├── pages/
│   │   │   ├── admin/            # Admin pages
│   │   │   ├── booking/          # Booking pages
│   │   │   ├── dashboard/        # User dashboard pages
│   │   │   └── packages/         # Package listing & detail pages
│   │   ├── routes/               # Protected & admin route guards
│   │   ├── sections/             # Page sections (hero, footer, etc.)
│   │   ├── services/             # API service layers
│   │   └── utils/                # Utility functions
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── public/
│   ├── src/
│   │   ├── Auth/                 # OAuth authentication logic
│   │   ├── Sockets/              # Socket.IO setup & chat handlers
│   │   ├── config/               # Redis, Brevo & Amadeus configs
│   │   ├── controllers/
│   │   │   ├── admin.controllers.js
│   │   │   ├── adminBooking.controllers.js
│   │   │   ├── adminDashboardSummary.controllers.js
│   │   │   ├── auth.controllers.js
│   │   │   ├── booking.controllers.js
│   │   │   ├── chatBot.controller.js
│   │   │   ├── customPackage.controllers.js
│   │   │   ├── favorite.controller.js
│   │   │   ├── package.controllers.js
│   │   │   ├── realtimeChat.controllers.js
│   │   │   ├── travelSummary.controllers.js
│   │   │   └── users.controllers.js
│   │   ├── db/                   # MongoDB connection
│   │   ├── middleware/
│   │   │   ├── admin.middleware.js
│   │   │   ├── auth.middleware.js
│   │   │   ├── cloudinary.middleware.js
│   │   │   ├── optionalAuth.middleware.js
│   │   │   ├── socketAuth.middleware.js
│   │   │   └── socketRateLimiter.middleware.js
│   │   ├── models/
│   │   │   ├── booking.models.js
│   │   │   ├── conversation.models.js
│   │   │   ├── customizePackage.model.js
│   │   │   ├── favorite.models.js
│   │   │   ├── message.models.js
│   │   │   ├── packages.models.js
│   │   │   └── users.models.js
│   │   ├── routes/               # Express route definitions
│   │   ├── services/             # Business logic (chat, AI, email)
│   │   ├── utills/               # Helpers (cache, Gemini, Redis, etc.)
│   │   ├── app.js                # Express app setup
│   │   └── index.js              # Server entry point
│   └── package.json
│
└── README.md
```

---
