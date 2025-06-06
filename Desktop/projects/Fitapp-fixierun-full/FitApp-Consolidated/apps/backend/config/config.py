import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Load environment-specific .env file
env = os.getenv('FLASK_ENV', 'development')
env_file = f'.env.{env}'
if os.path.exists(env_file):
    load_dotenv(env_file, override=True)

class BaseConfig:
    """Base configuration with common settings"""
    
    # Application settings
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')
    
    # MongoDB settings
    MONGODB_SETTINGS = {
        'host': os.getenv('MONGO_URI', 'mongodb://localhost:27017/fitness_app'),
        'db': os.getenv('MONGO_DB_NAME', 'fitness_app'),
        'connect': True,
        'connectTimeoutMS': 30000,
        'socketTimeoutMS': 30000,
    }
    
    # JWT settings
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600)))
    
    # Web3 settings
    WEB3_PROVIDER_URI = os.getenv('WEB3_PROVIDER_URI')
    NFT_CONTRACT_ADDRESS = os.getenv('NFT_CONTRACT_ADDRESS')
    WALLET_PRIVATE_KEY = os.getenv('WALLET_PRIVATE_KEY')
    CHAIN_ID = int(os.getenv('CHAIN_ID', 1))
    
    # CORS settings
    CORS_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*').split(',')
    
    # Socket.IO settings
    SOCKETIO_CORS_ALLOWED_ORIGINS = CORS_ORIGINS
    
    # Cache settings
    CACHE_ENABLED = os.getenv('CACHE_ENABLED', 'True').lower() == 'true'
    CACHE_DEFAULT_TTL = int(os.getenv('CACHE_DEFAULT_TTL', 300))
    
    # Logging settings
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = os.getenv('LOG_FORMAT', 'json')
    LOG_TO_FILE = os.getenv('LOG_TO_FILE', 'False').lower() == 'true'
    LOG_DIR = os.getenv('LOG_DIR', 'logs')
    
    # Feature flags
    FEATURE_NFT_MINTING = os.getenv('FEATURE_NFT_MINTING', 'True').lower() == 'true'
    FEATURE_SOCIAL_SHARING = os.getenv('FEATURE_SOCIAL_SHARING', 'True').lower() == 'true'
    
    # API rate limiting
    RATELIMIT_ENABLED = os.getenv('RATELIMIT_ENABLED', 'True').lower() == 'true'
    RATELIMIT_DEFAULT = os.getenv('RATELIMIT_DEFAULT', '100/hour')
    
    # Maximum content sizes
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 10 * 1024 * 1024))  # 10 MB

class DevelopmentConfig(BaseConfig):
    """Development configuration"""
    DEBUG = True
    
    # Override settings for development
    CACHE_ENABLED = False
    
    # Logging settings
    LOG_LEVEL = 'DEBUG'
    LOG_FORMAT = 'text'

class TestingConfig(BaseConfig):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    
    # Use in-memory database for testing
    MONGODB_SETTINGS = {
        'host': 'mongomock://localhost/test_fitness_app',
        'connect': False,
    }
    
    # Disable features that need external services
    FEATURE_NFT_MINTING = False
    
    # Disable caching for tests
    CACHE_ENABLED = False
    
    # Faster token expiration for testing
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=60)

class ProductionConfig(BaseConfig):
    """Production configuration"""
    # Ensure sensitive settings are set from environment variables
    def __init__(self):
        # Check that required environment variables are set
        required_vars = [
            'SECRET_KEY',
            'JWT_SECRET_KEY',
            'MONGO_URI',
            'WEB3_PROVIDER_URI',
            'NFT_CONTRACT_ADDRESS',
            'WALLET_PRIVATE_KEY'
        ]
        
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    # Override settings for production
    DEBUG = False
    
    # Enable file logging in production
    LOG_TO_FILE = True
    
    # More aggressive rate limiting in production
    RATELIMIT_DEFAULT = '60/minute'
    
    # Enable secure cookies
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_HTTPONLY = True

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration based on environment"""
    config_name = os.getenv('FLASK_ENV', 'development')
    return config.get(config_name, config['default'])