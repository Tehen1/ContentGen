from flask import Blueprint, request, jsonify, current_app
from bson.objectid import ObjectId
import json
from datetime import datetime
from routes.auth_routes import token_required
from models.activity import Activity
from models.user import User
from web3.nft_factory import NFTFactory

bp = Blueprint('activities', __name__)

@bp.route('/', methods=['POST'])
@token_required
def create_activity():
    """Create a new activity"""
    user = request.current_user
    data = request.get_json()
    
    # Validate required fields
    if 'activity_type' not in data:
        return jsonify({'message': 'Activity type is required'}), 400
        
    # Create new activity
    activity = Activity(
        user_id=user.id,
        activity_type=data['activity_type'],
        start_time=datetime.utcnow()
    )
    
    # Add optional fields if provided
    optional_fields = ['distance', 'duration', 'calories']
    for field in optional_fields:
        if field in data:
            setattr(activity, field, data[field])
    
    # Save activity
    activity.save()
    
    return jsonify({
        'message': 'Activity created successfully',
        'activity': activity.to_dict()
    }), 201

@bp.route('/<activity_id>', methods=['GET'])
@token_required
def get_activity(activity_id):
    """Get activity details"""
    user = request.current_user
    
    try:
        # Get activity with route data
        activity = Activity.objects(id=ObjectId(activity_id)).first()
        
        if not activity:
            return jsonify({'message': 'Activity not found'}), 404
            
        # Check if user owns the activity
        if str(activity.user_id) != str(user.id):
            return jsonify({'message': 'Unauthorized access to activity'}), 403
            
        # Include route data if requested
        include_route = request.args.get('route', 'false').lower() == 'true'
        
        if include_route:
            return jsonify(activity.to_dict_with_route()), 200
        else:
            return jsonify(activity.to_dict()), 200
            
    except Exception as e:
        return jsonify({'message': f'Error retrieving activity: {str(e)}'}), 500

@bp.route('/<activity_id>', methods=['PUT'])
@token_required
def update_activity(activity_id):
    """Update activity details"""
    user = request.current_user
    data = request.get_json()
    
    try:
        # Get activity
        activity = Activity.objects(id=ObjectId(activity_id)).first()
        
        if not activity:
            return jsonify({'message': 'Activity not found'}), 404
            
        # Check if user owns the activity
        if str(activity.user_id) != str(user.id):
            return jsonify({'message': 'Unauthorized access to activity'}), 403
            
        # Fields that can be updated
        updatable_fields = ['activity_type', 'distance', 'duration', 'calories']
        
        # Update fields
        for field in updatable_fields:
            if field in data:
                setattr(activity, field, data[field])
        
        # Handle activity completion
        if 'complete' in data and data['complete'] and not activity.is_completed:
            activity.complete_activity()
        
        # Save changes
        activity.save()
        
        return jsonify({
            'message': 'Activity updated successfully',
            'activity': activity.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error updating activity: {str(e)}'}), 500

@bp.route('/<activity_id>', methods=['DELETE'])
@token_required
def delete_activity(activity_id):
    """Delete an activity"""
    user = request.current_user

    try:
        # Get activity
        activity = Activity.objects(id=ObjectId(activity_id)).first()

        if not activity:
            return jsonify({'message': 'Activity not found'}), 404

        # Check if user owns the activity
        if str(activity.user_id) != str(user.id):
            return jsonify({'message': 'Unauthorized access to activity'}), 403

        # Delete activity
        activity.delete()

        return jsonify({'message': 'Activity deleted successfully'}), 200

    except Exception as e:
        return jsonify({'message': f'Error deleting activity: {str(e)}'}), 500
@bp.route('/', methods=['GET'])
@token_required
def get_activities():
    """Get user activities with pagination"""
    user = request.current_user
    
    # Pagination parameters
    limit = int(request.args.get('limit', 20))
    skip = int(request.args.get('skip', 0))
    
    # Limit maximum results
    if limit > 100:
        limit = 100
    
    try:
        # Get activities
        activities = Activity.get_user_activities(
            user_id=user.id, 
            limit=limit, 
            skip=skip
        )
        
        # Prepare response
        result = {
            'activities': [activity.to_dict() for activity in activities],
            'count': len(activities),
            'total': Activity.objects(user_id=user.id).count(),
            'limit': limit,
            'skip': skip
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'message': f'Error retrieving activities: {str(e)}'}), 500

@bp.route('/stats', methods=['GET'])
@token_required
def get_activity_stats():
    """Get user activity statistics"""
    user = request.current_user
    
    try:
        # Get activity statistics
        stats = Activity.get_activity_stats(user_id=user.id)
        
        # Add user totals
        stats['user'] = {
            'id': str(user.id),
            'username': user.username,
            'total_nfts': user.nfts_earned
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'message': f'Error retrieving activity stats: {str(e)}'}), 500

@bp.route('/<activity_id>/route', methods=['POST'])
@token_required
def add_route_point(activity_id):
    """Add a point to the activity route"""
    user = request.current_user
    data = request.get_json()
    
    try:
        # Get activity
        activity = Activity.objects(id=ObjectId(activity_id)).first()
        
        if not activity:
            return jsonify({'message': 'Activity not found'}), 404
            
        # Check if user owns the activity
        if str(activity.user_id) != str(user.id):
            return jsonify({'message': 'Unauthorized access to activity'}), 403
            
        # Check if activity is completed
        if activity.is_completed:
            return jsonify({'message': 'Cannot add route points to completed activity'}), 400
            
        # Validate required fields
        required_fields = ['latitude', 'longitude']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        # Parse timestamp if provided
        timestamp = None
        if 'timestamp' in data:
            try:
                timestamp = datetime.fromisoformat(data['timestamp'])
            except ValueError:
                timestamp = datetime.utcnow()
        
        # Add route point
        activity.add_route_point(
            latitude=data['latitude'],
            longitude=data['longitude'],
            timestamp=timestamp,
            elevation=data.get('elevation'),
            heart_rate=data.get('heart_rate'),
            cadence=data.get('cadence')
        )
        
        # Save activity
        activity.save()
        
        return jsonify({
            'message': 'Route point added successfully',
            'route_points': len(activity.route) if activity.route else 0
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error adding route point: {str(e)}'}), 500

@bp.route('/<activity_id>/complete', methods=['POST'])
@token_required
def complete_activity(activity_id):
    """Mark activity as completed and calculate metrics"""
    user = request.current_user
    
    try:
        # Get activity
        activity = Activity.objects(id=ObjectId(activity_id)).first()
        
        if not activity:
            return jsonify({'message': 'Activity not found'}), 404
            
        # Check if user owns the activity
        if str(activity.user_id) != str(user.id):
            return jsonify({'message': 'Unauthorized access to activity'}), 403
            
        # Check if activity is already completed
        if activity.is_completed:
            return jsonify({'message': 'Activity already completed'}), 400
            
        # Complete activity
        activity.complete_activity()
        
        # Check if activity is eligible for NFT minting
        nft_eligible = NFTFactory.check_eligibility(activity)
        
        return jsonify({
            'message': 'Activity completed successfully',
            'activity': activity.to_dict(),
            'nft_eligible': nft_eligible
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error completing activity: {str(e)}'}), 500

@bp.route('/<activity_id>/mint-nft', methods=['POST'])
@token_required
def mint_activity_nft(activity_id):
    """Mint an NFT for a completed activity"""
    user = request.current_user
    
    try:
        # Get activity
        activity = Activity.objects(id=ObjectId(activity_id)).first()
        
        if not activity:
            return jsonify({'message': 'Activity not found'}), 404
            
        # Check if user owns the activity
        if str(activity.user_id) != str(user.id):
            return jsonify({'message': 'Unauthorized access to activity'}), 403
            
        # Check if NFT can be minted
        if not NFTFactory.check_eligibility(activity):
            return jsonify({'message': 'Activity not eligible for NFT minting'}), 400
            
        # Mint NFT
        nft_result = NFTFactory.mint_activity_nft(
            activity_id=str(activity.id),
            user_id=str(user.id)
        )
        
        if not nft_result:
            return jsonify({'message': 'Failed to mint NFT'}), 500
            
        return jsonify({
            'message': 'NFT minted successfully',
            'nft': nft_result
        }), 200
        
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': f'Error minting NFT: {str(e)}'}), 500