from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="Customer") # customer, agent, admin
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tickets = relationship("Ticket", foreign_keys="[Ticket.user_id]", back_populates="user")
    messages = relationship("Message", back_populates="sender")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="Open") # Open, Pending, Closed
    priority = Column(String, default="Medium") # Low, Medium, High
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id], back_populates="tickets")
    assigned_user = relationship("User", foreign_keys=[assigned_to], backref="assigned_tickets")
    messages = relationship("Message", back_populates="ticket")
    ai_analysis = relationship("AIAnalysis", back_populates="ticket", uselist=False)

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    ticket = relationship("Ticket", back_populates="messages")
    sender = relationship("User", back_populates="messages")

class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    content = Column(Text, nullable=False)
    source = Column(String)

class AIAnalysis(Base):
    __tablename__ = "ai_analysis"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    sentiment = Column(String)
    category = Column(String)
    summary = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ticket = relationship("Ticket", back_populates="ai_analysis")
