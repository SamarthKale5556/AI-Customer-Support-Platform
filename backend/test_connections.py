import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_supabase_pg():
    try:
        import psycopg2
        db_url = os.getenv("DATABASE_URL")
        print(f"Testing PostgreSQL connection to: {db_url.split('@')[1] if '@' in db_url else db_url}")
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()
        print("✅ PostgreSQL Connection Successful:", version[0])
        conn.close()
    except Exception as e:
        print("❌ PostgreSQL Connection Failed:", e)

def test_gemini():
    try:
        import google.generativeai as genai
        api_key = os.getenv("GEMINI_API_KEY")
        print("Testing Gemini API...")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello! Give me a one-word confirmation that you are working.")
        print("✅ Gemini API Successful. Response:", response.text.strip())
    except Exception as e:
        print("❌ Gemini API Failed:", e)

def test_chromadb():
    try:
        import chromadb
        from chromadb.config import Settings
        chroma_path = os.getenv("CHROMA_DB_PATH", "./chroma_data")
        print(f"Testing ChromaDB at: {chroma_path}")
        client = chromadb.PersistentClient(path=chroma_path, settings=Settings(anonymized_telemetry=False))
        collection = client.get_or_create_collection("test_connection")
        print("✅ ChromaDB Connection Successful. Collection created/verified.")
        client.delete_collection("test_connection")
    except Exception as e:
        print("❌ ChromaDB Connection Failed:", e)

if __name__ == "__main__":
    print("--- Running Connection Tests ---")
    test_supabase_pg()
    print("-" * 20)
    test_gemini()
    print("-" * 20)
    test_chromadb()
    print("--- Tests Complete ---")
