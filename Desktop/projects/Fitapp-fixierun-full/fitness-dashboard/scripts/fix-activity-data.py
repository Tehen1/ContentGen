import json
import re
import ast

def parse_ts_array(content):
    """Parse TypeScript array content into Python objects"""
    # First, find all the objects in the array
    objects = []
    current_obj = {}
    current_key = None
    in_object = False
    
    lines = content.strip().split('\n')
    for line in lines:
        line = line.strip()
        
        if line.startswith('{'):
            current_obj = {}
            in_object = True
        elif line.startswith('}'):
            if current_obj:
                objects.append(current_obj)
            in_object = False
        elif in_object and line:
            if ':' in line:
                # Handle key-value pairs
                key, value = line.split(':', 1)
                key = key.strip().strip('"')
                value = value.strip().strip(',')
                
                # Try to convert value to appropriate type
                try:
                    # First try to parse as JSON
                    value = json.loads(value)
                except json.JSONDecodeError:
                    try:
                        # Then try to evaluate as Python literal
                        value = ast.literal_eval(value)
                    except (ValueError, SyntaxError):
                        # If all else fails, keep as string but strip quotes
                        value = value.strip('"')
                
                current_obj[key] = value
    
    # Don't forget the last object
    if current_obj:
        objects.append(current_obj)
    
    return objects

def convert_confidence(value):
    """Convert confidence value to a number between 0 and 1"""
    if isinstance(value, (int, float)):
        return value
    
    confidence_map = {
        'low': 0.3,
        'medium': 0.6,
        'high': 0.9,
        'very high': 1.0
    }
    
    return confidence_map.get(value.lower(), 0.5)

# Read the activity data file
with open('lib/activity-data.ts', 'r') as f:
    content = f.read()

# Find the array content using regex
array_match = re.search(r'activityData: Activity\[\] = (\[[\s\S]*?\]);', content)
if not array_match:
    print("Could not find activity data array")
    exit(1)

array_content = array_match.group(1)

try:
    # Parse the array content
    activities = parse_ts_array(array_content)
except Exception as e:
    print(f"Error parsing array content: {e}")
    exit(1)

# Fix each activity object
fixed_activities = []
for activity in activities:
    fixed_activity = {
        'start_time': activity.get('start_time', ''),
        'end_time': activity.get('end_time', ''),
        'activity_type': activity.get('activity_type', 'cycling'),
        'distance_km': float(activity.get('distance_km', 0)) if isinstance(activity.get('distance_km'), str) else activity.get('distance_km', 0),
        'start_lat': float(activity.get('start_lat', 0)) if isinstance(activity.get('start_lat'), str) else activity.get('start_lat', 0),
        'start_lon': float(activity.get('start_lon', 0)) if isinstance(activity.get('start_lon'), str) else activity.get('start_lon', 0),
        'end_lat': float(activity.get('end_lat', 0)) if isinstance(activity.get('end_lat'), str) else activity.get('end_lat', 0),
        'end_lon': float(activity.get('end_lon', 0)) if isinstance(activity.get('end_lon'), str) else activity.get('end_lon', 0),
        'confidence': convert_confidence(activity.get('confidence', 'medium'))
    }
    
    # Only add calories if it exists
    if 'calories' in activity:
        fixed_activity['calories'] = float(activity['calories']) if isinstance(activity['calories'], str) else activity['calories']
    
    fixed_activities.append(fixed_activity)

# Generate the new file content
new_content = f'''import type {{ Activity }} from "./types.js"

export const activityData: Activity[] = {json.dumps(fixed_activities, indent=2)}
'''

# Write the fixed data back to the file
with open('lib/activity-data.ts', 'w') as f:
    f.write(new_content)

print('Activity data has been fixed!')
