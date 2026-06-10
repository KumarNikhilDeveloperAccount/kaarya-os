import sys
import os
sys.path.append('C:\\kaarya-os\\backend')
from app.database import SessionLocal
from app.models.ecosystem import Reel

db = SessionLocal()
db.query(Reel).delete()
db.commit()
print("Wiped reels table")
