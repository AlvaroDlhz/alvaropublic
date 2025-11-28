"""
SQLAlchemy ORM models representing database tables.
These models define the structure of your PostgreSQL tables.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    """
    User model - Example table.
    
    This is a sample model. Modify according to your database schema.
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}')>"


# Add more models here as needed
# Example:
# class Product(Base):
#     __tablename__ = "products"
#     
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(200), nullable=False)
#     description = Column(String(1000))
#     price = Column(Numeric(10, 2))
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
