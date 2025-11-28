"""
API route definitions.
Defines all HTTP endpoints with proper methods, status codes, and error handling.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from . import crud, schemas
from .database import get_db

# Create router
router = APIRouter(prefix="/api/v1", tags=["users"])


@router.get("/users", response_model=schemas.UserList)
def list_users(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum records to return"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db)
):
    """
    Get a list of all users with pagination.
    
    - **skip**: Number of records to skip (default: 0)
    - **limit**: Maximum number of records to return (default: 100, max: 1000)
    - **is_active**: Filter by active status (optional)
    """
    users = crud.get_users(db, skip=skip, limit=limit, is_active=is_active)
    total = crud.get_users_count(db, is_active=is_active)
    
    return schemas.UserList(
        users=users,
        total=total,
        page=skip // limit + 1,
        page_size=len(users)
    )


@router.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get a specific user by ID.
    
    - **user_id**: The ID of the user to retrieve
    """
    db_user = crud.get_user(db, user_id=user_id)
    
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    
    return db_user


@router.post("/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user.
    
    - **name**: User's full name (required)
    - **email**: User's email address (required, must be unique)
    - **is_active**: Whether the user is active (default: true)
    """
    # Check if email already exists
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email {user.email} is already registered"
        )
    
    return crud.create_user(db=db, user=user)


@router.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing user.
    
    - **user_id**: The ID of the user to update
    - **name**: New name (optional)
    - **email**: New email (optional)
    - **is_active**: New active status (optional)
    """
    # If email is being updated, check it's not already in use
    if user_update.email:
        existing_user = crud.get_user_by_email(db, email=user_update.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email {user_update.email} is already registered"
            )
    
    db_user = crud.update_user(db, user_id=user_id, user_update=user_update)
    
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    
    return db_user


@router.delete("/users/{user_id}", response_model=schemas.MessageResponse)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Delete a user.
    
    - **user_id**: The ID of the user to delete
    """
    success = crud.delete_user(db, user_id=user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    
    return schemas.MessageResponse(
        message="User deleted successfully",
        detail=f"User with id {user_id} has been removed"
    )


@router.get("/health", response_model=schemas.MessageResponse, tags=["health"])
def health_check():
    """
    Health check endpoint.
    Returns API status.
    """
    return schemas.MessageResponse(
        message="API is running",
        detail="All systems operational"
    )
