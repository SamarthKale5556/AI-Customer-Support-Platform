from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = "User"
    role: Optional[str] = "Customer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: Optional[str] = None
    email: EmailStr
    role: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TicketCreate(BaseModel):
    title: str
    description: str
    priority: Optional[str] = "Medium"

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[int] = None

class TicketResponse(BaseModel):
    id: int
    user_id: int
    assigned_to: Optional[int]
    title: str
    description: str
    status: str
    priority: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    message: str

class MessageResponse(BaseModel):
    id: int
    ticket_id: int
    sender_id: int
    sender_role: Optional[str] = None
    message: str
    timestamp: datetime
    
    class Config:
        from_attributes = True
