import os
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
env_file = os.getenv('ENV_FILE', '.env')
if os.path.exists(env_file):
    load_dotenv(env_file, override=True)

# Import routes (will be registered later)
from routes import auth_routes, activity_routes, web3_routes

# Import database connection
from utils.db import initialize_db

# Create Flask app
app = Flask(__name__)

# App configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key')
app.config['DEBUG'] = os.getenv('DEBUG', 'False').lower() == 'true'
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/fitness_app')
app.config['ALLOWED_ORIGINS'] = os.getenv('ALLOWED_ORIGINS', '*').split(',')

# Initialize CORS
CORS(app, resources={r"/api/*": {"origins": app.config['ALLOWED_ORIGINS']}})

# Initialize Socket.IO for real-time communication
socketio = SocketIO(app, cors_allowed_origins=app.config['ALLOWED_ORIGINS'])

# Initialize database
db = initialize_db(app)

# Register blueprints
app.register_blueprint(auth_routes.bp, url_prefix='/api/auth')
app.register_blueprint(activity_routes.bp, url_prefix='/api/activities')
app.register_blueprint(web3_routes.bp, url_prefix='/api/web3')

# Register SocketIO events
from routes.websocket_routes import register_socket_events
register_socket_events(socketio)

# Database initialization
@app.before_first_request
def create_db_collections():
    """Ensure all collections exist"""
    db.create_all()

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return {'status': 'ok', 'version': '1.0.0'}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    socketio.run(app, host=host, port=port)