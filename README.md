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