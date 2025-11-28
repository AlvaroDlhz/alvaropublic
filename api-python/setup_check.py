"""
Setup script to help initialize the project.
Run this after creating your .env file.
"""
import os
import sys
from pathlib import Path


def check_python_version():
    """Check if Python version is 3.8 or higher."""
    if sys.version_info < (3, 8):
        print("[X] Python 3.8 or higher is required")
        print(f"   Current version: {sys.version}")
        return False
    print(f"[OK] Python version: {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    return True


def check_env_file():
    """Check if .env file exists."""
    env_path = Path(".env")
    env_example_path = Path(".env.example")
    
    if not env_path.exists():
        print("[!] .env file not found")
        if env_example_path.exists():
            print("   Please copy .env.example to .env and configure your database credentials")
            print("   Command: copy .env.example .env")
        return False
    print("[OK] .env file found")
    return True


def check_venv():
    """Check if running in a virtual environment."""
    in_venv = hasattr(sys, 'real_prefix') or (
        hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix
    )
    
    if not in_venv:
        print("[!] Not running in a virtual environment")
        print("   Recommended: Create and activate a virtual environment")
        print("   Commands:")
        print("     python -m venv venv")
        print("     venv\\Scripts\\activate  (Windows)")
        print("     source venv/bin/activate  (Linux/Mac)")
        return False
    print("[OK] Running in virtual environment")
    return True


def main():
    """Run all checks."""
    print("Checking Python API Setup\n")
    
    checks = [
        check_python_version(),
        check_venv(),
        check_env_file(),
    ]
    
    print("\n" + "="*50)
    if all(checks):
        print("[OK] All checks passed!")
        print("\nNext steps:")
        print("   1. Install dependencies: pip install -r requirements.txt")
        print("   2. Configure .env with your PostgreSQL credentials")
        print("   3. Create database in pgAdmin 4")
        print("   4. Run the server: uvicorn app.main:app --reload")
        print("   5. Visit http://localhost:8000/docs")
    else:
        print("[!] Some checks failed. Please address the issues above.")
    print("="*50)


if __name__ == "__main__":
    main()
