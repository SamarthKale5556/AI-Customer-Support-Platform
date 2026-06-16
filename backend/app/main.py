from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import traceback
from . import models, routes, ai_routes, kb_routes, analytics_routes
from .database import engine

# Create tables (For production use Alembic, but for this setup we just create them)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-Powered Customer Support Platform API")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins to make it simpler and avoid CORS errors
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router)
app.include_router(ai_routes.router)
app.include_router(kb_routes.router)
app.include_router(analytics_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI-Powered Customer Support Platform API"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    print("GLOBAL EXCEPTION:", tb)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "traceback": tb}
    )
