import os
import chromadb
from chromadb.config import Settings
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings

# Get Chroma DB Path from environment or use a default local directory
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_data")

def get_chroma_client():
    """Initializes and returns the ChromaDB client."""
    client = chromadb.CloudClient(
        api_key='ck-57vrDWPr4k6FfAeTBDkDLJ6zHHwfxEtz5RNNqpEmvtYX',
        tenant='3b3b8b7c-eddb-4189-b00b-6b2381bded6c',
        database='knowledgeBased'
    )
    return client
class GeminiEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        from ..services.ai_service import generate_embedding
        embeddings = []
        for text in input:
            embeddings.append(generate_embedding(text))
        return embeddings

def get_or_create_collection():
    """Gets or creates the support_knowledge_base collection."""
    client = get_chroma_client()
    
    gemini_ef = GeminiEmbeddingFunction()
    
    collection = client.get_or_create_collection(
        name="support_knowledge_base",
        embedding_function=gemini_ef,
        metadata={"hnsw:space": "cosine"}
    )
    
    return collection

def ingest_document(doc_id: str, content: str, metadata: dict = None):
    """
    Ingestion Pipeline Foundation:
    Document -> Embedding -> Store in ChromaDB
    
    Args:
        doc_id (str): A unique identifier for the document.
        content (str): The actual text content to embed.
        metadata (dict): Optional metadata (e.g., source, title, category).
    """
    collection = get_or_create_collection()
    
    if metadata is None:
        metadata = {}
        
    # ChromaDB's embedding function automatically creates embeddings when passing documents
    collection.add(
        documents=[content],
        metadatas=[metadata],
        ids=[doc_id]
    )
    
    print(f"Document {doc_id} successfully ingested into support_knowledge_base.")

def search_documents(query: str, n_results: int = 3):
    collection = get_or_create_collection()
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results
