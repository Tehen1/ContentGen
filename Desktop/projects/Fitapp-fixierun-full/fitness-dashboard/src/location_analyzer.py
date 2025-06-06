"""
Location History Analyzer Module

This module processes location history data and TCX files to extract cycling activities,
calculate distances, and identify routes for visualization.
"""

import json
import os
import logging
import hashlib
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from math import radians, cos, sin, asin, sqrt
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional, Set

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Constants
EARTH_RADIUS = 6371  # km
CYCLING_KEYWORDS = ["CYCLING", "BICYCLE", "BIKE", "RIDE", "vélo", "cyclisme"]

# Geographic location constants
CITIES = {
    "Barcelona": {"center": (41.3874, 2.1686), "radius": 25.0},
    "Paris": {"center": (48.8566, 2.3522), "radius": 25.0},
    "London": {"center": (51.5074, -0.1278), "radius": 25.0},
}

TCX_NAMESPACES = {
    'ns': 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2',
    'ns2': 'http://www.garmin.com/xmlschemas/UserProfile/v2',
    'ns3': 'http://www.garmin.com/xmlschemas/ActivityExtension/v2',
    'ns4': 'http://www.garmin.com/xmlschemas/ProfileExtension/v1',
    'ns5': 'http://www.garmin.com/xmlschemas/ActivityGoals/v1'
}

class LocationHistoryAnalyzer:
    """Process and analyze location history data for cycling activities."""

    def __init__(self, file_path: str, tcx_directories: List[str] = None, expected_total_distance: float = 0):
        """
        Initialize the analyzer with the path to the location history file and TCX directories.

        Args:
            file_path: Path to the location-history.json file
            tcx_directories: List of directories containing TCX files
            expected_total_distance: Expected total distance in km (for verification)
        """
        self.file_path = file_path
        self.tcx_directories = tcx_directories or []
        self.expected_total_distance = expected_total_distance

        # Ensure TCX directories are absolute paths and exist
        validated_dirs = []
        for directory in self.tcx_directories:
            if os.path.exists(directory):
                validated_dirs.append(directory)
            else:
                logger.warning(f"TCX directory does not exist: {directory}")

        self.tcx_directories = validated_dirs
        logger.info(f"Initialized with {len(self.tcx_directories)} valid TCX directories")
        self.cycling_activities = []
        self.total_distance = 0.0
        self.routes = {}
        self.loaded = False
        self.processed_files_hashes = set()  # Store hashes of processed files to prevent duplicates
        self.city_statistics = {}  # Statistics for different cities

    def load_data(self) -> bool:
        """
        Load and parse the location history data from JSON file.

        Returns:
            bool: True if data was loaded successfully, False otherwise
        """
        try:
            logger.info(f"Loading location history from {self.file_path}")

            if not os.path.exists(self.file_path):
                logger.error(f"Location history file not found: {self.file_path}")
                return False

            with open(self.file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)

            # Handle different JSON structures
            # Check if data is a list (array of activities)
            if isinstance(data, list):
                self.raw_data = data
                logger.info(f"Successfully loaded {len(self.raw_data)} activity records (array format)")
                self.loaded = True
                return True
            # Check for timelineObjects field (old format)
            elif 'timelineObjects' in data:
                self.raw_data = data['timelineObjects']
                logger.info(f"Successfully loaded {len(self.raw_data)} timeline objects (timelineObjects format)")
                self.loaded = True
                return True
            else:
                logger.error("Unrecognized location history format")
                return False

        except json.JSONDecodeError:
            logger.error("Failed to parse location history JSON", exc_info=True)
            return False
        except Exception as e:
            logger.error(f"Error loading location history: {str(e)}", exc_info=True)
            return False

    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate the great circle distance between two points using the Haversine formula.

        Args:
            lat1, lon1: Coordinates of the first point
            lat2, lon2: Coordinates of the second point

        Returns:
            float: Distance in kilometers
        """
        # Convert decimal degrees to radians
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

        # Haversine formula
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))

        # Radius of earth in kilometers
        return c * EARTH_RADIUS

    def _calculate_path_distance(self, waypoints: List[Dict]) -> float:
        """
        Calculate the total distance of a path from a list of waypoints.

        Args:
            waypoints: List of waypoints with latE7 and lngE7 fields

        Returns:
            float: Total distance in kilometers
        """
        distance = 0.0

        if not waypoints or len(waypoints) < 2:
            return distance

        for i in range(len(waypoints) - 1):
            point1 = waypoints[i]
            point2 = waypoints[i + 1]

            lat1 = point1.get('latE7', 0) / 1e7
            lon1 = point1.get('lngE7', 0) / 1e7
            lat2 = point2.get('latE7', 0) / 1e7
            lon2 = point2.get('lngE7', 0) / 1e7

            segment_distance = self.calculate_distance(lat1, lon1, lat2, lon2)
            distance += segment_distance

        return distance

    def _convert_waypoints_to_route_points(self, waypoints: List[Dict]) -> List[Tuple[float, float]]:
        """
        Convert a list of waypoints to route points format.

        Args:
            waypoints: List of waypoints with latE7 and lngE7 fields

        Returns:
            List[Tuple[float, float]]: List of (latitude, longitude) tuples
        """
        route_points = []

        for point in waypoints:
            lat = point.get('latE7', 0) / 1e7
            lon = point.get('lngE7', 0) / 1e7
            route_points.append((lat, lon))

        return route_points

    def extract_cycling_activities(self) -> List[Dict[str, Any]]:
        """
        Extract cycling activities from the location history data.
        Handles both the new array format and old timelineObjects format.

        Returns:
            List[Dict]: List of cycling activities with relevant details
        """
        if not self.loaded and not self.load_data():
            logger.error("Cannot extract cycling activities: Data not loaded")
            return []

        try:
            cycling_activities = []

            for item in self.raw_data:
                # Handle array format (new format)
                if isinstance(item, dict) and 'startTime' in item and 'activity' in item:
                    # Check activity lists for cycling
                    activity_data = item.get('activity', [])
                    is_cycling = False
                    activity_type = ""

                    # Handle both list and dictionary formats for the activity field
                    if isinstance(activity_data, dict):
                        # If activity is a dictionary, process it directly
                        activity_type_entry = activity_data.get('type', '')
                        # Check if it's a cycling activity
                        if any(keyword in activity_type_entry.upper() for keyword in [k.upper() for k in CYCLING_KEYWORDS]):
                            is_cycling = True
                            activity_type = activity_type_entry
                    else:
                        # Process activity as a list (original behavior)
                        for activity_entry in activity_data:
                            activity_type_entry = activity_entry.get('type', '')
                            # Check if it's a top candidate
                            if 'topCandidate' in activity_entry and activity_entry.get('topCandidate', False):
                                activity_type = activity_type_entry

                        # Check if it's a cycling activity
                        if any(keyword in activity_type_entry.upper() for keyword in [k.upper() for k in CYCLING_KEYWORDS]):
                            is_cycling = True
                            activity_type = activity_type_entry
                            break

                    if is_cycling:
                        # Process cycling activity
                        # ... [rest of the code from the original extract_cycling_activities method]
                        # (This is truncated for brevity but would include the rest of the method)

                        # Parse timestamps, calculate distances, etc.
                        # Create cycling activity record
                        # Append to cycling_activities list
                        pass

                # Handle timelineObjects format (old format)
                elif 'activitySegment' in item:
                    # ... [code for processing timelineObjects format]
                    # (This is truncated for brevity but would include the processing code)
                    pass

            # Calculate total distance and store results
            # ... [rest of the method]

            return cycling_activities

        except Exception as e:
            logger.error(f"Error extracting cycling activities: {str(e)}", exc_info=True)
            return []

    # Additional methods would be included here:
    # - verify_total_distance
    # - identify_common_routes
    # - _are_points_close
    # - get_route_details
    # - process_tcx_files
    # - _calculate_file_hash
    # - _parse_tcx_file
    # - filter_activities_by_location
    # - is_activity_in_location
    # - get_activity_stats_by_date_range