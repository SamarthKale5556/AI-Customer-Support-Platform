import traceback
from app.database import SessionLocal
from app import models, auth

def test_insert():
    db = SessionLocal()
    try:
        new_user = models.User(
            name='test', 
            email='test@mail.com', 
            password_hash=auth.get_password_hash('test'), 
            role='Customer'
        )
        db.add(new_user)
        db.commit()
        print("Success")
    except Exception as e:
        traceback.print_exc()

test_insert()
