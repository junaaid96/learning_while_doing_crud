# FastAPI Todo App — Code Walkthrough

> A beginner-friendly, full-stack Todo app built with **FastAPI** (Python backend) and **Vanilla JavaScript** (frontend).  
> Read `SETUP.md` to get it running. Read `CONCEPTS.md` to understand the web fundamentals behind it.

---

## 📁 Project Structure

```
todo-app/
├── backend/
│   ├── main.py          ← FastAPI app + all API routes (CRUD)
│   ├── models.py        ← Database table definition (SQLAlchemy)
│   ├── schemas.py       ← Data validation rules (Pydantic)
│   ├── database.py      ← Database connection + session setup
│   ├── requirements.txt ← Python dependencies
│   ├── .env             ← Your local DB credentials (never commit this)
│   └── .env.example     ← Template for teammates
│
├── frontend/
│   ├── index.html       ← Page structure
│   ├── style.css        ← Styling
│   └── app.js           ← All JavaScript logic (API calls + UI)
│
├── SETUP.md             ← How to run locally (start here)
├── CONCEPTS.md          ← Web fundamentals explained simply
└── README.md            ← This file — code explained
```

---

## 🧠 Part 1: What is FastAPI?

FastAPI is a **modern Python web framework** for building APIs.

| Feature | Explanation |
|---|---|
| **Fast** | One of the fastest Python frameworks (async I/O under the hood) |
| **Type-safe** | Uses Python type hints to validate data automatically |
| **Auto-docs** | Generates Swagger UI and ReDoc at `/docs` and `/redoc` without any extra work |
| **Pydantic** | If incoming data is wrong, it rejects it automatically with a clear error |

### Hello World in FastAPI

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def hello():
    return {"message": "Hello, World!"}
```

Run with `uvicorn main:app --reload` → visit `http://127.0.0.1:8000` → get JSON back.

---

## 🗄️ Part 2: Database Layer (`database.py`)

We use **PostgreSQL** with **SQLAlchemy** (Python ORM).

### The Connection URL

PostgreSQL connection is described as a URL — credentials come from `.env`, never hardcoded:

```python
DATABASE_URL = (
    f"postgresql://{os.getenv('DB_USER')}"
    f":{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}"
    f":{os.getenv('DB_PORT')}"
    f"/{os.getenv('DB_NAME')}"
)
# example: postgresql://postgres:secret@localhost:5432/todo_db
```

### Engine, Session, Base

```python
# engine — manages the connection pool to PostgreSQL
engine = create_engine(DATABASE_URL, pool_size=5, max_overflow=10)

# SessionLocal — factory that creates database sessions (one per request)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base — all models inherit from this
Base = declarative_base()
```

**Connection pooling**: `pool_size=5` keeps 5 connections open and reuses them instead of opening/closing one per request. Much faster.

### The `get_db` Dependency

```python
def get_db():
    db = SessionLocal()   # open a session
    try:
        yield db          # hand it to the route
    finally:
        db.close()        # always close after the request
```

`yield` makes this a generator. FastAPI calls it before your route, passes the session in, then closes it after — automatically.

---

## 📦 Part 3: Models (`models.py`)

A **model** maps a Python class to a database table.

```python
class Todo(Base):
    __tablename__ = "todos"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True)
    completed   = Column(Boolean, default=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())
```

| Python | Database |
|---|---|
| `class Todo` | `todos` table |
| `Column(Integer, primary_key=True)` | auto-incrementing integer ID |
| `nullable=False` | NOT NULL constraint |
| `default=False` | default value when not provided |
| `server_default=func.now()` | PostgreSQL sets this automatically on insert |
| `onupdate=func.now()` | PostgreSQL updates this automatically on every UPDATE |

`models.Base.metadata.create_all(bind=engine)` in `main.py` creates the table on startup if it doesn't exist.

---

## ✅ Part 4: Schemas (`schemas.py`)

Schemas (Pydantic models) control what data looks like going **in** and **out** of the API.

> **Model** (SQLAlchemy) = database shape  
> **Schema** (Pydantic) = API shape — what the client sends and receives

```python
# What the client sends to CREATE a todo
class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)

# What the client sends to UPDATE a todo (all fields optional)
class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    completed: Optional[bool] = None

# What the server sends BACK to the client
class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True  # lets Pydantic read SQLAlchemy objects
```

FastAPI uses schemas to:
- **Validate** incoming data — wrong type or missing required field → auto 422 error
- **Serialize** outgoing data — converts Python object to JSON automatically
- **Document** the API — Swagger UI shows exactly what each endpoint expects/returns

---

## 🛣️ Part 5: API Routes (`main.py`)

FastAPI uses **decorators** to define routes. Each decorator registers a URL + HTTP method pair.

### CRUD Operations

| Operation | HTTP Method | URL | Status Code |
|---|---|---|---|
| **C**reate | `POST` | `/todos` | 201 Created |
| **R**ead all | `GET` | `/todos` | 200 OK |
| **R**ead one | `GET` | `/todos/{id}` | 200 OK / 404 |
| **U**pdate | `PUT` | `/todos/{id}` | 200 OK / 404 |
| **D**elete | `DELETE` | `/todos/{id}` | 204 No Content / 404 |

---

### CREATE — `POST /todos`

```python
@app.post("/todos", response_model=schemas.TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    new_todo = models.Todo(title=todo.title, description=todo.description)
    db.add(new_todo)     # stage the insert
    db.commit()          # write to PostgreSQL
    db.refresh(new_todo) # reload to get id, created_at from DB
    return new_todo
```

Request body → Response:
```json
// Client sends:
{ "title": "Buy groceries", "description": "Milk and eggs" }

// Server returns:
{ "id": 1, "title": "Buy groceries", "completed": false, "created_at": "..." }
```

---

### READ ALL — `GET /todos`

```python
@app.get("/todos", response_model=List[schemas.TodoResponse])
def get_all_todos(db: Session = Depends(get_db)):
    return db.query(models.Todo).order_by(models.Todo.id.desc()).all()
```

No request body. Returns an array of todos, newest first.

---

### READ ONE — `GET /todos/{id}`

```python
@app.get("/todos/{todo_id}", response_model=schemas.TodoResponse)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail=f"Todo with id {todo_id} not found")
    return todo
```

`{todo_id}` is a **path parameter** — pulled from the URL.  
`GET /todos/3` → `todo_id = 3`

---

### UPDATE — `PUT /todos/{id}`

```python
@app.put("/todos/{todo_id}", response_model=schemas.TodoResponse)
def update_todo(todo_id: int, todo_data: schemas.TodoUpdate, db: Session = Depends(get_db)):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail=f"Todo with id {todo_id} not found")

    update_data = todo_data.model_dump(exclude_unset=True)  # only fields the client sent
    for field, value in update_data.items():
        setattr(todo, field, value)

    db.commit()
    db.refresh(todo)
    return todo
```

`exclude_unset=True` — if the client only sends `{"completed": true}`, only `completed` is updated. `title` and `description` stay untouched.

---

### DELETE — `DELETE /todos/{id}`

```python
@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail=f"Todo with id {todo_id} not found")
    db.delete(todo)
    db.commit()
```

Returns **204 No Content** — nothing to send back after deleting.

---

## 🌐 Part 6: CORS Middleware

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # ← replace with your frontend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)
```

The browser blocks JavaScript from calling a different origin by default.  
Frontend runs on `localhost:5500`, API runs on `localhost:8000` — different origins.  
`CORSMiddleware` adds the headers that tell the browser to allow it.

> See `CONCEPTS.md → Section 8` for a full explanation of CORS.

---

## 💻 Part 7: JavaScript Frontend (`app.js`)

### The API Wrapper

All API calls go through one central `apiFetch` function:

```javascript
const API_BASE = "http://127.0.0.1:8000";

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (response.status === 204) return null; // DELETE returns no body

  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Something went wrong");

  return data;
}
```

Each CRUD function is then one line:

```javascript
const createTodo = (title, desc) =>
  apiFetch("/todos", { method: "POST", body: JSON.stringify({ title, description: desc }) });

const fetchTodos = () => apiFetch("/todos");

const updateTodo = (id, fields) =>
  apiFetch(`/todos/${id}`, { method: "PUT", body: JSON.stringify(fields) });

const deleteTodo = (id) => apiFetch(`/todos/${id}`, { method: "DELETE" });
```

### Rendering to the DOM

```javascript
function createTodoElement(todo) {
  const li = document.createElement("li");
  li.className = "todo-item";
  li.innerHTML = `
    <div class="todo-title">${escapeHtml(todo.title)}</div>
    <button class="btn-delete">Delete</button>
  `;
  li.querySelector(".btn-delete").addEventListener("click", () => handleDelete(todo.id));
  return li;
}
```

`escapeHtml()` prevents XSS — always sanitize user content before inserting into `innerHTML`.

---

## ⚡ Quick Reference

```
SERVER:      uvicorn main:app --reload
API DOCS:    http://127.0.0.1:8000/docs
HEALTH:      http://127.0.0.1:8000/

ROUTES:
  POST   /todos        → create todo   (201)
  GET    /todos        → list todos    (200)
  GET    /todos/{id}   → get one       (200 / 404)
  PUT    /todos/{id}   → update        (200 / 404)
  DELETE /todos/{id}   → delete        (204 / 404)

KEY FILES:
  database.py  → DB connection + session
  models.py    → DB table definition
  schemas.py   → API data shapes (in/out)
  main.py      → routes + business logic
  app.js       → fetch() calls + DOM rendering
```

---

## 🎯 What to Learn Next

1. **Authentication** — Add login with JWT tokens (`python-jose`, `passlib`)
2. **Async routes** — Use `async def` + `await` for non-blocking database calls
3. **Testing** — Write tests with `pytest` and FastAPI's `TestClient`
4. **Docker** — Package the app in a container for deployment
5. **React / Next.js** — Build the frontend with a proper framework

---

*See `CONCEPTS.md` for how the web works. See `SETUP.md` to run locally.*
