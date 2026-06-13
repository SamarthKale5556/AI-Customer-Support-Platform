from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List, Dict
from . import schemas, models, auth, database
from .notifications import notification_manager

router = APIRouter()

# --- ORIGINAL MODULE 1 ENDPOINTS ---
@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
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
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


# --- MODULE 2 COMPATIBILITY WRAPPER ---
# This wrapper handles the frontend mock token without touching the original JWT logic.
def get_module2_user(token: str = Depends(auth.oauth2_scheme), db: Session = Depends(database.get_db)):
    if token.startswith("direct-login-token-"):
        parts = token.split("-")
        role = "Customer"
        if len(parts) >= 5:
            role = parts[3]
            
        email = f"mock{role.lower()}@example.com"
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            user = models.User(name=f"Mock {role}", email=email, password_hash="dummy", role=role)
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
    
    # Fallback to the real auth if a real token is provided
    return auth.get_current_user(token, db)


# --- MODULE 2 TICKET ENDPOINTS ---

@router.post("/tickets", response_model=schemas.TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket: schemas.TicketCreate, background_tasks: BackgroundTasks, current_user: models.User = Depends(get_module2_user), db: Session = Depends(database.get_db)):
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
def get_tickets(current_user: models.User = Depends(get_module2_user), db: Session = Depends(database.get_db)):
    if current_user.role in ["Admin", "Agent"]:
        return db.query(models.Ticket).all()
    else:
        return db.query(models.Ticket).filter(models.Ticket.user_id == current_user.id).all()

@router.get("/tickets/{ticket_id}", response_model=schemas.TicketResponse)
def get_ticket(ticket_id: int, current_user: models.User = Depends(get_module2_user), db: Session = Depends(database.get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if current_user.role == "Customer" and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this ticket")
        
    return ticket

@router.put("/tickets/{ticket_id}", response_model=schemas.TicketResponse)
def update_ticket(ticket_id: int, ticket_update: schemas.TicketUpdate, background_tasks: BackgroundTasks, current_user: models.User = Depends(get_module2_user), db: Session = Depends(database.get_db)):
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
def delete_ticket(ticket_id: int, current_user: models.User = Depends(get_module2_user), db: Session = Depends(database.get_db)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only Admins can delete tickets")
        
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    db.delete(ticket)
    db.commit()


# --- MODULE 2 MESSAGES REST ENDPOINTS ---

@router.get("/messages/{ticket_id}", response_model=List[schemas.MessageResponse])
def get_messages(ticket_id: int, current_user: models.User = Depends(get_module2_user), db: Session = Depends(database.get_db)):
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
            
            # Broadcast the new message object
            await manager.broadcast({
                "id": new_message.id,
                "ticket_id": new_message.ticket_id,
                "sender_id": new_message.sender_id,
                "message": new_message.message,
                "timestamp": new_message.timestamp.isoformat()
            }, ticket_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, ticket_id)

@router.websocket("/ws/notifications")
async def global_notifications_endpoint(websocket: WebSocket):
    await notification_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        notification_manager.disconnect(websocket)

