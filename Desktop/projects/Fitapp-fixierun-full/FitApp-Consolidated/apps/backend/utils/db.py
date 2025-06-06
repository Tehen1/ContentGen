import os
from flask import Flask
from flask_mongoengine import MongoEngine

# MongoDB instance
db = MongoEngine()

def initialize_db(app: Flask) -> MongoEngine:
    """
    Initialize database connection with the Flask app
    
    Args:
        app: Flask application instance
        
    Returns:
        MongoEngine instance
    """
    # Configure MongoDB
    app.config['MONGODB_SETTINGS'] = {
        'host': app.config.get('MONGO_URI', 'mongodb://localhost:27017/fitness_app'),
        'db': os.getenv('MONGO_DB_NAME', 'fitness_app'),
        'connect': True,
        'connectTimeoutMS': 30000,
        'socketTimeoutMS': 30000,
    }
    
    # Initialize the connection
    db.init_app(app)
    
    # Log connection status
    if app.config['DEBUG']:
        print(f"Connected to MongoDB at {app.config['MONGODB_SETTINGS']['host']}")
    
    return db

def get_async_client():
    """
    Get an async MongoDB client using Motor
    
    Returns:
        AsyncIOMotorClient instance
    """
    from motor.motor_asyncio import AsyncIOMotorClient
    
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/fitness_app')
    db_name = os.getenv('MONGO_DB_NAME', 'fitness_app')
    
    client = AsyncIOMotorClient(mongo_uri)
    return client[db_name]