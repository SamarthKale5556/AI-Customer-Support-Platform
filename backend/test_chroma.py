import sys
import os

# Ensure the backend directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.rag.chroma_setup import ingest_document, get_chroma_client

print("Initializing ChromaDB and creating collection...")
ingest_document(
    doc_id="test_init",
    content="This is a test document to initialize the collection.",
    metadata={"source": "initialization"}
)
print("ChromaDB initialization complete!")
