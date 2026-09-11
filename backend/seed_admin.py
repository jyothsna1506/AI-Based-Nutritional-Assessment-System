import os
import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.database.db import SessionLocal
from backend.app.models.user import User
from backend.app.auth.hashing import hash_password

def seed_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "asheeshpatel9839@gmail.com").first()
        if admin:
            if admin.role != "ADMIN":
                admin.role = "ADMIN"
                db.commit()
                print("Admin user found, role updated to ADMIN.")
            else:
                print("Admin user already exists.")
            return

        print("Creating admin user...")
        new_admin = User(
            full_name="Asheesh Patel",
            email="asheeshpatel9839@gmail.com",
            password_hash=hash_password("Apatel9839@"),
            phone="1234567890",
            role="ADMIN"
        )
        db.add(new_admin)
        db.commit()
        print("Admin user created successfully.")
    except Exception as e:
        print(f"Error seeding admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
