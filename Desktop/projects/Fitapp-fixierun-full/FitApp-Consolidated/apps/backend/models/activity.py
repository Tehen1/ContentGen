import mongoengine as db
from datetime import datetime
from typing import Dict, List, Optional, Tuple

class LocationPoint(db.EmbeddedDocument):
    """Geographic point with coordinates"""
    type = db.StringField(default="Point")
    coordinates = db.GeoPointField()  # [longitude, latitude]
    
    def to_dict(self) -> Dict:
        """Convert to dictionary representation"""
        return {
            'type': self.type,
            'coordinates': self.coordinates,
            'latitude': self.coordinates[1] if self.coordinates else None,
            'longitude': self.coordinates[0] if self.coordinates else None
        }

class RoutePoint(db.EmbeddedDocument):
    """Point in an activity route with additional metrics"""
    location = db.EmbeddedDocumentField(LocationPoint, required=True)
    timestamp = db.DateTimeField(required=True)
    elevation = db.FloatField()  # in meters
    heart_rate = db.IntField()  # beats per minute
    cadence = db.IntField()  # steps per minute
    
    def to_dict(self) -> Dict:
        """Convert to dictionary representation"""
        return {
            'location': self.location.to_dict() if self.location else None,
            'timestamp': self.timestamp.isoformat(),
            'elevation': self.elevation,
            'heart_rate': self.heart_rate,
            'cadence': self.cadence
        }

class Activity(db.Document):
    """User fitness activity tracking model"""
    user_id = db.ObjectIdField(required=True)
    start_time = db.DateTimeField(default=datetime.utcnow, required=True)
    end_time = db.DateTimeField()
    activity_type = db.StringField(required=True, choices=[
        'walking', 'running', 'cycling', 'swimming', 
        'hiking', 'yoga', 'strength_training', 'other'
    ])
    distance = db.FloatField()  # in kilometers
    duration = db.IntField()  # in seconds
    calories = db.IntField()
    route = db.ListField(db.EmbeddedDocumentField(RoutePoint))
    average_pace = db.FloatField()  # min/km
    average_heart_rate = db.IntField()  # bpm
    elevation_gain = db.FloatField()  # meters
    nft_minted = db.BooleanField(default=False)
    nft_token_id = db.StringField()
    weather_conditions = db.DictField()  # {'temp': 23.5, 'condition': 'clear', 'humidity': 60}
    
    meta = {
        'collection': 'activities',
        'indexes': [
            'user_id',
            'start_time',
            {'fields': [('route.location', '2dsphere')], 'sparse': True}
        ]
    }
    
    @property
    def is_completed(self) -> bool:
        """Check if activity is completed"""
        return self.end_time is not None
    
    def add_route_point(self, 
                        latitude: float, 
                        longitude: float, 
                        timestamp: Optional[datetime] = None,
                        elevation: Optional[float] = None,
                        heart_rate: Optional[int] = None,
                        cadence: Optional[int] = None) -> None:
        """Add a point to the activity route"""
        if timestamp is None:
            timestamp = datetime.utcnow()
            
        location = LocationPoint(
            type="Point",
            coordinates=[longitude, latitude]
        )
        
        point = RoutePoint(
            location=location,
            timestamp=timestamp,
            elevation=elevation,
            heart_rate=heart_rate,
            cadence=cadence
        )
        
        if self.route is None:
            self.route = []
            
        self.route.append(point)
    
    def complete_activity(self) -> None:
        """Mark activity as completed and calculate metrics"""
        if self.is_completed:
            return
            
        self.end_time = datetime.utcnow()
        
        # Calculate duration
        if self.start_time:
            self.duration = int((self.end_time - self.start_time).total_seconds())
        
        # Calculate metrics if we have route data
        if self.route and len(self.route) > 1:
            # Calculate distance using route data
            self.distance = self._calculate_distance()
            
            # Calculate elevation gain
            self.elevation_gain = self._calculate_elevation_gain()
            
            # Calculate average heart rate
            self._calculate_average_heart_rate()
            
            # Calculate average pace
            if self.distance and self.distance > 0 and self.duration:
                # Convert to min/km
                self.average_pace = (self.duration / 60) / self.distance
        
        self.save()
    
    def _calculate_distance(self) -> float:
        """Calculate total distance based on route points"""
        from geopy.distance import geodesic
        
        total_distance = 0.0
        prev_point = None
        
        for point in self.route:
            if prev_point is not None and point.location and prev_point.location:
                # Get coordinates as (lat, lon) for geopy
                prev_coords = (prev_point.location.coordinates[1], prev_point.location.coordinates[0])
                current_coords = (point.location.coordinates[1], point.location.coordinates[0])
                
                # Calculate distance between points in km
                segment_distance = geodesic(prev_coords, current_coords).kilometers
                total_distance += segment_distance
                
            prev_point = point
            
        return round(total_distance, 3)
    
    def _calculate_elevation_gain(self) -> float:
        """Calculate elevation gain from route points"""
        total_gain = 0.0
        prev_elevation = None
        
        for point in self.route:
            if prev_elevation is not None and point.elevation is not None:
                # Only count positive elevation changes
                elevation_diff = point.elevation - prev_elevation
                if elevation_diff > 0:
                    total_gain += elevation_diff
            
            if point.elevation is not None:
                prev_elevation = point.elevation
                
        return round(total_gain, 1)
    
    def _calculate_average_heart_rate(self) -> None:
        """Calculate average heart rate from route points"""
        heart_rates = [p.heart_rate for p in self.route if p.heart_rate is not None]
        
        if heart_rates:
            self.average_heart_rate = int(sum(heart_rates) / len(heart_rates))
    
    def to_dict(self) -> Dict:
        """Convert to dictionary representation"""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'activity_type': self.activity_type,
            'distance': self.distance,
            'duration': self.duration,
            'calories': self.calories,
            'average_pace': self.average_pace,
            'average_heart_rate': self.average_heart_rate,
            'elevation_gain': self.elevation_gain,
            'is_completed': self.is_completed,
            'nft_minted': self.nft_minted,
            'nft_token_id': self.nft_token_id,
            'weather_conditions': self.weather_conditions,
            'route_points': len(self.route) if self.route else 0,
        }
    
    def to_dict_with_route(self) -> Dict:
        """Convert to dictionary with full route information"""
        activity_dict = self.to_dict()
        
        if self.route:
            activity_dict['route'] = [point.to_dict() for point in self.route]
            
        return activity_dict
    
    @classmethod
    def get_user_activities(cls, user_id: str, limit: int = 20, skip: int = 0) -> List['Activity']:
        """Get activities for a specific user with pagination"""
        return cls.objects(user_id=user_id).order_by('-start_time').skip(skip).limit(limit)
    
    @classmethod
    def get_activity_stats(cls, user_id: str) -> Dict:
        """Get activity statistics for a user"""
        pipeline = [
            {'$match': {'user_id': user_id}},
            {'$group': {
                '_id': '$activity_type',
                'count': {'$sum': 1},
                'total_distance': {'$sum': '$distance'},
                'total_duration': {'$sum': '$duration'},
                'total_calories': {'$sum': '$calories'}
            }},
        ]
        
        results = cls.objects.aggregate(pipeline)
        
        stats = {
            'total_activities': 0,
            'total_distance': 0,
            'total_duration': 0,
            'total_calories': 0,
            'activities_by_type': {}
        }
        
        for result in results:
            activity_type = result['_id']
            stats['total_activities'] += result['count']
            stats['total_distance'] += result.get('total_distance', 0) or 0
            stats['total_duration'] += result.get('total_duration', 0) or 0
            stats['total_calories'] += result.get('total_calories', 0) or 0
            
            stats['activities_by_type'][activity_type] = {
                'count': result['count'],
                'total_distance': result.get('total_distance', 0) or 0,
                'total_duration': result.get('total_duration', 0) or 0,
                'total_calories': result.get('total_calories', 0) or 0
            }
            
        return stats