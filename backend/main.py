from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db

# Create all database tables defined in models.py
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Todo API",
    description="A simple CRUD Todo API built with FastAPI",
    version="1.0.0"
)

# CORS: allows the browser (frontend) to call this API
# Without this, the browser will block requests from a different origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace * with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
#  CREATE  →  POST /todos
# ─────────────────────────────────────────────
@app.post("/todos", response_model=schemas.TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    """
    Create a new todo item.
    FastAPI automatically validates the request body against TodoCreate schema.
    Depends(get_db) injects a database session automatically.
    """
    new_todo = models.Todo(
        title=todo.title,
        description=todo.description
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)  # reload from DB to get auto-generated fields (id, created_at)
    return new_todo


# ─────────────────────────────────────────────
#  READ ALL  →  GET /todos
# ─────────────────────────────────────────────
@app.get("/todos", response_model=List[schemas.TodoResponse])
def get_all_todos(db: Session = Depends(get_db)):
    """
    Retrieve all todo items, newest first.
    """
    todos = db.query(models.Todo).order_by(models.Todo.id.desc()).all()
    return todos


# ─────────────────────────────────────────────
#  READ ONE  →  GET /todos/{id}
# ─────────────────────────────────────────────
@app.get("/todos/{todo_id}", response_model=schemas.TodoResponse)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single todo by its ID.
    Raises 404 if not found.
    """
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail=f"Todo with id {todo_id} not found")
    return todo


# ─────────────────────────────────────────────
#  UPDATE  →  PUT /todos/{id}
# ─────────────────────────────────────────────
@app.put("/todos/{todo_id}", response_model=schemas.TodoResponse)
def update_todo(todo_id: int, todo_data: schemas.TodoUpdate, db: Session = Depends(get_db)):
    """
    Update a todo item.
    Only fields provided in the request body will be updated (partial update).
    """
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail=f"Todo with id {todo_id} not found")

    # exclude_unset=True means: only update fields the client actually sent
    update_data = todo_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(todo, field, value)

    db.commit()
    db.refresh(todo)
    return todo


# ─────────────────────────────────────────────
#  DELETE  →  DELETE /todos/{id}
# ─────────────────────────────────────────────
@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    """
    Delete a todo item by ID.
    Returns 204 No Content on success (no body).
    """
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail=f"Todo with id {todo_id} not found")

    db.delete(todo)
    db.commit()


# ─────────────────────────────────────────────
#  HEALTH CHECK  →  GET /
# ─────────────────────────────────────────────
@app.get("/")
def health_check():
    return {"status": "ok", "message": "Todo API is running!"}
