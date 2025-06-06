import os
import requests

def fetch_location_data(api_key: str, start_date: str, end_date: str) -> dict:
    """
    Fetches location history data from Google Maps API.
    
    Args:
        api_key (str): Google Maps API key
        start_date (str): Start date in 'YYYY-MM-DD' format
        end_date (str): End date in 'YYYY-MM-DD' format
        
    Returns:
        dict: JSON response containing location data
    """
    url = "https://www.googleapis.com/maps/activity/v1/users/self"
    params = {
        "key": api_key,
        "startTime": start_date,
        "endTime": end_date
    }
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    
    return response.json()