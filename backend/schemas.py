from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TodoCreate(BaseModel):
    """
    Schema for creating a new todo.
    Only title is required; description is optional.
    """
    title: str = Field(..., min_length=1, max_length=200, description="Title of the todo")
    description: Optional[str] = Field(None, max_length=500, description="Optional details")


class TodoUpdate(BaseModel):
    """
    Schema for updating a todo.
    All fields are optional so you can update just one field at a time.
    """
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    completed: Optional[bool] = None


class TodoResponse(BaseModel):
    """
    Schema for what we send BACK to the client.
    Includes all database fields including auto-generated ones.
    """
    id: int
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True  # allows converting SQLAlchemy model → Pydantic model
