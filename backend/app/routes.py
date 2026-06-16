from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List, Dict
from . import schemas, models, auth, database
from .notifications import notification_manager
from .services import ai_service
import asyncio
import os
from datetime import datetime

import re

router = APIRouter()

# --- ORIGINAL MODULE 1 ENDPOINTS ---
@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if len(user.password) < 8 or not re.search(r"[A-Z]", user.password) or not re.search(r"\d", user.password):
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters, contain an uppercase letter and a number")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid Credentials")
    
    if not auth.verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid Credentials")
    payload = {
        "user_id": db_user.id,
        "email": db_user.email,
        "role": db_user.role
    }
    access_token = auth.create_access_token(data=payload)
    refresh_token = auth.create_refresh_token(data=payload)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}




@router.get("/profile", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- MODULE 2 TICKET ENDPOINTS ---

@router.post("/tickets", response_model=schemas.TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket: schemas.TicketCreate, background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    new_ticket = models.Ticket(
        user_id=current_user.id,
        title=ticket.title,
        description=ticket.description,
        priority=ticket.priority,
        status="Open"
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    
    background_tasks.add_task(
        notification_manager.broadcast,
        {
            "type": "NEW_TICKET",
            "message": f"New ticket created: {new_ticket.title}",
            "ticket_id": new_ticket.id
        }
    )
    
    return new_ticket

@router.get("/tickets", response_model=List[schemas.TicketResponse])
def get_tickets(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    query = db.query(models.Ticket)
    if current_user.role not in ["Admin", "Agent"]:
        query = query.filter(models.Ticket.user_id == current_user.id)
    return query.order_by(models.Ticket.created_at.desc()).all()

@router.get("/tickets/{ticket_id}", response_model=schemas.TicketResponse)
def get_ticket(ticket_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if current_user.role == "Customer" and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this ticket")
        
    return ticket

@router.put("/tickets/{ticket_id}", response_model=schemas.TicketResponse)
def update_ticket(ticket_id: int, ticket_update: schemas.TicketUpdate, background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    # Only Agents or Admins can assign or change status globally, 
    # but for simplicity we allow Customer to close their own tickets
    if current_user.role == "Customer" and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if ticket_update.status is not None:
        if ticket.status != ticket_update.status and ticket_update.status == "Closed":
            background_tasks.add_task(
                notification_manager.broadcast,
                {
                    "type": "TICKET_CLOSED",
                    "message": f"Ticket #{ticket.id} was closed.",
                    "ticket_id": ticket.id
                }
            )
        ticket.status = ticket_update.status
    if ticket_update.priority is not None:
        ticket.priority = ticket_update.priority
    if ticket_update.assigned_to is not None and current_user.role in ["Agent", "Admin"]:
        if ticket.assigned_to != ticket_update.assigned_to:
            background_tasks.add_task(
                notification_manager.broadcast,
                {
                    "type": "TICKET_ASSIGNED",
                    "message": f"Ticket #{ticket.id} was assigned.",
                    "ticket_id": ticket.id
                }
            )
        ticket.assigned_to = ticket_update.assigned_to
        
    db.commit()
    db.refresh(ticket)
    return ticket

@router.delete("/tickets/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only Admins can delete tickets")
        
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    db.delete(ticket)
    db.commit()

class AISettingsUpdate(schemas.BaseModel):
    disable_ai_auto_reply: bool

@router.post("/tickets/{ticket_id}/ai-settings")
def update_ticket_ai_settings(ticket_id: int, settings: AISettingsUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role not in ["Agent", "Admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    ticket_settings = db.query(models.TicketSettings).filter_by(ticket_id=ticket_id).first()
    if not ticket_settings:
        ticket_settings = models.TicketSettings(ticket_id=ticket_id, disable_ai_auto_reply=settings.disable_ai_auto_reply)
        db.add(ticket_settings)
    else:
        ticket_settings.disable_ai_auto_reply = settings.disable_ai_auto_reply
    db.commit()
    return {"status": "success"}

# --- MODULE 2 MESSAGES REST ENDPOINTS ---

@router.get("/dashboard-metrics")
def get_dashboard_metrics(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role not in ["Agent", "Admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total_tickets = db.query(models.Ticket).count()
    open_tickets = db.query(models.Ticket).filter(models.Ticket.status == "Open").count()
    resolved_tickets = db.query(models.Ticket).filter(models.Ticket.status == "Closed").count()
    
    # Escalations: tickets that are assigned to a human agent
    escalations = db.query(models.Ticket).filter(models.Ticket.assigned_to != None).count()
    
    # AI Auto-Resolved: Tickets that are Closed and have at least one message from the AI User
    # Alternatively, tickets where AI settings are active, but simpler to check messages
    ai_user = db.query(models.User).filter_by(role="AI").first()
    ai_resolved = 0
    if ai_user:
        ai_resolved = db.query(models.Ticket).join(models.Message).filter(
            models.Ticket.status == "Closed",
            models.Message.sender_id == ai_user.id
        ).distinct().count()
        
    # Chart Data (last 7 days volume)
    # Simple aggregation by date
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    # Fetch all tickets from last 7 days to process in python for simplicity
    recent_tickets = db.query(models.Ticket).filter(models.Ticket.created_at >= seven_days_ago).all()
    
    chart_data = []
    for i in range(6, -1, -1):
        target_date = (datetime.utcnow() - timedelta(days=i)).date()
        day_name = target_date.strftime("%a")
        
        created_that_day = sum(1 for t in recent_tickets if t.created_at.date() == target_date)
        resolved_that_day = sum(1 for t in recent_tickets if t.status == "Closed" and t.created_at.date() == target_date)
        
        chart_data.append({
            "name": day_name,
            "tickets": created_that_day,
            "resolved": resolved_that_day
        })
    
    if len(recent_tickets) == 0:
        # Provide dummy data structure with 0s to keep UI intact if no data
        for i in range(6, -1, -1):
            target_date = (datetime.utcnow() - timedelta(days=i)).date()
            chart_data.append({"name": target_date.strftime("%a"), "tickets": 0, "resolved": 0})
            
    # De-duplicate dummy logic if no recent tickets (we appended twice)
    if len(recent_tickets) == 0:
        chart_data = chart_data[:7]

    return {
        "totalTickets": total_tickets,
        "openTickets": open_tickets,
        "resolvedTickets": resolved_tickets,
        "aiResolved": ai_resolved,
        "escalations": escalations,
        "chartData": chart_data
    }

@router.get("/messages/{ticket_id}", response_model=List[schemas.MessageResponse])
def get_messages(ticket_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if current_user.role == "Customer" and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return db.query(models.Message).filter(models.Message.ticket_id == ticket_id).order_by(models.Message.timestamp.asc()).all()


# --- MODULE 2 WEBSOCKETS ---

class ConnectionManager:
    def __init__(self):
        # ticket_id -> list of WebSockets
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, ticket_id: int):
        await websocket.accept()
        if ticket_id not in self.active_connections:
            self.active_connections[ticket_id] = []
        self.active_connections[ticket_id].append(websocket)

    def disconnect(self, websocket: WebSocket, ticket_id: int):
        if ticket_id in self.active_connections:
            self.active_connections[ticket_id].remove(websocket)
            if not self.active_connections[ticket_id]:
                del self.active_connections[ticket_id]

    async def broadcast(self, message: dict, ticket_id: int):
        if ticket_id in self.active_connections:
            for connection in self.active_connections[ticket_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/chat/{ticket_id}")
async def websocket_endpoint(websocket: WebSocket, ticket_id: int, db: Session = Depends(database.get_db)):
    await manager.connect(websocket, ticket_id)
    try:
        while True:
            data = await websocket.receive_json()
            
            # data should contain {"sender_id": 1, "message": "hello"}
            sender_id = data.get("sender_id")
            content = data.get("message")
            
            # Save to database
            new_message = models.Message(
                ticket_id=ticket_id,
                sender_id=sender_id,
                message=content
            )
            db.add(new_message)
            db.commit()
            db.refresh(new_message)
            
            sender = db.query(models.User).filter_by(id=sender_id).first()
            sender_role = sender.role if sender else "Customer"
            
            # Broadcast the new message object
            await manager.broadcast({
                "id": new_message.id,
                "ticket_id": new_message.ticket_id,
                "sender_id": new_message.sender_id,
                "message": new_message.message,
                "timestamp": new_message.timestamp.isoformat(),
                "sender_role": sender_role
            }, ticket_id)
            
            # Trigger AI Auto-reply logic if enabled and message is from Customer
            enable_ai_auto_reply = os.getenv("ENABLE_AI_AUTO_REPLY", "true").lower() == "true"
            if enable_ai_auto_reply and sender_role == "Customer":
                # Check if ticket has disabled auto reply
                ticket_settings = db.query(models.TicketSettings).filter_by(ticket_id=ticket_id).first()
                if not ticket_settings or not ticket_settings.disable_ai_auto_reply:
                    # Cancel existing task for this ticket if any (Duplicate Protection)
                    if ticket_id in pending_ai_replies:
                        pending_ai_replies[ticket_id].cancel()
                    
                    # Schedule new background task
                    task = asyncio.create_task(process_ai_reply(ticket_id))
                    pending_ai_replies[ticket_id] = task
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, ticket_id)

pending_ai_replies = {}

cached_ai_user_id = None

async def process_ai_reply(ticket_id: int):
    global cached_ai_user_id
    
    # Broadcast typing indicator
    await manager.broadcast({"type": "typing", "sender_role": "AI"}, ticket_id)
    
    # Wait for configured delay
    delay = float(os.getenv("AI_REPLY_DELAY", "0.0"))
    if delay > 0:
        await asyncio.sleep(delay)
        
    def _run_ai_logic():
        import time
        global cached_ai_user_id
        db = database.SessionLocal()
        try:
            t0 = time.time()
            # Build context
            ticket = db.query(models.Ticket).filter_by(id=ticket_id).first()
            if not ticket or ticket.status == "Closed":
                return "closed", None
                
            messages = db.query(models.Message).filter_by(ticket_id=ticket_id).order_by(models.Message.timestamp.desc()).limit(5).all()
            messages.reverse()
            
            context = f"Ticket Title: {ticket.title}\nTicket Priority: {ticket.priority}\nTicket Description: {ticket.description}\n\nConversation:\n"
            for msg in messages:
                role = msg.sender.role if msg.sender else "Unknown"
                context += f"{role}: {msg.message}\n"
                
            # --- RAG Integration ---
            from app.rag.chroma_setup import search_documents
            try:
                latest_message = messages[-1].message if messages else ticket.description
                rag_results = search_documents(latest_message, n_results=2)
                
                if rag_results and rag_results.get("documents") and len(rag_results["documents"][0]) > 0:
                    context += "\nRelevant Knowledge Base Articles:\n"
                    for doc in rag_results["documents"][0]:
                        context += f"- {doc}\n"
            except Exception as e:
                print(f"[RAG Error] {e}")
            # -----------------------
                
            t1 = time.time()
            print(f"[Latency] Context preparation: {t1-t0:.3f}s")
            
            result = ai_service.generate_auto_reply(context)
            reply_text = result.get("reply", "")
            escalate = result.get("escalate", False)
            confidence = result.get("confidence", 1.0)
            t2 = time.time()
            
            print(f"[Latency] Gemini API request: {t2-t1:.3f}s")
            print(f"[AI Decision] Escalate: {escalate}")
            
            # Ensure AI User exists and cache it
            if not cached_ai_user_id:
                ai_user = db.query(models.User).filter_by(email="ai@system.com").first()
                if not ai_user:
                    ai_user = models.User(name="AI Assistant", email="ai@system.com", password_hash="dummy", role="AI")
                    db.add(ai_user)
                    db.commit()
                    db.refresh(ai_user)
                cached_ai_user_id = ai_user.id
                
            if escalate:
                # Human Handoff Assignment
                if not ticket.assigned_to:
                    agent = db.query(models.User).filter(models.User.role.in_(["Agent", "Admin"])).first()
                    if agent:
                        ticket.assigned_to = agent.id
                        db.commit()
                
            # Save the AI reply (whether standard or escalation message)
            new_message = models.Message(
                ticket_id=ticket_id,
                sender_id=cached_ai_user_id,
                message=reply_text
            )
            db.add(new_message)
            db.commit()
            db.refresh(new_message)
            
            ai_meta = models.AIMessageData(
                message_id=new_message.id,
                confidence=confidence,
                model_used="gemini-2.5-flash",
                auto_generated=True
            )
            db.add(ai_meta)
            db.commit()
            
            t3 = time.time()
            print(f"[Latency] DB Save operations: {t3-t2:.3f}s")
            print(f"[Latency] Total AI Reply Pipeline: {t3-t0:.3f}s")
            
            return "success", {
                "id": new_message.id,
                "ticket_id": new_message.ticket_id,
                "sender_id": new_message.sender_id,
                "message": new_message.message,
                "timestamp": new_message.timestamp.isoformat(),
                "sender_role": "AI"
            }
        finally:
            db.close()

    try:
        status, payload = await asyncio.to_thread(_run_ai_logic)
        if status == "success":
            await manager.broadcast(payload, ticket_id)
    except asyncio.CancelledError:
        pass # Task was cancelled due to new message
    except Exception as e:
        print("Error in process_ai_reply:", e)
    finally:
        if ticket_id in pending_ai_replies:
            del pending_ai_replies[ticket_id]


@router.websocket("/ws/notifications")
async def global_notifications_endpoint(websocket: WebSocket):
    await notification_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        notification_manager.disconnect(websocket)

