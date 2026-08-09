import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL", "sqlite:///./kaarya_os.db")
db_path = db_url.replace("sqlite:///", "")

print(f"Altering DB at: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    try:
        c.execute("ALTER TABLE tickets ADD COLUMN reference_number VARCHAR;")
        c.execute("CREATE UNIQUE INDEX idx_tickets_reference_number ON tickets(reference_number);")
    except Exception as e:
        print(f"Ref Num Error: {e}")
    try:
        c.execute("ALTER TABLE tickets ADD COLUMN category VARCHAR;")
    except: pass
    try:
        c.execute("ALTER TABLE tickets ADD COLUMN sub_category VARCHAR;")
    except: pass
    try:
        c.execute("ALTER TABLE tickets ADD COLUMN screenshot_url VARCHAR;")
    except: pass
    conn.commit()
    conn.close()
    print("Successfully added columns to tickets table.")
except Exception as e:
    print(f"Error: {e}")
