# Admission Management & CRM

A full-stack Admission Management & CRM web application built using React, Vite, Tailwind CSS, Node.js, Express, and PostgreSQL (via Prisma).

## Architecture
- **Monorepo Structure**: Uses npm workspaces. `frontend/` contains the React UI, and `backend/` contains the API.
- **Root Operations**: You can install dependencies and run tests/development commands directly from the root.

## Setup Instructions

1. **Install Dependencies**
   From the root folder, run:
   ```bash
   npm install
   ```
   *This automatically installs dependencies across both frontend and backend workspaces.*

2. **Database Setup**
   Ensure PostgreSQL is running. Copy `.env.example` to `.env` in the root folder and configure your `DATABASE_URL`.
   ```bash
   cp .env.example .env
   ```
   Then run migrations and seed the database:
   ```bash
   npx prisma migrate dev --name init
   npm run prisma db seed
   ```

3. **Run Locally**
   Start both the backend server and frontend dev server concurrently from the root folder:
   ```bash
   npm run dev
   ```

## Demo Credentials
- **Admin**: `admin` / `admin123` (Configure quotas and master setup)
- **Officer**: `officer` / `officer123` (Manage applicants, verify docs, allocate seats)
- **Management**: `management` / `mgmt123` (View read-only dashboard)

## Design Decisions
- **Tailwind Vanilla**: No component libraries were used, per the requirements. Styling is completely dependent on vanilla Tailwind utilities.
- **Seat Allocation Lock**: Allocating a seat locks the quota (decrements remaining available). When a fee is paid, the admission is officially "Confirmed" and an admission number is generated.
- **Deployment Ready**: The backend can serve the `frontend/dist` automatically in production if `process.env.NODE_ENV === 'production'`. Just run `npm run build` at the root to build both.
