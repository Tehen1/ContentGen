#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Activity Analyzer API
=====================

This module provides a Flask API for the activity analyzer.
It allows the backend to interact with the Python-based analyzer.
"""

import os
import json
import uuid
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from activity_analyzer import ActivityAnalyzer

app = Flask(__name__)
CORS(app)

# Create directories if they don't exist
os.makedirs("data", exist_ok=True)
os.makedirs("visualizations", exist_ok=True)

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok"})

@app.route("/analyze", methods=["POST"])
def analyze_activity():
    """Analyze activity data."""
    try:
        # Get request data
        data = request.json
        location_data = data.get("locationData", [])
        options = data.get("options", {})
        
        # Generate unique ID for this analysis
        analysis_id = str(uuid.uuid4())
        
        # Create temporary file for location data
        temp_data_path = os.path.join("data", f"{analysis_id}.json")
        with open(temp_data_path, "w") as f:
            json.dump(location_data, f)
        
        # Create output directory
        output_dir = os.path.join("visualizations", analysis_id)
        os.makedirs(output_dir, exist_ok=True)
        
        # Initialize analyzer
        analyzer = ActivityAnalyzer(temp_data_path)
        
        # Get activity types
        activity_types = options.get("activities", ["cycling", "walking", "running"])
        
        # Filter data by activity types
        filtered_data = {}
        for activity_type in activity_types:
            filtered_data[activity_type] = analyzer.filter_by_activity(activity_type)
        
        # Calculate metrics
        metrics = {}
        for activity_type, data in filtered_data.items():
            metrics[activity_type] = analyzer.calculate_activity_metrics(data)
        
        # Generate visualizations if requested
        visualization_paths = []
        if options.get("generateVisualizations", False):
            # Overall comparison
            comparison_path = os.path.join(output_dir, "activity_comparison.png")
            analyzer.plot_activity_comparison(
                activity_types,
                time_period=options.get("timePeriod", "all"),
                save_path=comparison_path
            )
            visualization_paths.append(comparison_path)
            
            # Detailed visualizations
            if options.get("detailed", False):
                for activity_type in activity_types:
                    if filtered_data[activity_type]:
                        detail_path = os.path.join(output_dir, f"{activity_type}_details.png")
                        analyzer.plot_activity_details(
                            activity_type,
                            time_period=options.get("timePeriod", "all"),
                            save_path=detail_path
                        )
                        visualization_paths.append(detail_path)
        
        # Save metrics to file
        metrics_path = os.path.join(output_dir, "metrics.json")
        with open(metrics_path, "w") as f:
            json.dump(metrics, f)
        
        # Return results
        return jsonify({
            "analysisId": analysis_id,
            "metrics": metrics,
            "visualizationPaths": visualization_paths
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/visualizations/<analysis_id>/<filename>", methods=["GET"])
def get_visualization(analysis_id, filename):
    """Get a visualization file."""
    try:
        file_path = os.path.join("visualizations", analysis_id, filename)
        if os.path.exists(file_path):
            return send_file(file_path)
        else:
            return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
