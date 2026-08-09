import sqlite3

conn = sqlite3.connect(r'C:\kaarya-os\backend\kaarya_os.db')
cursor = conn.cursor()
cursor.execute("SELECT id, email, full_name, profile_picture FROM users WHERE profile_picture IS NOT NULL;")
print(cursor.fetchall())
conn.close()
