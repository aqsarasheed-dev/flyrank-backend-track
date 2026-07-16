## BE-04: Containerize Your Stack

### What changed
- Added `docker-compose.yml` running two services: `db` (Postgres 16) and `app` (this Next.js API).
- Added `Dockerfile` to containerize the app.
- Added `init.sql` to create the `tasks` table and seed initial rows.
- Added `repositories/postgresRepository.js` implementing the exact same interface as the original in-memory `repositories/taskRepository.js` (`findAll`, `findById`, `create`).
- Swapped one import line in `services/taskService.js` to point at `postgresRepository.js` instead of `taskRepository.js`. **No other code in the service or route layer changed** — this proves the layered architecture from A2 works as intended.

### How to run
App available at `http://localhost:3000/api/tasks`.


### Persistence proof
1. Started the stack, confirmed 2 seed tasks via `GET /api/tasks`.
2. Created a 3rd task via `POST /api/tasks`.
3. Ran `docker compose down` — fully removed both containers (verified with `docker ps -a`).
4. Confirmed the named volume `pgdata` still existed via `docker volume ls`.
5. Ran `docker compose up` again — Postgres logged "database directory appears to contain a database; skipping initialization."
6. Ran `GET /api/tasks` again — all 3 tasks were still present, confirming data survived a full container removal and restart.

### Environment
- Connection string is read from `DATABASE_URL` in `.env.local` (gitignored).
- `.env.example` is committed showing the expected format without real secrets.

### Note on development environment
This was built and tested in GitHub Codespaces rather than locally, since local Docker virtualization (VT-x) wasn't available/enabled on the development machine's hardware/BIOS. 
## Auth: Login & Protect

### What was added
- `users` table (`init.sql`) storing `email` and `password_hash` (bcrypt hashed, never plain text).
- `repositories/authRepository.js` — find/create user in Postgres.
- `services/authService.js` — registration (hashing with bcrypt), login (password verification + JWT signing), and token verification.
- `app/api/auth/register/route.js` — POST endpoint to create a new user.
- `app/api/auth/login/route.js` — POST endpoint to authenticate and receive a JWT token.
- `app/api/protected/route.js` — one protected route that requires a valid `Authorization: Bearer <token>` header.

### Auth flow tested
1. `POST /api/auth/register` with email/password → user created, password hash never returned.
2. `POST /api/auth/login` with same credentials → returns a signed JWT valid for 1 hour.
3. `GET /api/protected` with no token → `401 Unauthorized`, "No token provided".
4. `GET /api/protected` with a valid token in the `Authorization: Bearer` header → `200 OK`, returns authenticated user info.

### Environment
- `JWT_SECRET` is set via Docker Compose environment variables (also documented in `.env.example`).
## The Polite Scraper

### What was built
A scraper for books.toscrape.com (a purpose-built practice site for scraping exercises) implementing the full fetch → parse → extract → clean → structure pipeline.

- **Politeness measures:**
  - Checks `/robots.txt` before scraping; since none exists on this site (404), proceeds under the standard convention that no robots.txt means no crawl restrictions.
  - Identifies itself honestly via a custom `User-Agent` header (`FlyRankInternBot/1.0`, with contact info).
  - Rate-limited to 1 request per second (`p-limit` + explicit delay) — no concurrent hammering of the target server.

- **Extraction & cleaning:**
  - Parses book listing pages with `cheerio`.
  - Extracts: title, price, rating, availability, detail page link.
  - Cleans price (`£51.77` → `51.77` numeric), converts star-rating CSS class (`Three`) to an integer (`3`).

- **Storage:**
  - Results saved to a `scraped_books` table in the existing Postgres database (same stack from BE-04), deduplicated by title (`ON CONFLICT DO NOTHING`).
  - `POST /api/scrape` — triggers a fresh scrape of 3 pages (~60 books) and saves results.
  - `GET /api/scrape` — returns everything currently stored.

### Tested
- `POST /api/scrape` → scraped and saved 60 books across 3 pages, ~3 seconds total (rate-limited).
- `GET /api/scrape` → confirmed all 60 records persisted correctly in Postgres with timestamps.

### Environment
Developed and tested in GitHub Codespaces (same setup as prior assignments, due to local hardware virtualization limitations).
## BE-06: Background Jobs

### What was built
A background job pipeline using BullMQ + Redis, simulating a slow AI call (since a real A6 AI integration wasn't available):

- **`POST /api/jobs`** — accepts a request, creates a job record in Postgres, enqueues it to Redis via BullMQ, and returns **202 Accepted** immediately with a `jobId` and `status: "queued"`.
- **`worker.js`** — a separate Docker service that pulls jobs off the queue and processes them (simulated 5-second AI call, with a 30% random failure rate to exercise retry logic).
- **`GET /api/jobs/:id`** — reports current status: `queued`, `processing`, `completed`, or `failed`, along with the result or error once known.

### Non-negotiables addressed
- **Idempotency:** requests include an `Idempotency-Key` header. Resubmitting the same key returns the existing job instead of creating a duplicate (`ON CONFLICT DO NOTHING` + lookup in `jobRepository.js`).
- **Retries:** BullMQ configured with 3 attempts and exponential backoff. Verified working — simulated failures trigger automatic retries with increasing delay.
- **Alerts:** failed jobs are logged prominently (`🚨 ALERT:`) in the worker's output, including after final retry exhaustion. In production this would route to email/Slack instead of console logs.

### Tested
- Submitted jobs via `POST /api/jobs` — confirmed instant 202 response (not waiting for the 5-second simulated work).
- Polled `GET /api/jobs/:id` — confirmed status transitions from `queued` → `processing` → `completed`.
- Confirmed idempotency — resubmitting the same `Idempotency-Key` returned the original job, not a new one.

### Environment
Added `redis` and `worker` services to `docker-compose.yml`. Developed and tested in GitHub Codespaces.
## PDF Report Generator

### What was built
- Aggregates stats from the `scraped_books` table (total count, average price, breakdown by rating, top 5 most expensive books).
- Generates a PDF report using `pdfkit`, stored on disk in a persistent Docker volume (`reports_data`).
- Generation runs as a **background job** (reusing the BullMQ/Redis pattern from BE-06) — the request returns instantly, the worker does the actual PDF rendering.
- The API never returns the PDF content directly — only a `downloadUrl` link once the report is ready, following proper artifact-handling practice (store and link, don't pass large files through JSON).

### Endpoints
- `POST /api/reports` — triggers generation, returns `202`-style response with a `reportId` immediately.
- `GET /api/reports/:id` — reports status (`queued`/`processing`/`completed`/`failed`); includes `downloadUrl` once completed.
- `GET /api/reports/:id/download` — streams the actual PDF file for download.

### Tested
- `POST /api/reports` → instant response with `reportId`.
- Polled `GET /api/reports/:id` → confirmed status reached `completed`.
- Downloaded via `GET /api/reports/:id/download` → confirmed valid PDF (`%PDF-1.3` header, proper internal structure).

### Environment
Added a `reports_data` volume shared between `app` and `worker` services so generated files persist and are accessible for download. Developed and tested in GitHub Codespaces.