import jwt
from flask import current_app
from flask_socketio import emit, join_room, leave_room
from bson.objectid import ObjectId
from datetime import datetime
from models.user import User
from models.activity import Activity

def register_socket_events(socketio):
    """Register all SocketIO event handlers"""
    
    @socketio.on('connect')
    def handle_connect():
        """Handle new socket connection"""
        print("Client connected")
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle socket disconnection"""
        print("Client disconnected")
    
    @socketio.on('authenticate')
    def handle_authenticate(data):
        """Authenticate user for socket connection"""
        if 'token' not in data:
            emit('auth_response', {'success': False, 'message': 'Authentication token required'})
            return
            
        try:
            # Decode token
            token = data['token']
            decoded = jwt.decode(
                token, 
                current_app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
            
            # Get user from database
            user = User.objects(id=ObjectId(decoded['user_id'])).first()
            
            if not user:
                emit('auth_response', {'success': False, 'message': 'User not found'})
                return
                
            # Check if user is active
            if not user.is_active:
                emit('auth_response', {'success': False, 'message': 'User account is deactivated'})
                return
                
            # Join user's personal room for targeted events
            join_room(str(user.id))
            
            # Store user information in session
            current_app.config['socket_sessions'] = current_app.config.get('socket_sessions', {})
            current_app.config['socket_sessions'][request.sid] = {
                'user_id': str(user.id),
                'authenticated': True
            }
            
            emit('auth_response', {
                'success': True, 
                'message': 'Authentication successful',
                'user': user.to_dict()
            })
            
        except jwt.ExpiredSignatureError:
            emit('auth_response', {'success': False, 'message': 'Token has expired'})
        except jwt.InvalidTokenError:
            emit('auth_response', {'success': False, 'message': 'Invalid token'})
        except Exception as e:
            emit('auth_response', {'success': False, 'message': f'Authentication failed: {str(e)}'})
    
    @socketio.on('start_activity')
    def handle_start_activity(data):
        """Start a new activity tracking session"""
        # Check if user is authenticated
        session_data = current_app.config.get('socket_sessions', {}).get(request.sid)
        if not session_data or not session_data.get('authenticated'):
            emit('error', {'message': 'Authentication required'})
            return
            
        user_id = session_data['user_id']
        
        try:
            # Validate activity type
            if 'activity_type' not in data:
                emit('error', {'message': 'Activity type is required'})
                return
                
            # Create new activity
            activity = Activity(
                user_id=ObjectId(user_id),
                activity_type=data['activity_type'],
                start_time=datetime.utcnow()
            )
            
            # Save activity
            activity.save()
            
            # Store activity ID in session
            current_app.config['socket_sessions'][request.sid]['activity_id'] = str(activity.id)
            
            # Join activity room for group updates
            join_room(f"activity:{activity.id}")
            
            emit('activity_started', {
                'activity_id': str(activity.id),
                'timestamp': activity.start_time.isoformat(),
                'activity_type': activity.activity_type
            })
            
        except Exception as e:
            emit('error', {'message': f'Failed to start activity: {str(e)}'})
    
    @socketio.on('location_update')
    def handle_location_update(data):
        """Handle real-time location updates for an activity"""
        # Check if user is authenticated
        session_data = current_app.config.get('socket_sessions', {}).get(request.sid)
        if not session_data or not session_data.get('authenticated'):
            emit('error', {'message': 'Authentication required'})
            return
            
        # Check if activity is in progress
        if 'activity_id' not in session_data:
            emit('error', {'message': 'No activity in progress'})
            return
            
        activity_id = session_data['activity_id']
        
        try:
            # Validate location data
            required_fields = ['latitude', 'longitude']
            for field in required_fields:
                if field not in data:
                    emit('error', {'message': f'Missing required field: {field}'})
                    return
            
            # Get activity
            activity = Activity.objects(id=ObjectId(activity_id)).first()
            
            if not activity:
                emit('error', {'message': 'Activity not found'})
                return
                
            # Check if activity is completed
            if activity.is_completed:
                emit('error', {'message': 'Activity already completed'})
                return
                
            # Add route point
            activity.add_route_point(
                latitude=data['latitude'],
                longitude=data['longitude'],
                timestamp=datetime.utcnow(),
                elevation=data.get('elevation'),
                heart_rate=data.get('heart_rate'),
                cadence=data.get('cadence')
            )
            
            # Save activity
            activity.save()
            
            # Calculate current metrics
            current_distance = activity._calculate_distance()
            duration = int((datetime.utcnow() - activity.start_time).total_seconds())
            
            # Send update to user
            emit('location_processed', {
                'activity_id': str(activity.id),
                'timestamp': datetime.utcnow().isoformat(),
                'latitude': data['latitude'],
                'longitude': data['longitude'],
                'current_distance': current_distance,
                'duration': duration,
                'elevation': data.get('elevation'),
                'heart_rate': data.get('heart_rate'),
                'route_points': len(activity.route)
            })
            
            # Broadcast to activity room (for shared activities)
            if data.get('broadcast', False):
                emit('participant_location', {
                    'activity_id': str(activity.id),
                    'user_id': session_data['user_id'],
                    'latitude': data['latitude'],
                    'longitude': data['longitude'],
                    'timestamp': datetime.utcnow().isoformat()
                }, room=f"activity:{activity.id}")
            
        except Exception as e:
            emit('error', {'message': f'Failed to process location: {str(e)}'})
    
    @socketio.on('complete_activity')
    def handle_complete_activity(data):
        """Complete an in-progress activity"""
        # Check if user is authenticated
        session_data = current_app.config.get('socket_sessions', {}).get(request.sid)
        if not session_data or not session_data.get('authenticated'):
            emit('error', {'message': 'Authentication required'})
            return
            
        # Check if activity is in progress
        if 'activity_id' not in session_data:
            emit('error', {'message': 'No activity in progress'})
            return
            
        activity_id = session_data['activity_id']
        
        try:
            # Get activity
            activity = Activity.objects(id=ObjectId(activity_id)).first()
            
            if not activity:
                emit('error', {'message': 'Activity not found'})
                return
                
            # Check if activity is already completed
            if activity.is_completed:
                emit('error', {'message': 'Activity already completed'})
                return
                
            # Complete activity
            activity.complete_activity()
            
            # Check if activity is eligible for NFT minting
            from web3.nft_factory import NFTFactory
            nft_eligible = NFTFactory.check_eligibility(activity)
            
            # Remove activity from session
            del current_app.config['socket_sessions'][request.sid]['activity_id']
            
            # Leave activity room
            leave_room(f"activity:{activity.id}")
            
            # Send completion confirmation
            emit('activity_completed', {
                'activity_id': str(activity.id),
                'end_time': activity.end_time.isoformat(),
                'distance': activity.distance,
                'duration': activity.duration,
                'calories': activity.calories,
                'elevation_gain': activity.elevation_gain,
                'average_heart_rate': activity.average_heart_rate,
                'average_pace': activity.average_pace,
                'nft_eligible': nft_eligible
            })
            
            # Update user's total stats
            user = User.objects(id=ObjectId(session_data['user_id'])).first()
            if user:
                user.total_distance += activity.distance or 0
                user.total_activities += 1
                user.save()
            
        except Exception as e:
            emit('error', {'message': f'Failed to complete activity: {str(e)}'})
    
    @socketio.on('join_activity')
    def handle_join_activity(data):
        """Join an activity room to receive updates (for shared activities)"""
        # Check if user is authenticated
        session_data = current_app.config.get('socket_sessions', {}).get(request.sid)
        if not session_data or not session_data.get('authenticated'):
            emit('error', {'message': 'Authentication required'})
            return
            
        if 'activity_id' not in data:
            emit('error', {'message': 'Activity ID is required'})
            return
            
        activity_id = data['activity_id']
        
        try:
            # Join activity room
            join_room(f"activity:{activity_id}")
            
            emit('joined_activity', {
                'activity_id': activity_id,
                'message': 'Successfully joined activity updates'
            })
            
        except Exception as e:
            emit('error', {'message': f'Failed to join activity: {str(e)}'})
    
    @socketio.on('leave_activity')
    def handle_leave_activity(data):
        """Leave an activity room"""
        if 'activity_id' not in data:
            emit('error', {'message': 'Activity ID is required'})
            return
            
        activity_id = data['activity_id']
        
        try:
            # Leave activity room
            leave_room(f"activity:{activity_id}")
            
            emit('left_activity', {
                'activity_id': activity_id,
                'message': 'Successfully left activity updates'
            })
            
        except Exception as e:
            emit('error', {'message': f'Failed to leave activity: {str(e)}'})