# Local Setup Guide

> Everything you need to get the Todo App running on your machine from scratch.

---

## Prerequisites

Make sure you have these installed before starting:

| Tool | Purpose | Download |
|---|---|---|
| **Python 3.10+** | Runs the FastAPI backend | https://python.org/downloads |
| **PostgreSQL 14+** | The database | https://postgresql.org/download |
| **VS Code** | Code editor (recommended) | https://code.visualstudio.com |
| **Live Server** (VS Code extension) | Serves the frontend with auto-reload | Search in VS Code Extensions |

Verify your installs:

```bash
python --version    # should print Python 3.10 or higher
psql --version      # should print psql (PostgreSQL) 14.x or higher
```

---

## Step 1 — Set Up PostgreSQL

### 1a. Start PostgreSQL

PostgreSQL runs as a background service. After installing, it usually starts automatically.

**Windows** — open Services (Win + R → `services.msc`) and check `postgresql-x64-14` is running.  
**Mac** — `brew services start postgresql`  
**Linux** — `sudo systemctl start postgresql`

### 1b. Create the database

Open a terminal and connect to PostgreSQL:

```bash
psql -U postgres
```

> If `psql` asks for a password, use the password you set during PostgreSQL installation.

Once inside `psql`, create the database:

```sql
CREATE DATABASE todo_db;
```

Verify it was created:

```sql
\l
```

You should see `todo_db` in the list. Exit psql:

```sql
\q
```

---

## Step 2 — Configure the Backend

### 2a. Copy the environment file

Open a terminal in the `backend/` folder:

```bash
# Windows (Command Prompt or PowerShell)
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

### 2b. Edit `.env` with your credentials

Open `backend/.env` in your editor and fill in your PostgreSQL details:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_db
DB_USER=postgres
DB_PASSWORD=your_password_here
```

> Change `your_password_here` to the password you set during PostgreSQL installation.  
> If you left the password blank during installation, leave `DB_PASSWORD=` empty.

---

## Step 3 — Set Up the Backend

Open a terminal in the `backend/` folder and run these commands one by one:

### 3a. Create a virtual environment

A virtual environment keeps this project's dependencies isolated from other Python projects.

```bash
python -m venv venv
```

### 3b. Activate the virtual environment

```bash
# Windows (PowerShell)
venv\Scripts\activate

# Windows (Command Prompt)
venv\Scripts\activate.bat

# Mac / Linux
source venv/bin/activate
```

After activation you will see `(venv)` at the start of your terminal prompt.

### 3c. Install dependencies

```bash
pip install -r requirements.txt
```

This installs: `fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `psycopg2-binary`, `python-dotenv`.

### 3d. Start the server

```bash
uvicorn main:app --reload
```

`--reload` means the server automatically restarts when you save a file — useful during development.

**Expected output:**

```
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

> On first run, SQLAlchemy automatically creates the `todos` table in your `todo_db` database.  
> You do NOT need to run any SQL `CREATE TABLE` commands manually.

---

## Step 4 — Open the Frontend

The frontend is plain HTML/CSS/JS — no build step needed.

### Option A — Live Server (Recommended)

1. Open the `todo-app/` folder in VS Code
2. Right-click on `frontend/index.html`
3. Click **"Open with Live Server"**
4. The browser opens at `http://127.0.0.1:5500/frontend/index.html`

Live Server auto-refreshes the page whenever you save a file.

### Option B — Open directly in browser

Double-click `frontend/index.html` or drag it into your browser.

> Note: Some browsers block `fetch()` requests from `file://` URLs due to CORS.  
> If the app doesn't load todos, use Option A (Live Server) instead.

---

## Step 5 — Verify Everything Works

Open your browser and check:

| URL | What you should see |
|---|---|
| `http://127.0.0.1:8000/` | `{"status": "ok", "message": "Todo API is running!"}` |
| `http://127.0.0.1:8000/docs` | Swagger UI — interactive API documentation |
| `http://127.0.0.1:8000/redoc` | ReDoc — alternative API docs |
| `http://127.0.0.1:5500/frontend/index.html` | The Todo App UI |

Try adding a todo in the UI. If it appears in the list, everything is working.

---

## Testing the API Without the Frontend

### Using Swagger UI (Easiest)

1. Go to `http://127.0.0.1:8000/docs`
2. Click any endpoint (e.g. `POST /todos`)
3. Click **"Try it out"**
4. Fill in the data and click **"Execute"**
5. See the response directly in the browser

### Using curl (Terminal)

```bash
# Create a todo
curl -X POST http://127.0.0.1:8000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn FastAPI", "description": "Build a todo app"}'

# Read all todos
curl http://127.0.0.1:8000/todos

# Read one todo (replace 1 with an actual id)
curl http://127.0.0.1:8000/todos/1

# Update a todo
curl -X PUT http://127.0.0.1:8000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete a todo
curl -X DELETE http://127.0.0.1:8000/todos/1
```

---

## Stopping the Server

Press `Ctrl + C` in the terminal where uvicorn is running.

To deactivate the virtual environment:

```bash
deactivate
```

---

## Restarting After a Break

Next time you come back, you only need:

```bash
# Terminal 1 — backend
cd todo-app/backend
venv\Scripts\activate       # Windows
# or: source venv/bin/activate  (Mac/Linux)
uvicorn main:app --reload

# Then open frontend/index.html with Live Server
```

You do NOT need to run `pip install` or create the database again.

---

## Common Errors & Fixes

### `connection refused` or `could not connect to server`

PostgreSQL is not running.

```bash
# Windows — start the service
net start postgresql-x64-14     # adjust version number if needed

# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

---

### `password authentication failed for user "postgres"`

The password in `.env` doesn't match your PostgreSQL password.

Fix: Open `backend/.env` and correct `DB_PASSWORD=`.

---

### `database "todo_db" does not exist`

You haven't created the database yet. Run:

```bash
psql -U postgres -c "CREATE DATABASE todo_db;"
```

---

### `ModuleNotFoundError: No module named 'fastapi'`

The virtual environment is not activated, or you forgot to run `pip install`.

```bash
# Make sure you see (venv) in your terminal prompt
venv\Scripts\activate           # Windows
source venv/bin/activate        # Mac/Linux

pip install -r requirements.txt
```

---

### Todos don't load in the browser (CORS error)

You are opening `index.html` as a `file://` URL. Use Live Server instead (Option A in Step 4).

---

### Port 8000 already in use

Another process is using port 8000. Run on a different port:

```bash
uvicorn main:app --reload --port 8001
```

Then update `API_BASE` in `frontend/app.js`:

```javascript
const API_BASE = "http://127.0.0.1:8001";
```

---

## Project Files Reference

```
backend/
├── main.py          ← All API routes (CRUD endpoints)
├── models.py        ← SQLAlchemy model → maps to 'todos' table in PostgreSQL
├── schemas.py       ← Pydantic schemas → validates request/response data
├── database.py      ← DB connection, session factory, Base
├── requirements.txt ← Python packages needed
├── .env             ← Your credentials (never commit to git)
└── .env.example     ← Template — safe to commit

frontend/
├── index.html       ← Page structure
├── style.css        ← Styles
└── app.js           ← fetch() calls + DOM rendering
```
