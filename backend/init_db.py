import sys
import os

# Ensure backend dir is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from app import models

# Use a clean sync engine just to create tables
engine = create_engine("sqlite:///./sql_app.db", connect_args={"check_same_thread": False})

print("Creating tables...")
models.Base.metadata.create_all(bind=engine)
print("Tables created!")
