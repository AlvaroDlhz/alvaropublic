"""
Pydantic schemas for request/response validation and serialization.
These schemas define the shape of data coming in and going out of the API.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# Base schemas
class UserBase(BaseModel):
    """Base schema with common user fields."""
    name: str = Field(..., min_length=1, max_length=100, description="User's full name")
    email: EmailStr = Field(..., description="User's email address")


class UserCreate(UserBase):
    """Schema for creating a new user."""
    is_active: Optional[bool] = Field(default=True, description="Whether the user is active")


class UserUpdate(BaseModel):
    """Schema for updating an existing user. All fields are optional."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """Schema for user responses. Includes all database fields."""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # Allows creating from ORM models


class UserList(BaseModel):
    """Schema for paginated user list responses."""
    users: list[UserResponse]
    total: int
    page: int
    page_size: int


# Generic response schemas
class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    detail: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response schema."""
    error: str
    detail: Optional[str] = None
