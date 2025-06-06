#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Main application file for the Cycling Data Dashboard.
This file initializes the Dash application, sets up routing, and implements callbacks.
"""

import os
import sys
import pandas as pd
from dash import Dash, dcc, html, Input, Output, callback_context
from dash.exceptions import PreventUpdate
import dash_bootstrap_components as dbc
import plotly.graph_objects as go
from datetime import datetime, timedelta
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

# Add the current directory to the path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import layout modules
from layout.index import create_index_layout
from layout.route_visualization import create_route_visualization_layout
from layout.time_distance_analysis import create_time_distance_analysis_layout
from layout.geospatial_insights import create_geospatial_insights_layout

# Import utility modules
from scripts.data_loader import load_and_preprocess
from utils.plotting_utils import (
    create_route_map,
    create_time_distance_chart,
    create_geospatial_heatmap
)

# Constants
DEFAULT_DATA_PATH = "/Users/devtehen/Downloads/location_history_enriched.json"

# Get Mapbox token from environment variables
MAPBOX_TOKEN = os.environ.get("MAPBOX_TOKEN", "")
if not MAPBOX_TOKEN:
    print("Warning: No Mapbox token found. Map visualizations may not display correctly.")
    print("Set the MAPBOX_TOKEN environment variable or modify the code to include your token.")

# Initialize the Dash app with Bootstrap
app = Dash(
    __name__,
    external_stylesheets=[dbc.themes.DARKLY],  # Using a dark theme
    suppress_callback_exceptions=True,  # Keep this true for our dynamic callback approach
    meta_tags=[
        {"name": "viewport", "content": "width=device-width, initial-scale=1.0"}
    ]
)

# Set the title
app.title = "Cycling Data Dashboard"

# Track registered callbacks to prevent duplicates
registered_callbacks = set()

# Custom CSS can be added here
app.index_string = '''
<!DOCTYPE html>
<html>
    <head>
        {%metas%}
        <title>{%title%}</title>
        {%favicon%}
        {%css%}
        <style>
            /* Custom CSS */
            .dash-dropdown .Select-control {
                background-color: #1E293B !important;
                color: #F8FAFC !important;
            }
            .dash-dropdown .Select-menu-outer {
                background-color: #1E293B !important;
                color: #F8FAFC !important;
            }
            .dash-dropdown .Select-value-label {
                color: #F8FAFC !important;
            }
            .dash-dropdown .Select-placeholder {
                color: #94A3B8 !important;
            }
            .dash-slider .rc-slider-track {
                background-color: #38BDF8 !important;
            }
            .dash-slider .rc-slider-handle {
                border-color: #38BDF8 !important;
            }
            .dash-date-picker .DateInput_input {
                background-color: #1E293B !important;
                color: #F8FAFC !important;
                border-color: #2D3748 !important;
            }
            /* Add more custom CSS as needed */
        </style>
    </head>
    <body>
        {%app_entry%}
        <footer>
            {%config%}
            {%scripts%}
            {%renderer%}
        </footer>
    </body>
</html>
'''

# Define the app layout with URL routing
app.layout = html.Div([
    # URL Location component to track current page
    dcc.Location(id='url', refresh=False),
    
    # Store component to cache preprocessed data
    dcc.Store(id='cycling-data-store'),
    
    # Toast for notifications (errors, info messages)
    dbc.Toast(
        id="notification-toast",
        header="Notification",
        is_open=False,
        dismissable=True,
        duration=4000,
        icon="info",
        style={"position": "fixed", "top": 20, "right": 20, "zIndex": 999}
    ),
    
    # Content div - will be populated with the current page content
    html.Div(id='page-content')
])

# Load data on startup
cycling_df = None
try:
    if os.path.exists(DEFAULT_DATA_PATH):
        cycling_df = load_and_preprocess(DEFAULT_DATA_PATH)
        print(f"Data loaded successfully: {len(cycling_df)} records")
    else:
        print(f"Warning: Default data file not found at {DEFAULT_DATA_PATH}")
except Exception as e:
    print(f"Error loading data: {e}")


# Main routing callback to display different pages based on URL pathname
@app.callback(
    Output('page-content', 'children'),
    [Input('url', 'pathname')]
)
def display_page(pathname):
    """Main routing callback to display different pages based on URL pathname."""
    if pathname == '/route-visualization':
        # Register route visualization page callbacks
        register_route_viz_callbacks()
        return create_route_visualization_layout()
    
    elif pathname == '/time-distance-analysis':
        # Register time-distance page callbacks
        register_time_distance_callbacks() 
        return create_time_distance_analysis_layout()
    
    elif pathname == '/geospatial-insights':
        # Register geospatial insights page callbacks
        register_geospatial_callbacks()
        return create_geospatial_insights_layout()
    
    else:
        # Home page or unknown URL, show index
        return create_index_layout()


# Helper function to check if a callback exists
def callback_exists(output_id, output_property):
    """Check if a callback with the given output ID and property has been registered"""
    return f"{output_id}:{output_property}" in registered_callbacks


# Function to register callbacks for the route visualization page
def register_route_viz_callbacks():
    """Register callbacks specific to the route visualization page"""
    
    # Route map update callback
    if not callback_exists('route-map', 'figure'):
        @app.callback(
            Output('route-map', 'figure'),
            [
                Input('activity-type-filter', 'value'),
                Input('distance-filter', 'value'),
                Input('reset-filters-button', 'n_clicks')
            ]
        )
        def update_route_map(activity_type, distance_range, reset_clicks):
            """Update the route map based on selected filters"""
            ctx = callback_context
            if not ctx.triggered:
                # Initial load
                return create_route_map(cycling_df, MAPBOX_TOKEN)
                
            trigger_id = ctx.triggered[0]['prop_id'].split('.')[0]
            
            # If reset button was clicked, reset all filters
            if trigger_id == 'reset-filters-button':
                return create_route_map(cycling_df, MAPBOX_TOKEN)
            
            try:
                # Apply filters
                filtered_df = cycling_df.copy() if cycling_df is not None else pd.DataFrame()
                
                if filtered_df.empty:
                    return go.Figure()
                
                # Apply activity type filter
                if activity_type and activity_type != 'all' and 'activity_type' in filtered_df.columns:
                    filtered_df = filtered_df[filtered_df['activity_type'] == activity_type]
                
                # Apply distance filter
                if distance_range and 'distance' in filtered_df.columns:
                    min_dist, max_dist = distance_range
                    filtered_df = filtered_df[(filtered_df['distance'] >= min_dist) & 
                                             (filtered_df['distance'] <= max_dist)]
                
                # Create the map with filtered data
                if filtered_df.empty:
                    fig = go.Figure()
                    fig.add_annotation(
                        text="No data matches the selected filters",
                        xref="paper", yref="paper",
                        x=0.5, y=0.5,
                        showarrow=False,
                        font=dict(size=16, color="#F8FAFC")
                    )
                    fig.update_layout(
                        paper_bgcolor="#0F172A",
                        plot_bgcolor="#0F172A",
                        font=dict(color="#F8FAFC")
                    )
                    return fig
                else:
                    return create_route_map(filtered_df, MAPBOX_TOKEN)
                
            except Exception as e:
                print(f"Error updating route map: {e}")
                fig = go.Figure()
                fig.add_annotation(
                    text=f"Error updating map: {str(e)}",
                    xref="paper", yref="paper",
                    x=0.5, y=0.5,
                    showarrow=False,
                    font=dict(size=16, color="#F8FAFC")
                )
                fig.update_layout(
                    paper_bgcolor="#0F172A",
                    plot_bgcolor="#0F172A",
                    font=dict(color="#F8FAFC")
                )
                return fig
        
        # Mark this callback as registered
        registered_callbacks.add('route-map:figure')
    
    # Route info update callback when clicking on the map
    if not callback_exists('route-info-content', 'children'):
        @app.callback(
            Output('route-info-content', 'children'),
            [Input('route-map', 'clickData')]
        )
        def update_route_info(click_data):
            """Update the route information when a point on the map is clicked"""
            if click_data is None:
                return html.P("Select a point on the map to see detailed information.")
            
            try:
                # Extract point data from the click
                point_data = click_data['points'][0]
                point_time = point_data.get('customdata', [None])[0] if 'customdata' in point_data else None
                
                # Create info display
                return html.Div([
                    html.P(f"Latitude: {point_data.get('lat', 'N/A'):.5f}"),
                    html.P(f"Longitude: {point_data.get('lon', 'N/A'):.5f}"),
                    html.P(f"Time: {point_time}") if point_time else "",
                    html.P(f"Distance: {point_data.get('customdata', [None, None])[1]:.2f} km") 
                    if 'customdata' in point_data and len(point_data['customdata']) > 1 else ""
                ])
            except Exception as e:
                print(f"Error updating route info: {e}")
                return html.P("Error retrieving point information.")
        
        # Mark this callback as registered
        registered_callbacks.add('route-info-content:children')
    
    # Notification for reset button
    if not callback_exists('notification-toast', 'is_open'):
        @app.callback(
            [
                Output('notification-toast', 'is_open'),
                Output('notification-toast', 'header'),
                Output('notification-toast', 'children'),
                Output('notification-toast', 'color'),
            ],
            [Input('reset-filters-button', 'n_clicks')],
            prevent_initial_call=True
        )
        def show_reset_notification(n_clicks):
            """Show notification when reset filters button is clicked"""
            if n_clicks is None:
                raise PreventUpdate
                
            return True, "Filters Reset", "The map has been updated to show all data.", "info"
        
        # Mark this callback as registered
        registered_callbacks.add('notification-toast:is_open')


# Function to register callbacks for the time-distance analysis page
def register_time_distance_callbacks():
    """Register callbacks specific to the time-distance analysis page"""
    
    # Time-distance chart update callback
    if not callback_exists('time-distance-chart', 'figure'):
        @app.callback(
            Output('time-distance-chart', 'figure'),
            [
                Input('date-range-picker', 'start_date'),
                Input('date-range-picker', 'end_date'),
                Input('aggregation-level', 'value'),
                Input('metric-selector', 'value'),
                Input('apply-filters-button', 'n_clicks')
            ]
        )
        def update_time_distance_chart(start_date, end_date, aggregation, metric, n_clicks):
            """Update the time and distance chart based on selected filters"""
            ctx = callback_context
            if not ctx.triggered:
                # Initial load
                if cycling_df is not None and not cycling_df.empty:
                    return create_time_distance_chart(cycling_df)
                else:
                    return go.Figure()
                    
            try:
                # Start with the full dataset
                filtered_df = cycling_df.copy() if cycling_df is not None else pd.DataFrame()
                
                if filtered_df.empty:
                    # Return empty figure if no data
                    return go.Figure()
                
                # Apply date range filter
                if start_date and end_date and 'start_time' in filtered_df.columns:
                    start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                    end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                    
                    filtered_df = filtered_df[
                        (filtered_df['start_time'].dt.date >= start_date_obj) & 
                        (filtered_df['start_time'].dt.date <= end_date_obj)
                    ]
                
                # Check if metric exists in dataframe
                if metric not in filtered_df.columns:
                    # Fallback to distance if metric not available
                    metric = 'distance' if 'distance' in filtered_df.columns else None
                    
                if metric is None:
                    # No valid metric available
                    fig = go.Figure()
                    fig.add_annotation(
                        text="No metric data available",
                        xref="paper", yref="paper",
                        x=0.5, y=0.5,
                        showarrow=False,
                        font=dict(size=16, color="#F8FAFC")
                    )
                    fig.update_layout(
                        paper_bgcolor="#0F172A",
                        plot_bgcolor="#0F172A",
                        font=dict(color="#F8FAFC")
                    )
                    return fig
                
                # Handle aggregation if needed
                if aggregation and aggregation != 'day' and 'start_time' in filtered_df.columns:
                    # Group by the selected time period
                    if aggregation == 'week':
                        # Group by week
                        filtered_df['period'] = filtered_df['start_time'].dt.isocalendar().week
                        filtered_df['period_label'] = filtered_df['start_time'].dt.strftime('Week %U')
                    elif aggregation == 'month':
                        # Group by month
                        filtered_df['period'] = filtered_df['start_time'].dt.month
                        filtered_df['period_label'] = filtered_df['start_time'].dt.strftime('%B')
                    
                    # Aggregate the data
                    agg_df = filtered_df.groupby('period_label')[metric].max().reset_index()
                    agg_df.rename(columns={
                        'period_label': 'start_time',
                        metric: metric
                    }, inplace=True)
                    
                    # Sort by period for proper display
                    agg_df['period'] = filtered_df['period'].unique()
                    agg_df.sort_values('period', inplace=True)
                    agg_df.drop('period', axis=1, inplace=True)
                    
                    filtered_df = agg_df
                
                # Create the chart with the filtered data
                return create_time_distance_chart(filtered_df)
                
            except Exception as e:
                print(f"Error updating time-distance chart: {e}")
                # Return empty figure with error message
                fig = go.Figure()
                fig.add_annotation(
                    text=f"Error updating chart: {str(e)}",
                    xref="paper", yref="paper",
                    x=0.5, y=0.5,
                    showarrow=False,
                    font=dict(size=16, color="#F8FAFC")
                )
                fig.update_layout(
                    paper_bgcolor="#0F172A",
                    plot_bgcolor="#0F172A",
                    font=dict(color="#F8FAFC")
                )
                return fig
        
        # Mark this callback as registered
        registered_callbacks.add('time-distance-chart:figure')
    
    # Notification for apply filters button
    if not callback_exists('notification-toast-time', 'is_open'):
        @app.callback(
            [
                Output('notification-toast', 'is_open', allow_duplicate=True),
                Output('notification-toast', 'header'),
                Output('notification-toast', 'children'),
                Output('notification-toast', 'color'),
            ],
            [Input('apply-filters-button', 'n_clicks')],
            prevent_initial_call=True
        )
        def show_apply_filters_notification(n_clicks):
            """Show notification when filters are applied"""
            if n_clicks is None:
                raise PreventUpdate
                
            return True, "Filters Applied", "The chart has been updated with your selected filters.", "success"
        
        # Mark callback as registered
        registered_callbacks.add('notification-toast-time:is_open')


# Function to register callbacks for the geospatial insights page
def register_geospatial_callbacks():
    """Register callbacks specific to the geospatial insights page"""
    
    # Heatmap update callback 
    if not callback_exists('geospatial-heatmap', 'figure'):
        @app.callback(
            Output('geospatial-heatmap', 'figure'),
            [
                Input('apply-heatmap-settings', 'n_clicks'),
                Input('heatmap-type-selector', 'value'),
                Input('time-period-selector', 'value')
            ]
        )
        def update_geospatial_heatmap(n_clicks, heatmap_type, time_period):
            """Update the geospatial heatmap based on selected settings"""
            # Create and return heatmap based on settings
            try:
                if cycling_df is not None and not cycling_df.empty:
                    return create_geospatial_heatmap(cycling_df, MAPBOX_TOKEN)
                else:
                    return go.Figure()
            except Exception as e:
                print(f"Error updating heatmap: {e}")
                fig = go.Figure()
                fig.add_annotation(
                    text=f"Error updating heatmap: {str(e)}",
                    xref="paper", yref="paper",
                    x=0.5, y=0.5,
                    showarrow=False,
                    font=dict(size=16, color="#F8FAFC")
                )
                fig.update_layout(
                    paper_bgcolor="#0F172A",
                    plot_bgcolor="#0F172A",
                    font=dict(color="#F8FAFC")
                )
                return fig
        
        # Mark callback as registered
        registered_callbacks.add('geospatial-heatmap:figure')
    
    # Notification for apply heatmap settings
    if not callback_exists('notification-toast-heatmap', 'is_open'):
        @app.callback(
            [
                Output('notification-toast', 'is_open', allow_duplicate=True),
                Output('notification-toast', 'header'),
                Output('notification-toast', 'children'),
                Output('notification-toast', 'color'),
            ],
            [Input('apply-heatmap-settings', 'n_clicks')],
            prevent_initial_call=True
        )
        def show_heatmap_notification(n_clicks):
            """Show notification when heatmap settings are applied"""
            if n_clicks is None:
                raise PreventUpdate
                
            return True, "Heatmap Updated", "The heatmap has been updated with your settings.", "success"
        
        # Mark callback as registered
        registered_callbacks.add('notification-toast-heatmap:is_open')

# Run the app
if __name__ == '__main__':
    # Check for data
    if cycling_df is None or cycling_df.empty:
        print("\n" + "="*50)
        print("Warning: No cycling data loaded. The application will run,")
        print("but visualizations will be empty until data is provided.")
        print("="*50 + "\n")
    
    # Print application info
    print("\n" + "="*50)
    print("Cycling Data Dashboard")
    print("="*50)
    print(f"Data file path: {DEFAULT_DATA_PATH}")
    print(f"Mapbox token available: {'Yes' if MAPBOX_TOKEN else 'No'}")
    print("Running in debug mode - suitable for development only.")
    print("For production deployment, set debug=False and configure a proper server.")
    print("="*50 + "\n")
    
    # Run the app
    app.run(debug=True)

