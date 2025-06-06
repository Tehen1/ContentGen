import logging
import os
import sys
import json
from datetime import datetime
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler

# Get environment variables
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO').upper()
LOG_FORMAT = os.getenv('LOG_FORMAT', 'json')  # 'json' or 'text'
LOG_TO_FILE = os.getenv('LOG_TO_FILE', 'False').lower() == 'true'
LOG_DIR = os.getenv('LOG_DIR', 'logs')
LOG_MAX_SIZE = int(os.getenv('LOG_MAX_SIZE', 10 * 1024 * 1024))  # 10 MB
LOG_BACKUP_COUNT = int(os.getenv('LOG_BACKUP_COUNT', 5))

# Create logs directory if it doesn't exist
if LOG_TO_FILE and not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# Define log level mapping
LOG_LEVEL_MAP = {
    'DEBUG': logging.DEBUG,
    'INFO': logging.INFO,
    'WARNING': logging.WARNING,
    'ERROR': logging.ERROR,
    'CRITICAL': logging.CRITICAL
}

class JsonFormatter(logging.Formatter):
    """
    Format logs as JSON for easier parsing
    """
    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
            
        # Add extra fields if present
        if hasattr(record, 'extra'):
            log_data.update(record.extra)
            
        return json.dumps(log_data)

def setup_logger(name=None):
    """
    Set up and configure logger
    
    Args:
        name: Logger name. If None, use root logger
        
    Returns:
        Configured logger
    """
    # Get logger
    logger = logging.getLogger(name)
    
    # Skip if logger is already configured
    if logger.handlers:
        return logger
        
    # Set log level
    level = LOG_LEVEL_MAP.get(LOG_LEVEL, logging.INFO)
    logger.setLevel(level)
    
    # Create formatters
    if LOG_FORMAT.lower() == 'json':
        formatter = JsonFormatter()
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    # Create handlers
    handlers = []
    
    # Always add console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    handlers.append(console_handler)
    
    # Add file handler if enabled
    if LOG_TO_FILE:
        # Use rotating file handler
        log_file = os.path.join(LOG_DIR, f"{name or 'app'}.log")
        file_handler = RotatingFileHandler(
            log_file, 
            maxBytes=LOG_MAX_SIZE, 
            backupCount=LOG_BACKUP_COUNT
        )
        file_handler.setFormatter(formatter)
        handlers.append(file_handler)
        
        # Also add an error-specific handler
        error_file = os.path.join(LOG_DIR, f"{name or 'app'}_error.log")
        error_handler = RotatingFileHandler(
            error_file, 
            maxBytes=LOG_MAX_SIZE, 
            backupCount=LOG_BACKUP_COUNT
        )
        error_handler.setFormatter(formatter)
        error_handler.setLevel(logging.ERROR)
        handlers.append(error_handler)
    
    # Add handlers to logger
    for handler in handlers:
        logger.addHandler(handler)
    
    return logger

# Default application logger
app_logger = setup_logger('fitapp')

def log_with_context(level, message, extra=None):
    """
    Log message with extra context
    
    Args:
        level: Log level ('debug', 'info', 'warning', 'error', 'critical')
        message: Log message
        extra: Extra context as dictionary
    """
    if extra is None:
        extra = {}
        
    # Add timestamp
    extra['timestamp'] = datetime.utcnow().isoformat()
    
    # Get log method
    log_method = getattr(app_logger, level.lower())
    
    # Log message with extra context
    log_method(message, extra={'extra': extra})

# Convenience methods
def debug(message, extra=None):
    log_with_context('debug', message, extra)

def info(message, extra=None):
    log_with_context('info', message, extra)

def warning(message, extra=None):
    log_with_context('warning', message, extra)

def error(message, extra=None):
    log_with_context('error', message, extra)

def critical(message, extra=None):
    log_with_context('critical', message, extra)

def exception(message, exc_info=True, extra=None):
    """
    Log exception with traceback
    
    Args:
        message: Log message
        exc_info: Exception info
        extra: Extra context as dictionary
    """
    app_logger.exception(message, exc_info=exc_info, extra={'extra': extra or {}})