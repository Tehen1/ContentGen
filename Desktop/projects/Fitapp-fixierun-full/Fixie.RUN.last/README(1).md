# Fitness Activity Analyzer

A comprehensive tool for analyzing and visualizing fitness activities from location history data, with a particular focus on cycling (Fixie), running, and walking activities.

## Overview

The Fitness Activity Analyzer processes location history data to extract, analyze, and visualize patterns in your physical activities. The analyzer can:

- Extract cycling, walking, and running activities from location history data
- Calculate key metrics like distance, speed, and duration for each activity type
- Infer running activities based on walking speed thresholds
- Generate multi-graph visualizations comparing different activity types
- Support time-based filtering for daily, weekly, monthly, or yearly analysis
- Provide detailed breakdowns of individual activity types

## Quick Start

To quickly analyze your fitness data:

```bash
# Navigate to the Fit directory
cd /path/to/fitness-dashboard-main/Fit

# Make the script executable (if not already)
chmod +x analyze_fitness.sh

# Run the analyzer with default settings
./analyze_fitness.sh
```

This will generate visualizations in the `Fit/visualizations` directory using data from `Fit/data/filtered-location-history.json`.

## Using analyze_fitness.sh

The `analyze_fitness.sh` script provides an easy-to-use command-line interface for the analyzer.

### Basic Usage

```bash
./analyze_fitness.sh [options]
```

### Available Options

| Option | Description |
|--------|-------------|
| `-h, --help` | Show help message and exit |
| `-i, --input FILE` | Path to location history JSON file |
| `-o, --output DIR` | Directory to save visualizations |
| `-t, --time-period PERIOD` | Time period for analysis (all, day, week, month, year) |
| `-a, --activities LIST` | Comma-separated list of activities to analyze |
| `-c, --use-class` | Use the ActivityAnalyzer class instead of standalone functions |
| `-d, --detailed` | Generate detailed visualizations for each activity type |

### Examples

Analyze all activities for the past month:
```bash
./analyze_fitness.sh --time-period month
```

Analyze only cycling and walking activities:
```bash
./analyze_fitness.sh --activities cycling,walking
```

Generate detailed visualizations for each activity type:
```bash
./analyze_fitness.sh --detailed
```

Analyze activities with a custom input file and output directory:
```bash
./analyze_fitness.sh --input /path/to/my-location-history.json --output ~/fitness-reports
```

## Available Visualizations

The analyzer generates the following visualizations:

### Multi-Graph Comparison

A comprehensive dashboard showing:

1. **Activity Count by Type**: Bar chart showing the number of activities for each type
2. **Total Distance by Type**: Bar chart comparing total distance traveled by activity type
3. **Activities Over Time**: Line chart showing frequency of activities over time
4. **Average Speed Comparison**: Bar chart comparing average speeds across activity types
5. **Activity Duration Distribution**: Box plot showing the distribution of activity durations

### Detailed Activity Visualizations (with `--detailed` option)

For each activity type (cycling, running, walking), additional visualizations include:

1. **Distance Over Time**: Track progress in distance covered
2. **Speed Distribution**: Histogram of speeds for the activity type
3. **Duration vs. Distance**: Scatter plot showing relationship between duration and distance
4. **Activity Heatmap**: Shows what days/times are most active

## Data Structure and Activity Detection

### Input Data Format

The analyzer expects location history data in JSON format with the following structure:

```json
[
  {
    "startTime": "2023-01-01T08:30:00.000+01:00",
    "endTime": "2023-01-01T09:15:00.000+01:00",
    "activity": {
      "distanceMeters": "5000.0",
      "start": "geo:48.8584,2.2945",
      "end": "geo:48.8647,2.3490",
      "topCandidate": {
        "type": "cycling",
        "probability": "0.87"
      }
    }
  }
]
```

### Activity Detection

Activities are detected and categorized as follows:

- **Cycling (Fixie)**: Activities with type "cycling", "biking", "fixie", or similar terms
- **Walking**: Activities with type "walking", "on foot", "hiking", or similar terms
- **Running**: 
  - Explicitly tagged as "running", "jogging", or similar terms
  - Inferred from walking activities with speeds above 7 km/h

## Customizing Analysis

### Time-Based Filtering

Filter your analysis by time period:

```bash
# Analyze only the past week
./analyze_fitness.sh --time-period week

# Analyze only the past month
./analyze_fitness.sh --time-period month

# Analyze the past year
./analyze_fitness.sh --time-period year

# Analyze all available data
./analyze_fitness.sh --time-period all
```

### Activity Selection

Select specific activities to analyze:

```bash
# Analyze only cycling
./analyze_fitness.sh --activities cycling

# Analyze walking and running
./analyze_fitness.sh --activities walking,running
```

### Customizing Visualizations

To save visualizations to a specific directory:

```bash
./analyze_fitness.sh --output /path/to/output/directory
```

## Extending the Functionality

Developers can extend the functionality of the Fitness Activity Analyzer in several ways:

### Adding New Activity Types

To add support for new activity types:

1. Update the activity mapping in `activity_analyzer.py`:
   ```python
   activity_mapping = {
       'cycling': ['cycling', 'biking', 'fixie', 'bike'],
       'walking': ['walking', 'walk', 'hiking', 'hike'],
       'running': ['running', 'jogging', 'run'],
       'new_activity': ['term1', 'term2', 'term3']  # Add new activity type
   }
   ```

2. Update visualization functions to include the new activity type

### Creating New Visualization Types

To add new visualization types:

1. Create a new function in `activity_analyzer.py` following the pattern of existing visualization functions
2. Update the `run_analyzer.py` script to call your new visualization function
3. Add command-line option to `analyze_fitness.sh` if needed

### Implementing Advanced Metrics

To add new metrics for activities:

1. Update the `calculate_activity_metrics` function in `activity_analyzer.py` to include your new metrics
2. Update visualization functions to display the new metrics

### Using the Python API Directly

You can import and use the Python API directly in your own scripts:

```python
from activity_analyzer import ActivityAnalyzer

# Create an analyzer instance
analyzer = ActivityAnalyzer('path/to/location_history.json')

# Get available activity types
activity_types = analyzer.get_activity_types()
print(f"Available activity types: {activity_types}")

# Filter for a specific activity
cycling_data = analyzer.filter_by_activity('cycling')

# Calculate metrics
metrics = analyzer.calculate_activity_metrics(cycling_data)
print(f"Cycling metrics: {metrics}")

# Generate visualizations
analyzer.plot_activity_comparison(['cycling', 'walking', 'running'], 
                                time_period='month', 
                                save_path='my_visualization.png')
```

## Troubleshooting

If you encounter issues:

1. Ensure Python 3 and required libraries (pandas, matplotlib, etc.) are installed
2. Verify that your location history JSON file follows the expected format
3. Check that the paths to input and output files/directories are correct
4. For visualization issues, ensure matplotlib and seaborn are properly installed

