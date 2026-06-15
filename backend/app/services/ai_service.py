import os
import json
from google import genai
from google.genai import types

def get_client():
    api_key = os.getenv("GEMINI_API_KEY")
    return genai.Client(api_key=api_key)

def generate_reply_suggestions(messages_context: str) -> dict:
    """Generates professional, polite, and context-aware reply suggestions."""
    client = get_client()
    prompt = f"""
    Based on the following customer support ticket conversation, generate 3 different reply suggestions for the agent.
    The suggestions should be:
    1. Professional
    2. Polite
    3. Context-aware
    
    Conversation:
    {messages_context}
    
    Return the output strictly as a JSON object with keys 'professional', 'polite', and 'context_aware'. Do not wrap it in markdown codeblocks.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())
    except Exception as e:
        print("Failed to generate suggestions:", e)
        return {
            "professional": "Could you please provide more details?",
            "polite": "Thank you for reaching out. Let me look into this.",
            "context_aware": "I am checking your account right now."
        }

def analyze_sentiment(messages_context: str) -> str:
    """Analyzes the sentiment of the customer messages."""
    client = get_client()
    prompt = f"""
    Analyze the sentiment of the following customer support conversation.
    Respond with exactly one word: 'Positive', 'Neutral', or 'Negative'.
    
    Conversation:
    {messages_context}
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        result = response.text.strip().capitalize()
        if result not in ["Positive", "Neutral", "Negative"]:
            return "Neutral"
        return result
    except Exception as e:
        print("Failed to analyze sentiment:", e)
        return "Neutral"

def summarize_chat(messages_context: str) -> str:
    """Generates a concise summary of the conversation."""
    client = get_client()
    prompt = f"""
    Provide a concise, bulleted summary of the following customer support conversation.
    Focus on the main issue reported and the steps taken to resolve it.
    
    Conversation:
    {messages_context}
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        print("Failed to summarize chat:", e)
        return "Summary generation failed."

def generate_embedding(text: str) -> list[float]:
    """Generates a text embedding using Gemini."""
    client = get_client()
    try:
        response = client.models.embed_content(
            model="gemini-embedding-2",
            contents=text,
        )
        return response.embeddings[0].values
    except Exception as e:
        print("Failed to generate embedding:", e)
        return []

def generate_auto_reply(ticket_context: str) -> dict:
    """Generates an automatic reply and returns a confidence score."""
    client = get_client()
    prompt = f"""
    You are an AI customer support assistant acting as the first-line support agent.
    Based on the following ticket context, generate a helpful, polite, and accurate reply to the customer's last message.
    
    RESPONSE GUIDELINES:
    - Keep your response natural and conversational, but ensure you are comprehensive.
    - If there are "Relevant Knowledge Base Articles" provided in the context, strictly use them to answer the customer's question. You MUST include ALL the details, conditions, and instructions mentioned in the article so the customer gets complete information. Do not omit any steps or policies.
    - ALWAYS attempt to answer the customer or ask a clarifying question first.
    - If you are uncertain, respond naturally asking for details (e.g. "I can help with that. Could you provide your order ID?"). Do not escalate immediately.
    
    ESCALATION GUIDELINES:
    - You must determine if the ticket should be escalated to a human agent.
    - ONLY set "escalate" to true if:
      1. The customer explicitly asks for a human agent or requests escalation.
      2. The issue remains unresolved after multiple AI attempts to assist.
    - If you escalate, your reply MUST be: "I wasn't able to fully resolve this issue. I've forwarded your ticket to a support agent who will assist you shortly."
    
    Context:
    {ticket_context}
    
    Return the output strictly as a JSON object with keys 'reply' (string) and 'escalate' (boolean). Do not wrap it in markdown codeblocks.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )
        text = response.text.strip()
        parsed = json.loads(text)
        return {
            "reply": parsed.get("reply", ""),
            "escalate": parsed.get("escalate", False),
            "confidence": 1.0
        }
    except Exception as e:
        print("Failed to generate auto reply:", e)
        return {
            "reply": "I'm currently experiencing a system error. I've forwarded your ticket to a support agent who will assist you shortly.",
            "escalate": True,
            "confidence": 1.0
        }
