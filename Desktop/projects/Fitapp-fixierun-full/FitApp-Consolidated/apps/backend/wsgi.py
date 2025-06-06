"""
WSGI entry point for production deployments
"""
from app import app, socketio

if __name__ == "__main__":
    socketio.run(app)