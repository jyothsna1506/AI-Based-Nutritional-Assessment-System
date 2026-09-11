"""
seed_admin.py — Creates or promotes an admin user in the database.

Usage (run from project root):
    python scripts/seed_admin.py

The admin email and password are read from environment variables:
    ADMIN_EMAIL     (default: admin@example.com)
    ADMIN_PASSWORD  (default: ChangeMe123!)

WARNING: Change ADMIN_PASSWORD immediately after first login.
"""
import os
import sys
from pathlib import Path

# Add project root to Python path so backend imports work
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Load .env before importing app modules
from dotenv import load_dotenv
load_dotenv(PROJECT_ROOT / "backend" / ".env")

from backend.app.database.db import SessionLocal, init_db
from backend.app.models.user import User
from backend.app.auth.hashing import hash_password


def seed_admin():
    """Create an admin user if one doesn't exist, or promote an existing user."""
    admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "ChangeMe123!")
    admin_name = os.getenv("ADMIN_NAME", "System Administrator")

    # Ensure tables exist
    init_db()

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == admin_email).first()
        if existing:
            if existing.role not in ("ADMIN", "SUPER_ADMIN"):
                existing.role = "ADMIN"
                db.commit()
                print(f"✅ User '{admin_email}' promoted to ADMIN.")
            else:
                print(f"ℹ️  Admin user '{admin_email}' already exists with role '{existing.role}'.")
            return

        new_admin = User(
            full_name=admin_name,
            email=admin_email,
            password_hash=hash_password(admin_password),
            role="ADMIN",
        )
        db.add(new_admin)
        db.commit()
        print(f"✅ Admin user created: {admin_email}")
        print("⚠️  Please change the default password immediately after login!")

    except Exception as exc:
        print(f"❌ Error seeding admin: {exc}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
