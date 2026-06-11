import sqlite3

def fix_db():
    conn = sqlite3.connect("kaarya_os.db")
    cursor = conn.cursor()
    
    # Try to add primary_role column to users
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN primary_role VARCHAR DEFAULT 'candidate'")
        print("Added primary_role to users.")
    except Exception as e:
        print(f"Users alter error: {e}")

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT 0")
        cursor.execute("ALTER TABLE users ADD COLUMN is_identity_verified BOOLEAN DEFAULT 0")
        cursor.execute("ALTER TABLE users ADD COLUMN preferences TEXT DEFAULT '{}'")
        print("Added verification/preference columns.")
    except Exception as e:
        print(f"Users extra alter error: {e}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    fix_db()
