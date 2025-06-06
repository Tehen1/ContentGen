from typing import Dict, List, Optional

def transform_location_data(raw_data: Dict) -> List[Dict]:
    """
    Transforms raw location data from Google Maps API into a standardized format.
    
    Args:
        raw_data (Dict): Raw JSON response from Google Maps API
        
    Returns:
        List[Dict]: List of transformed location records with standardized fields
    """
    transformed_data = []
    
    for activity in raw_data.get('locations', []):
        transformed_record = {
            'timestamp': activity.get('timestamp'),
            'latitude': float(activity.get('latitude', 0.0)),
            'longitude': float(activity.get('longitude', 0.0)),
            'activity_type': activity.get('activity', {}).get('type', 'unknown'),
            'accuracy': float(activity.get('accuracy', 0.0))
        }
        transformed_data.append(transformed_record)
        
    return transformed_data