# BuildEstate — Real Estate & Construction Management MVP

BuildEstate is a modern, lightweight, and scalable Real Estate and Construction Management platform. Built on a clean client-server architecture using Vite + React on the frontend, and Node.js + Express + Prisma + PostgreSQL on the backend.

---

## 🏗️ Folder Structure

```
BuildEstate/
├── client/                 # React + Vite Frontend (Port 3000)
│   ├── src/
│   │   ├── components/     # UI elements (Navbar, Footer, Modals)
│   │   ├── context/        # Auth & Light/Dark Mode state handlers
│   │   ├── pages/          # Views (Marketplace, Detail Page, Dashboards)
│   │   ├── services/       # Axios API integration
│   │   ├── App.jsx         # App router and layout wrapper
│   │   └── main.jsx        # App entry point
├── server/                 # Express.js Backend (Port 5000)
│   ├── config/             # Prisma client setup
│   ├── controllers/        # API request logic (Auth, Properties, Bookings)
│   ├── middleware/         # JWT Auth and multer upload helpers
│   ├── routes/             # REST endpoints (auth, properties, bookings)
│   ├── prisma/             # Schema configuration and database seed scripts
│   └── server.js           # API entry point
└── README.md
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, React Hook Form, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express.js, Prisma ORM, JWT, bcryptjs, Multer
- **Database**: PostgreSQL

---

## 🔑 Demo Login Credentials

You can test all user roles using the pre-seeded credentials. All accounts share the same password:

**Password**: `Password@123`

| Role | Email | Dashboard Features |
| :--- | :--- | :--- |
| **Admin** | `admin@buildestate.in` | Global stats, user listing, delete/moderate accounts |
| **Builder** | `builder@buildestate.in` | List properties, create construction projects, approve bookings |
| **Buyer** | `buyer@buildestate.in` | Search properties, mock booking checkouts, view payments ledger |

---

## 🚀 Local Run Guide

### Prerequisites
1. **Node.js** (v20+ recommended)
2. **PostgreSQL** running locally or a Supabase PostgreSQL instance URL.

---

### Step 1: Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/buildestate?schema=public"
   JWT_SECRET="your_jwt_secret_key"
   ```

3. Sync database schemas using Prisma:
   ```bash
   npx prisma db push
   ```

4. Populate initial seed test data:
   ```bash
   npm run db:seed
   ```

5. Start the Express development server:
   ```bash
   npm run dev
   ```
   *The server starts on [http://localhost:5000](http://localhost:5000)*.

---

### Step 2: Frontend Setup
1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```

2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The client starts on [http://localhost:3000](http://localhost:3000)*.

---

## 📝 Presenting the Project (Tips for Interviews / Presentations)

- **Architecture Choice**: Explain why you chose a clean Client-Server model over a complex monorepo or Next.js server components (which are complex for beginners). This highlights your focus on decoupling backend business logic (Express + Prisma) from user interfaces (React + Tailwind).
- **Prisma integration**: Highlight the ease of schema migration using `npx prisma db push` and object relationships.
- **Glassmorphism Theme**: Demonstrate the light/dark mode switch which adds premium visual appeal.
