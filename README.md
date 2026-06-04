# Brighte Eats — Leads

Expression of interest collector and dashboard for Brighte Eats.

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)

## Tech Stack

| Layer | Choice |
|---|---|
| Database | PostgreSQL 16 |
| ORM | Prisma 5 |
| API | Apollo Server 5 (GraphQL), Node.js + TypeScript |
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| GraphQL client | Apollo Client |

## How to run

**1. Start the database**

```bash
docker compose up -d
```

**2. Backend**

```bash
cd backend
npm install
npm run db:migrate   # run migrations
npm run db:seed      # seed initial service types
npm run dev          # starts Apollo Server at http://localhost:4000
```

**3. Frontend**

```bash
cd frontend
npm install
npm run dev          # starts Vite at http://localhost:5173
```

**4. (Optional) Prisma Studio**

```bash
cd backend
npm run db:studio    # opens database browser at http://localhost:5555
```

## Environment variables

Copy `backend/.env.example` to `backend/.env` — defaults work out of the box with the Docker Compose setup.

```
DATABASE_URL="postgresql://brighte:brighte@localhost:5432/brighte_eats"
PORT=4000
```
