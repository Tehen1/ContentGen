const fs = require('fs');
const path = require('path');

// Read the activity data file
const activityDataPath = path.join(__dirname, '../lib/activity-data.ts');
const fileContent = fs.readFileSync(activityDataPath, 'utf8');

// Function to safely evaluate the array content
function parseArrayContent(content) {
  // Remove TypeScript type annotations
  const jsContent = content
    .replace(/export const activityData: Activity\[\] = /, '')
    .replace(/\s*as\s+Activity\s*/g, '');
  
  try {
    // Use Function constructor to evaluate the array expression in a safe context
    return (new Function('return ' + jsContent))();
  } catch (e) {
    console.error('Error parsing activity data:', e);
    process.exit(1);
  }
}

// Parse the array
const activityData = parseArrayContent(fileContent);

// Fix each activity object
const fixedActivityData = activityData.map(activity => {
  // Ensure all required properties exist with proper types
  const fixedActivity = {
    start_time: activity.start_time || '',
    end_time: activity.end_time || '',
    activity_type: activity.activity_type || 'cycling',
    distance_km: typeof activity.distance_km === 'string' ? parseFloat(activity.distance_km) : (activity.distance_km || 0),
    start_lat: typeof activity.start_lat === 'string' ? parseFloat(activity.start_lat) : (activity.start_lat || 0),
    start_lon: typeof activity.start_lon === 'string' ? parseFloat(activity.start_lon) : (activity.start_lon || 0),
    end_lat: typeof activity.end_lat === 'string' ? parseFloat(activity.end_lat) : (activity.end_lat || 0),
    end_lon: typeof activity.end_lon === 'string' ? parseFloat(activity.end_lon) : (activity.end_lon || 0),
    confidence: typeof activity.confidence === 'string' ? parseFloat(activity.confidence) : (activity.confidence || 1)
  };

  // Only add calories if it exists
  if ('calories' in activity) {
    fixedActivity.calories = typeof activity.calories === 'string' ? parseFloat(activity.calories) : activity.calories;
  }

  return fixedActivity;
});

// Generate the new file content
const newContent = `import type { Activity } from "./types.js"

export const activityData: Activity[] = ${JSON.stringify(fixedActivityData, null, 2)}
`;

// Write the fixed data back to the file
fs.writeFileSync(activityDataPath, newContent);

console.log('Activity data has been fixed!');
