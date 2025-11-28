"""
Configuration management for the API.
Loads environment variables and provides application settings.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database Configuration
    DATABASE_HOST: str = "localhost"
    DATABASE_PORT: int = 5432
    DATABASE_NAME: str = "postgres"
    DATABASE_USER: str = "postgres"
    DATABASE_PASSWORD: str = ""
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_RELOAD: bool = True
    
    # Application Metadata
    APP_NAME: str = "Python PostgreSQL API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "REST API built with FastAPI and PostgreSQL"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def database_url(self) -> str:
        """Construct the database URL for SQLAlchemy."""
        return (
            f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}"
            f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
        )


# Create a global settings instance
settings = Settings()
