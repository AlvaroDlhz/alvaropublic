"""
CRUD (Create, Read, Update, Delete) operations.
Business logic separated from route handlers for better organization.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from . import models, schemas


# User CRUD operations
def get_user(db: Session, user_id: int) -> Optional[models.User]:
    """Get a single user by ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Get a user by email address."""
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    is_active: Optional[bool] = None
) -> List[models.User]:
    """
    Get a list of users with pagination.
    
    Args:
        db: Database session
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        is_active: Filter by active status (optional)
    """
    query = db.query(models.User)
    
    if is_active is not None:
        query = query.filter(models.User.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()


def get_users_count(db: Session, is_active: Optional[bool] = None) -> int:
    """Get total count of users."""
    query = db.query(func.count(models.User.id))
    
    if is_active is not None:
        query = query.filter(models.User.is_active == is_active)
    
    return query.scalar()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """
    Create a new user.
    
    Args:
        db: Database session
        user: User data from request
        
    Returns:
        Created user object
    """
    db_user = models.User(
        name=user.name,
        email=user.email,
        is_active=user.is_active
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(
    db: Session, 
    user_id: int, 
    user_update: schemas.UserUpdate
) -> Optional[models.User]:
    """
    Update an existing user.
    
    Args:
        db: Database session
        user_id: ID of user to update
        user_update: Updated user data
        
    Returns:
        Updated user object or None if not found
    """
    db_user = get_user(db, user_id)
    
    if not db_user:
        return None
    
    # Update only provided fields
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    """
    Delete a user.
    
    Args:
        db: Database session
        user_id: ID of user to delete
        
    Returns:
        True if deleted, False if not found
    """
    db_user = get_user(db, user_id)
    
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True
