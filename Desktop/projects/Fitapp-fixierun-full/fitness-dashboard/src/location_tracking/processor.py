import math
from typing import List, Dict

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on the Earth using the haversine formula.
    
    Args:
        lat1 (float): Latitude of the first point in decimal degrees.
        lon1 (float): Longitude of the first point in decimal degrees.
        lat2 (float): Latitude of the second point in decimal degrees.
        lon2 (float): Longitude of the second point in decimal degrees.
        
    Returns:
        float: Distance between the two points in kilometers.
    """
    # Convert degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = 6371 * c  # Earth radius in kilometers
    return distance

def process_location_data(transformed_data: List[Dict]) -> Dict:
    """
    Processes transformed location data to calculate total distance traveled.
    
    Args:
        transformed_data (List[Dict]): List of transformed location records.
        
    Returns:
        Dict: Dictionary containing the total distance traveled in kilometers.
        
    Raises:
        ValueError: If transformed_data is empty or contains less than two points.
    """
    if not transformed_data:
        raise ValueError("No data to process.")
        
    total_distance = 0.0
    
    # Iterate through consecutive points
    for i in range(len(transformed_data) - 1):
        current = transformed_data[i]
        next_point = transformed_data[i + 1]
        
        # Check if accuracy is sufficient
        if current['accuracy'] < 100 and next_point['accuracy'] < 100:
            distance = haversine(
                current['latitude'],
                current['longitude'],
                next_point['latitude'],
                next_point['longitude']
            )
            total_distance += distance
            
    return {'total_distance': total_distance}