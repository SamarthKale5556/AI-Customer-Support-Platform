import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend path is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models import Base, User, Ticket, Message, KnowledgeBase, AIAnalysis

load_dotenv()

SQLITE_URL = "sqlite:///./sql_app.db"
SUPABASE_URL = os.getenv("DATABASE_URL")

if not SUPABASE_URL:
    print("DATABASE_URL not found in environment.")
    sys.exit(1)

print("Connecting to SQLite...")
sqlite_engine = create_engine(SQLITE_URL)
SqliteSession = sessionmaker(bind=sqlite_engine)
sqlite_db = SqliteSession()

print("Connecting to Supabase PostgreSQL...")
supabase_engine = create_engine(SUPABASE_URL)
# Create all tables in Supabase
print("Creating tables in Supabase...")
Base.metadata.create_all(bind=supabase_engine)
SupabaseSession = sessionmaker(bind=supabase_engine)
supabase_db = SupabaseSession()

def migrate_table(model, name):
    print(f"Migrating {name}...")
    records = sqlite_db.query(model).all()
    if not records:
        print(f"No records found for {name}.")
        return
    
    count = 0
    for record in records:
        data = {c.name: getattr(record, c.name) for c in model.__table__.columns}
        existing = supabase_db.query(model).filter(model.id == data['id']).first()
        if not existing:
            new_record = model(**data)
            supabase_db.add(new_record)
            count += 1
            
    supabase_db.commit()
    print(f"Migrated {count} new records to {name}.")

try:
    migrate_table(User, "Users")
    migrate_table(Ticket, "Tickets")
    migrate_table(Message, "Messages")
    migrate_table(KnowledgeBase, "KnowledgeBase")
    migrate_table(AIAnalysis, "AIAnalysis")
    print("✅ Migration completed successfully!")
except Exception as e:
    print(f"❌ Migration failed: {e}")
    supabase_db.rollback()
finally:
    sqlite_db.close()
    supabase_db.close()
