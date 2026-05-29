import sys
import os
sys.path.append(os.getcwd())

from sqlalchemy import create_engine, text
from app.database import engine, Base
from app.models import user, support

print("Starting database schema update...")

with engine.connect() as conn:
    # Add new columns to users table
    columns_to_add = [
        ("linkedin_id", "VARCHAR"),
        ("otp_code", "VARCHAR"),
        ("otp_expiry", "TIMESTAMP WITH TIME ZONE"),
        ("bio", "VARCHAR"),
        ("profile_picture", "VARCHAR"),
        ("skills", "VARCHAR DEFAULT ''"),
    ]
    
    for col_name, col_type in columns_to_add:
        try:
            conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
            print(f"Added column {col_name} to users table.")
        except Exception as e:
            # Might already exist
            print(f"Note: Column {col_name} might already exist or error: {str(e)[:50]}...")
    
    conn.commit()

print("Creating any missing tables (like tickets, ticket_messages)...")
Base.metadata.create_all(bind=engine)

print("Database update complete.")
