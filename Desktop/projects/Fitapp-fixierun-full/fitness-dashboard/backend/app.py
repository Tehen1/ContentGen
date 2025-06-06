from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager
import os
import importlib
import glob
from pathlib import Path

# Database imports
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from database import get_db, engine, Base

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Application lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event: create database tables if they don't exist
    logger.info("Starting FitApp backend service")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
    
    yield
    
    # Shutdown event
    logger.info("Shutting down FitApp backend service")


# Initialize FastAPI app
app = FastAPI(
    title="FitApp Backend API",
    description="Backend services for the FitApp fitness application",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://fitapp.example.com"],  # Update with your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

# Include all routers dynamically
router_path = Path(__file__).parent / "routers"
router_files = glob.glob(str(router_path / "*.py"))

for router_file in router_files:
    module_name = os.path.basename(router_file)[:-3]  # Remove .py extension
    if module_name != "__init__" and not module_name.startswith("_"):
        module_path = f"routers.{module_name}"
        try:
            router_module = importlib.import_module(module_path, package="backend")
            if hasattr(router_module, "router"):
                prefix = f"/api/{module_name.replace('_', '-')}"
                app.include_router(router_module.router, prefix=prefix)
                logger.info(f"Added router: {module_path} with prefix {prefix}")
        except ImportError as e:
            logger.error(f"Error importing router {module_path}: {e}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Root endpoint redirecting to docs
@app.get("/")
async def redirect_to_docs():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/docs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

