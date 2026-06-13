import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash, verify_password

try:
    db = SessionLocal()
    email = 'samarthkale1098@gmail.com'
    
    print("Querying DB...")
    db_user = db.query(User).filter(User.email == email).first()
    print("User found:", db_user is not None)
    
    print("Hashing password...")
    hashed = get_password_hash('pass')
    print("Hash created")
    
    print("Verifying password...")
    print("Verify:", verify_password('pass', hashed))
    
    print("Testing token creation...")
    from app.auth import create_access_token
    token = create_access_token({"sub": email})
    print("Token created")

except Exception as e:
    import traceback
    traceback.print_exc()
