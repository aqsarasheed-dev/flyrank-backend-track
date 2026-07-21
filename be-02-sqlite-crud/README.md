# BE-02: Connecting to the Database (SQLite)

## Why SQLite was chosen
The assignment specifies SQLite for this stage — it requires no separate database server, stores everything in a single file, and is ideal for learning the core idea that persistence is an implementation detail behind the API, not a change to the API's shape.

## Where the database file is stored
`be-02-sqlite-crud/tasks.db` — created automatically on first run if it doesn't exist.

## How to start the project

```
cd be-02-sqlite-crud
npm install
node server.js
```

Server runs on `http://localhost:3001`.

## Endpoints
- `GET /tasks` — list all tasks (supports `?search=` and `?done=true/false` query params)
- `GET /tasks/:id` — get one task (404 if not found)
- `POST /tasks` — create a task (400 if `title` missing)
- `PUT /tasks/:id` — update a task
- `DELETE /tasks/:id` — delete a task
- `GET /stats` — total/completed/pending counts using SQL `COUNT()`

## Database viewer / manual SQL exploration
Used the `sqlite3` CLI directly inside the Codespace (no separate GUI browser needed in this environment):

```
sqlite3 tasks.db
```

Example query executed:
```sql
SELECT * FROM tasks WHERE done = 1;
```

## What I learned
- The API layer never changed shape across this assignment — only the storage underneath did. `GET /tasks` still returns the same JSON shape it would from an in-memory array; the client can't tell the difference.
- Manually running `UPDATE` and `DELETE` directly in the SQLite CLI immediately reflected in the API on the next request — proving the API has no separate in-memory cache of its own, it's a thin layer over the database every time.
- `INTEGER PRIMARY KEY AUTOINCREMENT` never reuses old ids, even after every row is deleted. After deleting all 4 rows (ids 1-4) and letting the seed logic reinsert 3 example tasks, the new rows came back as ids 5, 6, 7 — not 1, 2, 3. This is a deliberate SQLite behavior (prevents accidental id collisions with old, deleted data) worth knowing before relying on ids meaning "the Nth task ever created."
- The seed-on-empty logic (`INSERT only if COUNT(*) = 0`) correctly fires again if the table is later emptied by any means — not just on the very first run ever, but any time the table becomes genuinely empty.

## Persistence proof
1. Started fresh — 3 example tasks seeded (ids 1-3).
2. Restarted the server — confirmed only 3 tasks still existed (no reseed), confirming Stage 0's checkpoint.
3. Created a new task (id 4) after restart — confirmed the database correctly remembered prior state instead of restarting id numbering.
4. Updated and deleted that task via the API — confirmed via `GET /tasks`.
5. Manually ran `UPDATE tasks SET done = 1;` then `DELETE FROM tasks WHERE done = 1;` directly in SQLite — table became empty, confirmed via API returning `[]`.
6. Restarted the server again — seed logic correctly fired again (table was genuinely empty), producing 3 new tasks with ids 5, 6, 7.