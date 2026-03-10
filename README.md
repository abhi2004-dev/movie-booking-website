# 🎬 Cinéplex — Movie Ticket Booking System

A full-stack movie booking platform with real-time seat locking, Razorpay payments, and a cinematic UI.

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18 + Vite + Framer Motion         |
| Styling    | Tailwind CSS + Custom CSS               |
| Backend    | Node.js + Express                       |
| Database   | PostgreSQL 15                           |
| Cache      | Redis 7                                 |
| Realtime   | Socket.IO                               |
| Payments   | Razorpay                                |
| Auth       | JWT + bcryptjs                          |

---

## 📁 Project Structure
```
movie-booking-website/
├── frontend/        # React + Vite
├── backend/         # Node + Express
├── database/        # SQL schema + seed
└── docker-compose.yml
```

---

## ⚡ Complete Setup — Step by Step

### Step 1 — Prerequisites

Make sure these are installed:
- [Node.js 18+](https://nodejs.org)
- [Docker Desktop](https://docker.com)
- [Git](https://git-scm.com)

---

### Step 2 — Clone the Repo
```bash
git clone https://github.com/abhi2004-dev/movie-booking-website.git
cd movie-booking-website
```

---

### Step 3 — Setup Backend Environment
```bash
cd backend
copy .env.example .env
```

Open `backend/.env` and fill in:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=cineplex_db
DB_USER=postgres
DB_PASSWORD=yourpassword

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx

CLIENT_URL=http://localhost:5173
```

> Get free Razorpay test keys at [razorpay.com](https://razorpay.com) → Dashboard → Settings → API Keys

---

### Step 4 — Start PostgreSQL + Redis via Docker

Run this from the **root** folder:
```bash
docker-compose up -d
```

This will:
- Start PostgreSQL on port `5432`
- Start Redis on port `6379`
- Auto-run `schema.sql` and `seed.sql`
- Seed all 8 movies, 5 venues, 6 screens, and all showtimes

Verify containers are running:
```bash
docker ps
```

You should see `cineplex_postgres` and `cineplex_redis` both **Up**.

---

### Step 5 — Install Backend Dependencies
```bash
cd backend
npm install
```

---

### Step 6 — Start the Backend
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ PostgreSQL connected successfully
✅ Redis connected successfully
```

---

### Step 7 — Install Frontend Dependencies

Open a **new terminal**:
```bash
cd frontend
npm install
```

---

### Step 8 — Start the Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x  ready in 300ms
  ➜  Local: http://localhost:5173/
```

---

### Step 9 — Open the App

Visit **[http://localhost:5173](http://localhost:5173)** 🎉

---

## 🧪 Test the Full Booking Flow

1. **Register** a new account at `/register`
2. **Browse** movies at `/movies`
3. **Click** any movie → select a date + venue + showtime
4. **Pick seats** on the interactive seat grid
5. **Proceed** to payment — fill in contact details
6. **Pay** using Razorpay test card:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits
   - OTP: `1234`
7. **Confirmation** page shows your ticket with QR code
8. **My Bookings** shows all your confirmed tickets

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint             | Description        |
|--------|----------------------|--------------------|
| POST   | /api/auth/register   | Create account     |
| POST   | /api/auth/login      | Login              |
| GET    | /api/auth/profile    | Get profile        |
| PUT    | /api/auth/profile    | Update profile     |

### Movies
| Method | Endpoint                              | Description           |
|--------|---------------------------------------|-----------------------|
| GET    | /api/movies                           | All movies            |
| GET    | /api/movies/trending                  | Top rated             |
| GET    | /api/movies/search?q=pushpa           | Search                |
| GET    | /api/movies/:id                       | Single movie          |
| GET    | /api/movies/:id/showtimes?date=...    | Showtimes by date     |
| GET    | /api/movies/showtimes/:id/seats       | Seat status           |

### Bookings
| Method | Endpoint                   | Description           |
|--------|----------------------------|-----------------------|
| GET    | /api/bookings              | My bookings           |
| GET    | /api/bookings/:id          | Single booking        |
| GET    | /api/bookings/seats/:id    | Seat availability     |
| POST   | /api/bookings/lock         | Lock seats (10 mins)  |
| POST   | /api/bookings              | Create booking        |
| PUT    | /api/bookings/:id/cancel   | Cancel booking        |

### Payments
| Method | Endpoint               | Description           |
|--------|------------------------|-----------------------|
| POST   | /api/payment/order     | Create Razorpay order |
| POST   | /api/payment/verify    | Verify payment        |
| POST   | /api/payment/failed    | Handle failure        |

---

## 🔄 Real-Time Seat Events (Socket.IO)

| Event                 | Direction        | Description                    |
|-----------------------|------------------|--------------------------------|
| `join_showtime`       | Client → Server  | Join a showtime room           |
| `leave_showtime`      | Client → Server  | Leave a showtime room          |
| `lock_seats`          | Client → Server  | Lock selected seats            |
| `unlock_seats`        | Client → Server  | Release seats                  |
| `seats_locked`        | Server → All     | Notify seats are held          |
| `seats_unlocked`      | Server → All     | Notify seats are free          |
| `seats_confirmed`     | Server → All     | Notify seats permanently booked|
| `current_locked_seats`| Server → Client  | Locked seats on room join      |

---

## 🐳 Docker Commands
```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Reset database (wipe + reseed)
docker-compose down -v
docker-compose up -d
```

---

## 🚀 Deployment

| Service    | Platform              |
|------------|-----------------------|
| Frontend   | Vercel                |
| Backend    | Railway or Render     |
| PostgreSQL | Neon.tech             |
| Redis      | Upstash               |

---

## 👥 Team

Built with ❤️ by the Cinéplex team.