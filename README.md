# Smart Aadhaar Queue System

This is a full-stack MERN-style project for:
- Appointment booking with OTP confirmation
- Booking confirmation slip
- Walk-in token generation
- Token status tracking
- Live queue dashboard with auto refresh

## Tech Stack
- Client: React + Vite
- Server: Node.js + Express
- Database layer: MongoDB + Mongoose models

## Project Structure
- `client/` - customer side UI prototype
- `server/` - API for bookings, OTP and queue status

## Run the Project

### 1. Backend
```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Backend starts at `http://localhost:5000`.

Before running backend, ensure MongoDB is running locally on `mongodb://127.0.0.1:27017` or update `MONGO_URI` in `.env`.

### 2. Frontend
```bash
cd client
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`.
In development, Vite proxies `/api` requests to backend `http://localhost:5000`.

## Run Automated Tests

### Backend API tests
```bash
cd server
npm test
```

This runs Jest + Supertest integration tests against an in-memory MongoDB instance.

## API Endpoints
- `POST /api/bookings/request-otp`
- `POST /api/bookings/verify-otp`
- `GET /api/bookings/:bookingId`
- `POST /api/tokens/walkin`
- `GET /api/tokens/status/:tokenId`
- `GET /api/tokens/live?centerName=...`
- `POST /api/tokens/advance`

## Notes
- OTP is mocked for development and returned as `debugOtp`.
- Token sequencing is atomic per center/day to avoid duplicate token numbers.
- Queue advance updates token progression (`waiting` -> `serving` -> `completed`).