# BuildEstate — India's Premier Luxury Real Estate Platform

BuildEstate is a state-of-the-art, premium Real Estate and Developer Portal designed to replicate the elite experiences of Zillow, Airbnb Luxe, DAMAC, and Housing.com. 

It is built on a clean decoupled client-server architecture using **React 18 + Vite** on the frontend, and **Node.js + Express + Prisma ORM + PostgreSQL** on the backend. It also features a fully-integrated **Mock Service Layer** enabling standalone evaluation without external database dependencies.

---

## 💎 Project Vision & Core Pillars

### 1. Ultra-Premium Aesthetics (Wow Factor)
- **Glassmorphism Dark Theme**: Styled with modern typography, smooth color gradients, glowing hover states, and micro-animations (powered by Framer Motion).
- **Interactive Media Galleries**: Property cards feature hover-controlled slideshows, construction status badges, and badges for 360° virtual tours.

### 2. High-Fidelity User Workflows
- **Interactive Buyer Dashboard**: Users can track saved properties, compare specs side-by-side, request brochures, and schedule site visits.
- **Unified Seller / Developer Console**: Builders and individual sellers manage active listings, approve/reschedule site visits, track organic analytics via charts, and chat with buyers.
- **7-Step Property Listing Wizard**: A structured step-by-step property uploader with progress tracking, drag-and-drop media simulation, and ID verification.

### 3. Production-Ready Authentication
- Complete signup, login, password visibility toggling, forgot password, and reset password flows.
- Immediate profile dropdown access to dashboard panels.

---

## 🏗️ Folder Structure

```text
BuildEstate/
├── client/                 # React + Vite Frontend (Port 3000)
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, Footer, PropertyCard)
│   │   ├── context/        # Auth & State Context providers
│   │   ├── pages/          # Full Page Views (Marketplace, SellProperty, Dashboards)
│   │   ├── services/       # API call handlers & Mock Database definitions
│   │   ├── index.css       # Core layout classes & global Tailwind tokens
│   │   ├── App.jsx         # Client routing declarations
│   │   └── main.jsx        # Client entry point
├── server/                 # Express.js Backend (Port 5000)
│   ├── config/             # Prisma client connection setup
│   ├── controllers/        # Request handlers (auth, properties, bookings)
│   ├── middleware/         # Token validation and file uploads
│   ├── routes/             # REST endpoints definition
│   ├── prisma/             # Database schema definition and seed scripts
│   └── server.js           # Express API entry point
└── README.md               # Documentation
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, React Hook Form, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express.js, Prisma ORM, JWT, bcryptjs, Multer (Media Uploads) |
| **Database** | PostgreSQL |

---

## 🚀 Get Started

### Stand-alone Mock Mode (Recommended for Demos)
You can run and preview the entire frontend immediately without setting up a database or backend. Simply launch the client server and access the page with the `?mock=true` query parameter:

[http://localhost:3000/Builderestate/?mock=true](http://localhost:3000/Builderestate/?mock=true)

---

### Step 1: Install Workspace Dependencies
Open a terminal at the project root and install dependencies:
```bash
# Install root, client, and server dependencies
npm install
cd client && npm install
cd ../server && npm install
```

---

### Step 2: Database & Backend Setup (Express.js)
1. Ensure **PostgreSQL** is running on your system.
2. In the `server/` directory, create a `.env` file with the following variables:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:password@localhost:5432/buildestate?schema=public"
   JWT_SECRET="super_secret_buildestate_token_key"
   ```
3. Sync the database schema using Prisma:
   ```bash
   npx prisma db push
   ```
4. Seed the initial real estate listings and user accounts:
   ```bash
   npm run db:seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend starts at [http://localhost:5000](http://localhost:5000)*.

---

### Step 3: Frontend Setup (Vite + React)
1. Open a new terminal tab and navigate to the `client/` directory.
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The client starts at [http://localhost:3000](http://localhost:3000)*.

---

## 🔑 Demo Accounts

Use the credentials below to log in and preview the custom interfaces:

**Default Password**: `Password@123`

| Role | Login Email | Purpose & Features |
| :--- | :--- | :--- |
| **Builder / Seller** | `builder@buildestate.in` | Preloaded with 24 active construction listings, visitor analytics, booking calendars, and contact enquiries. |
| **Buyer** | `buyer@buildestate.in` | Preloaded with active wishlists, scheduled site visits, and side-by-side comparison tables. |

---

## 📝 High-Fidelity Feature Guides

### 1. Interactive Property Cards
- **Compare Icon**: Adds a property to the compare drawer for side-by-side spec comparison.
- **Heart Icon**: Instantly adds/removes properties from the Buyer Wishlist.
- **Construction Status Badge**: Shows construction progress (e.g. *Under Construction*, *Ready to Move*, *Just Launched*).
- **RERA ID**: Explicitly shows regulatory certification details.

### 2. 7-Step Sell Property Wizard
Located at `/sell`, this wizard makes listing properties seamless:
- **Steps 1-3**: Selection of type (Villa, Penthouse, Land), Location autocomplete, and Area/Price specification.
- **Step 4**: Checklist of amenities (Clubhouse, Infinity Pool, Helipad, Concierge).
- **Step 5**: Media uploader showing simulated upload progress percentages.
- **Steps 6-7**: KYC details and RERA Registry certificate upload.

### 3. Unified Dashboard Navigation
The authenticated header contains a **Profile Dropdown** showing:
- **My Dashboard**: Renders stats and interactive graphs.
- **Wishlist**: Displays saved property cards.
- **Compare Properties**: Launches comparison tables.
- **Site Visits**: Schedules and tracks site visit bookings.
- **Sign Out**: Clears localStorage session cache and redirects immediately to the home screen.
