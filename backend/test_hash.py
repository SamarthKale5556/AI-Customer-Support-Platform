import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.auth import get_password_hash
    print("Hashing 'pass'...")
    h = get_password_hash('pass')
    print("Hash:", h)
except Exception as e:
    import traceback
    traceback.print_exc()
