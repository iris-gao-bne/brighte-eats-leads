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

**2. Install dependencies & set up the database**

```bash
cp backend/.env.example backend/.env
cd backend && npm install && npm run db:migrate && npm run db:seed && cd ..
cd frontend && npm install && cd ..
```

**3. Run both servers concurrently**

```bash
npm run dev
```

Backend starts at `http://localhost:4000`, frontend at `http://localhost:5173`.

Or run them separately:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

**4. (Optional) Run tests**

```bash
cp backend/.env.test.example backend/.env.test
cd backend && npm run db:test:setup   # creates test DB and runs migrations
npm test
```

**5. (Optional) Prisma Studio**

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

## ## Why I chose [database / framework / frontend library]

**PostgreSQL** — Relational, handles joins well for the many-to-many lead↔service relationship, mature migration story. SQLite would also work but Postgres is more realistic for production.

**Prisma** — TypeScript-first ORM with auto-generated types that stay in sync with the schema. Running `prisma migrate dev` produces a SQL migration file and regenerates the client in one step, which keeps schema evolution explicit and reviewable. The `include` and `some` query helpers map cleanly to our pagination and service-filter patterns.

**Apollo Server** — Mature GraphQL server for Node.js with a straightforward standalone setup. The schema-first approach (SDL + resolvers) keeps the API contract explicit and easy to review. DataLoader integration is first-class, which matters for the N+1 problem on the `leads` list.

**React + Vite** — Lightweight, fast DX, Apollo Client has first-class GraphQL support.

## Data modelling trade-offs

**Services: join table vs enum vs JSON**

The requirement says service types may change over time. Three options considered:

- **PostgreSQL enum / GraphQL enum** — adding a new type requires a schema migration and redeploy. Rejected.
- **JSON array on the Lead row** — flexible, but unindexable and hard to filter by service type efficiently. Rejected.
- **Join table (`LeadService`) + `Service` lookup table** — chosen. New service types can be added by inserting new rows into the Service table, without requiring any schema changes. The join table can be indexed efficiently, and filtering leads by service type can be handled using a standard WHERE EXISTS query. The trade-off is slightly increased query complexity, but this design supports the requirement that service types may change over time.

**Email uniqueness**

The email field has a database-level UNIQUE constraint, which assumes that each lead is associated with a single email address. This way, even concurrent duplicate submissions can't produce two rows.

## Validation strategy — client vs server

**Server (Zod on the resolver)** Validates every input with Zod regardless of where the request originates. Service slugs are validated against the database rather than a hardcoded list, so new service types work automatically without touching validation code.

**Client (before mutation)** validates on submit before the request is sent, catches obvious user errors immediately:
- Name is non-empty
- Email matches a valid format
- Mobile matches Australian format (04XXXXXXXX)
- Postcode is exactly 4 digits
- At least one service is selected

## Idempotency approach

The `register` mutation is intentionally not idempotent. Because If someone submits the same email twice, I want to tell them "you're already registered" rather than silently succeed. 

The uniqueness guarantee lives at the database layer (`UNIQUE` constraint on `Lead.email`), not in application code. The application catches Prisma's `P2002` error and translates it into a structured GraphQL error so the frontend can display it inline. This means even concurrent duplicate submissions are handled correctly, one wins at the DB level, the other gets a clean error.

## What I'd change at 10× scale

**Cursor-based pagination** — `LIMIT/OFFSET` degrades at high offsets because PostgreSQL still scans all skipped rows. Cursor-based pagination (keyset pagination on `createdAt + id`) stays O(1) regardless of how deep into the list you are.

**Rate limiting on `register`** — The mutation is public and unauthenticated. Without rate limiting, it's trivially abusable. I Would use an in-memory limiter (e.g. rate-limiter-flexible) as a starting point and research the production-grade approach 

**DataLoader for all relations** — Currently DataLoader only batches `Lead.services`. At 10× with deeper queries, every relation would need its own loader to avoid N+1.

**Caching the `services` query** — The service list changes rarely. It's a good candidate for a short-lived server-side cache to avoid hitting the DB on every form load.

## TODOs / known gaps

- Wrap slug validation and lead creation in a single transaction to eliminate the race condition under high concurrency.
- I'd add structured logging so slow queries, errors, execution flows are visible in production 
- Index on created_at, the leads query sorts by created_at. Without an index, that's a full table scan as the table grows.
- UI is functional but minimal, I would invest in better styling and polish given more time.

## AI Assistance

Claude was used throughout this project:

**Where AI helped:**
- Scaffolding the project structure (backend, frontend, Docker, Prisma schema)
- Implementing GraphQL resolvers, DataLoader, and Zod validation
- Writing integration and unit tests
- Suggesting and explaining architectural trade-offs
- Drafting README sections

**Where I verified or changed the output:**
- Reviewed all resolver logic and corrected the bug in the `register` mutation (which caused the duplicate email catch block to be bypassed).
- Adjusted Apollo Client v4 import paths after the AI used deprecated v3-style imports.
- Moved route-level components (`RegistrationForm`, `LeadsDashboard`) from `components/` to `pages/`(the AI initially placed them in the wrong folder).
- Questioned the initial single-column index on `LeadService.serviceSlug` and pushed for a covering index `(serviceSlug, leadId)` to avoid table lookups on service filter queries.
- Moved validation logic out of the component into a dedicated `utils/validation.ts` file.
- Made product decisions the AI flagged but left open: idempotency behaviour, which queries require auth, token storage trade-offs.

**Limitations encountered:**
- AI was unaware of Apollo Client v4 and Apollo Server v5 breaking changes (hooks moved to `/react`, `ApolloError` replaced by `CombinedGraphQLErrors`, `uri` shorthand removed).
- Needed manual correction when parallel test files caused DB interference (fixed by adding `fileParallelism: false` and moving cleanup to `beforeEach`).
