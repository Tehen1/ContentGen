import re
from typing import Dict, Tuple, Union

def validate_email(email: str) -> bool:
    """
    Validate email format
    
    Args:
        email: Email address to validate
        
    Returns:
        True if email is valid, False otherwise
    """
    # Basic email regex pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password(password: str) -> Dict[str, Union[bool, str]]:
    """
    Validate password strength
    
    Args:
        password: Password to validate
        
    Returns:
        Dictionary with validation result and message
    """
    # Check password length
    if len(password) < 8:
        return {
            'valid': False,
            'message': 'Password must be at least 8 characters long'
        }
    
    # Check if password contains at least one uppercase letter
    if not any(c.isupper() for c in password):
        return {
            'valid': False,
            'message': 'Password must contain at least one uppercase letter'
        }
    
    # Check if password contains at least one lowercase letter
    if not any(c.islower() for c in password):
        return {
            'valid': False,
            'message': 'Password must contain at least one lowercase letter'
        }
    
    # Check if password contains at least one digit
    if not any(c.isdigit() for c in password):
        return {
            'valid': False,
            'message': 'Password must contain at least one digit'
        }
    
    # Check if password contains at least one special character
    special_chars = r'[!@#$%^&*(),.?":{}|<>]'
    if not bool(re.search(special_chars, password)):
        return {
            'valid': False,
            'message': 'Password must contain at least one special character'
        }
    
    return {
        'valid': True,
        'message': 'Password is valid'
    }

def validate_activity_type(activity_type: str) -> bool:
    """
    Validate activity type
    
    Args:
        activity_type: Activity type to validate
        
    Returns:
        True if activity type is valid, False otherwise
    """
    valid_types = [
        'walking', 'running', 'cycling', 'swimming', 
        'hiking', 'yoga', 'strength_training', 'other'
    ]
    
    return activity_type in valid_types

def validate_coordinates(latitude: float, longitude: float) -> Tuple[bool, str]:
    """
    Validate geographic coordinates
    
    Args:
        latitude: Latitude value
        longitude: Longitude value
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        lat = float(latitude)
        lon = float(longitude)
        
        # Check latitude range (-90 to 90)
        if lat < -90 or lat > 90:
            return False, "Latitude must be between -90 and 90"
        
        # Check longitude range (-180 to 180)
        if lon < -180 or lon > 180:
            return False, "Longitude must be between -180 and 180"
        
        return True, ""
        
    except (ValueError, TypeError):
        return False, "Coordinates must be valid numbers"

def sanitize_string(input_string: str, max_length: int = 500) -> str:
    """
    Sanitize string input by removing potentially dangerous characters
    
    Args:
        input_string: String to sanitize
        max_length: Maximum allowed length
        
    Returns:
        Sanitized string
    """
    if not input_string:
        return ""
        
    # Truncate to maximum length
    result = input_string[:max_length]
    
    # Remove potentially dangerous characters
    result = re.sub(r'[<>]', '', result)
    
    return result