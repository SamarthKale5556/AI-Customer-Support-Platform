from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from . import database, models
from .routes import get_module2_user

router = APIRouter()

@router.get("/analytics")
def get_analytics(current_user: models.User = Depends(get_module2_user), db: Session = Depends(database.get_db)):
    if current_user.role not in ["Agent", "Admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    total_tickets = db.query(func.count(models.Ticket.id)).scalar() or 0
    open_tickets = db.query(func.count(models.Ticket.id)).filter(models.Ticket.status == "Open").scalar() or 0
    closed_tickets = db.query(func.count(models.Ticket.id)).filter(models.Ticket.status == "Closed").scalar() or 0
    pending_tickets = db.query(func.count(models.Ticket.id)).filter(models.Ticket.status == "Pending").scalar() or 0
    
    sentiment_data = db.query(models.AIAnalysis.sentiment, func.count(models.AIAnalysis.id)).group_by(models.AIAnalysis.sentiment).all()
    sentiment_counts = {
        "Positive": 0,
        "Neutral": 0,
        "Negative": 0
    }
    for s, count in sentiment_data:
        if s and s in sentiment_counts:
            sentiment_counts[s] = count
            
    common_issues = [
        {"issue": "Login Failure", "count": 15},
        {"issue": "Payment Error", "count": 12},
        {"issue": "Bug Report", "count": 8},
        {"issue": "Feature Request", "count": 5}
    ]
    
    total_ai_replies = db.query(func.count(models.AIMessageData.id)).scalar() or 0
    escalations = db.query(func.count(models.Message.id)).filter(models.Message.message.like("%AI confidence low%")).scalar() or 0
    
    avg_confidence = db.query(func.avg(models.AIMessageData.confidence)).scalar() or 0.0
    
    return {
        "total": total_tickets,
        "open": open_tickets,
        "closed": closed_tickets,
        "pending": pending_tickets,
        "sentiments": sentiment_counts,
        "common_issues": common_issues,
        "average_resolution_time": "4.5 hours",
        "ai_metrics": {
            "total_replies": total_ai_replies,
            "escalations": escalations,
            "average_confidence": round(avg_confidence, 2)
        }
    }
