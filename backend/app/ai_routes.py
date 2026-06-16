from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from . import database, models, schemas, auth
from .services import ai_service
from .notifications import notification_manager

router = APIRouter()

def get_conversation_context(ticket_id: int, db: Session) -> str:
    messages = db.query(models.Message).filter(models.Message.ticket_id == ticket_id).order_by(models.Message.timestamp.asc()).all()
    if not messages:
        return ""
    
    context = ""
    for msg in messages:
        role = "Customer" if msg.sender.role == "Customer" else "Agent"
        context += f"{role}: {msg.message}\n"
    return context

@router.post("/ai/reply-suggestions/{ticket_id}")
def get_reply_suggestions(ticket_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role not in ["Agent", "Admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    context = get_conversation_context(ticket_id, db)
    if not context:
        return {"professional": "", "polite": "", "context_aware": ""}
        
    suggestions = ai_service.generate_reply_suggestions(context)
    return suggestions

@router.post("/ai/analyze-sentiment/{ticket_id}")
def analyze_ticket_sentiment(ticket_id: int, background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    context = get_conversation_context(ticket_id, db)
    if not context:
        return {"sentiment": "Neutral"}
        
    sentiment = ai_service.analyze_sentiment(context)
    
    # Store in DB
    analysis = db.query(models.AIAnalysis).filter(models.AIAnalysis.ticket_id == ticket_id).first()
    if not analysis:
        analysis = models.AIAnalysis(ticket_id=ticket_id, sentiment=sentiment)
        db.add(analysis)
    else:
        analysis.sentiment = sentiment
    db.commit()
    
    # Trigger global notification if Negative
    if sentiment.lower() == "negative":
        background_tasks.add_task(
            notification_manager.broadcast,
            {
                "type": "NEGATIVE_SENTIMENT",
                "message": f"Negative sentiment detected in Ticket #{ticket_id}",
                "ticket_id": ticket_id
            }
        )
        
    return {"sentiment": sentiment}

@router.post("/ai/summarize/{ticket_id}")
def summarize_ticket(ticket_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role not in ["Agent", "Admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    context = get_conversation_context(ticket_id, db)
    if not context:
        return {"summary": "No messages to summarize."}
        
    summary = ai_service.summarize_chat(context)
    
    # Store in DB
    analysis = db.query(models.AIAnalysis).filter(models.AIAnalysis.ticket_id == ticket_id).first()
    if not analysis:
        analysis = models.AIAnalysis(ticket_id=ticket_id, summary=summary)
        db.add(analysis)
    else:
        analysis.summary = summary
    db.commit()
    
    return {"summary": summary}
