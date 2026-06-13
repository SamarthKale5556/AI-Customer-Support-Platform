from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from . import database, models
from .routes import get_module2_user
from .rag.chroma_setup import ingest_document, search_documents
from .services.ai_service import get_client

router = APIRouter()

class KBItemCreate(BaseModel):
    title: str
    content: str
    source: str = ""

class KBItemResponse(BaseModel):
    id: int
    title: str
    content: str
    source: str
    
    class Config:
        from_attributes = True

class RAGQuery(BaseModel):
    query: str

@router.post("/kb", response_model=KBItemResponse)
def create_kb_item(item: KBItemCreate, current_user: models.User = Depends(get_module2_user), db: Session = Depends(database.get_db)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_item = models.KnowledgeBase(
        title=item.title,
        content=item.content,
        source=item.source
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    # Store in ChromaDB
    ingest_document(
        doc_id=f"kb_{db_item.id}", 
        content=db_item.content, 
        metadata={"title": db_item.title, "source": db_item.source, "id": db_item.id}
    )
    
    return db_item

@router.get("/kb", response_model=List[KBItemResponse])
def get_kb_items(current_user: models.User = Depends(get_module2_user), db: Session = Depends(database.get_db)):
    return db.query(models.KnowledgeBase).all()

@router.delete("/kb/{item_id}")
def delete_kb_item(item_id: int, current_user: models.User = Depends(get_module2_user), db: Session = Depends(database.get_db)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_item = db.query(models.KnowledgeBase).filter(models.KnowledgeBase.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    db.delete(db_item)
    db.commit()
    
    from .rag.chroma_setup import get_or_create_collection
    collection = get_or_create_collection()
    collection.delete(ids=[f"kb_{item_id}"])
    
    return {"message": "Deleted"}

@router.post("/kb/ask")
def ask_knowledge_base(query: RAGQuery, current_user: models.User = Depends(get_module2_user)):
    results = search_documents(query.query, n_results=3)
    
    if not results or not results['documents'] or not results['documents'][0]:
        return {"answer": "I don't have enough information in the knowledge base to answer that."}
        
    context_docs = results['documents'][0]
    context_text = "\n\n".join(context_docs)
    
    client = get_client()
    prompt = f"""
    You are an AI Support Assistant. Answer the user's question based ONLY on the provided Knowledge Base context.
    If the context does not contain the answer, say "I'm sorry, but I don't have that information."
    
    Knowledge Base Context:
    {context_text}
    
    Question: {query.query}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return {"answer": response.text.strip()}
    except Exception as e:
        print("RAG Generation Failed:", e)
        return {"answer": "Failed to generate an answer."}
