# Smart Aadhaar Queue System

A full-stack MERN-style queue management and appointment booking system designed for Aadhaar service centers. The project streamlines appointment scheduling, OTP verification, walk-in token management, and live queue tracking.

---

## Features

- Appointment booking with OTP verification
- Booking confirmation slip generation
- Walk-in token generation
- Real-time token status tracking
- Live queue dashboard with auto-refresh
- Atomic token sequencing per center/day
- Queue progression management

---

## Tech Stack

### Frontend
- React
- Vite

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Testing
- Jest
- Supertest
- mongodb-memory-server

---

## Project Structure

```bash
SmartQ-AI/
│
├── client/        # Frontend React application
├── server/        # Backend API server
└── README.md
```

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/Priyadarshini-A-S/SmartQ-AI.git
cd SmartQ-AI
```

---

# Backend Setup

Navigate to server folder:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create environment file:

```bash
copy .env.example .env
```

Start backend server:

```bash
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

## MongoDB Setup

Ensure MongoDB is running locally:

```bash
mongodb://127.0.0.1:27017
```

Or update the `MONGO_URI` inside `.env`.

Example:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smartq
```

---

# Frontend Setup

Open another terminal:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

In development mode, Vite proxies `/api` requests to:

```bash
http://localhost:5000
```

---

# Running Tests

Navigate to backend:

```bash
cd server
```

Run tests:

```bash
npm test
```

This executes:
- Jest integration tests
- Supertest API tests
- In-memory MongoDB instance

---

# API Endpoints

## Booking APIs

### Request OTP

```http
POST /api/bookings/request-otp
```

### Verify OTP

```http
POST /api/bookings/verify-otp
```

### Get Booking Details

```http
GET /api/bookings/:bookingId
```

---

## Token APIs

### Generate Walk-in Token

```http
POST /api/tokens/walkin
```

### Get Token Status

```http
GET /api/tokens/status/:tokenId
```

### Live Queue Dashboard

```http
GET /api/tokens/live?centerName=...
```

### Advance Queue

```http
POST /api/tokens/advance
```

---

# System Workflow

1. User books appointment
2. OTP verification confirms booking
3. Booking confirmation slip generated
4. Walk-in users receive tokens
5. Live queue dashboard updates automatically
6. Queue progression managed in real time

---

# Development Notes

- OTP is mocked during development and returned as `debugOtp`
- Token numbering is atomic to prevent duplicate tokens
- Queue states:
  - `waiting`
  - `serving`
  - `completed`

---

# Future Improvements

- Aadhaar API integration
- SMS OTP service
- Admin analytics dashboard
- QR-based token scanning
- Multi-center management
- Deployment with Docker

---

# Author

**Priyadarshini A S**  
Computer Science Engineering Student

GitHub:  
https://github.com/Priyadarshini-A-S

---

# License

This project is for educational and prototype purposes.
