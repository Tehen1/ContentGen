#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Layout module for the route visualization page of the cycling data dashboard.
"""

import os
import sys
import pandas as pd
from dash import html, dcc
import dash_bootstrap_components as dbc
from datetime import datetime, timedelta

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.plotting_utils import create_route_map
from scripts.data_loader import load_and_preprocess

# Default path to the data file
DEFAULT_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                               "data", "location_history_enriched_copy.json")

# You would replace this with your actual Mapbox token
MAPBOX_TOKEN = os.environ.get("MAPBOX_TOKEN", "")

# Import styling from index.py for consistency
from layout.index import (
    BASE_STYLE, CARD_STYLE, HEADER_STYLE, 
    STAT_CARD_STYLE, STAT_VALUE_STYLE, STAT_TITLE_STYLE, BUTTON_STYLE
)

# Additional styling
CONTROL_CARD_STYLE = {
    **CARD_STYLE,
    "marginBottom": "20px"
}

FILTER_STYLE = {
    "marginBottom": "15px"
}

FILTER_LABEL_STYLE = {
    "color": "#94A3B8",
    "fontSize": "14px",
    "marginBottom": "5px"
}


def create_route_visualization_layout():
    """
    Create the layout for the route visualization page.
    
    Returns:
        Dash HTML layout
    """
    # Load data to create the visualization
    data_path = DEFAULT_DATA_PATH
    df = None
    figure = None
    date_options = []
    
    try:
        if os.path.exists(data_path):
            df = load_and_preprocess(data_path)
            if not df.empty:
                # Create the initial figure with all data
                figure = create_route_map(df, MAPBOX_TOKEN)
                
                # Create date filter options if start_time is available
                if 'start_time' in df.columns:
                    # Get min and max dates
                    min_date = df['start_time'].min()
                    max_date = df['start_time'].max()
                    
                    # Create date range intervals for filtering
                    if not pd.isna(min_date) and not pd.isna(max_date):
                        min_date = min_date.date()
                        max_date = max_date.date()
                        delta = (max_date - min_date).days
                        
                        # If we have multiple days, create date options
                        if delta > 0:
                            date_dict = {}
                            
                            # Group by date
                            df['date'] = df['start_time'].dt.date
                            date_counts = df['date'].value_counts().sort_index()
                            
                            for date, count in date_counts.items():
                                date_str = date.strftime('%Y-%m-%d')
                                date_dict[date_str] = f"{date_str} ({count} points)"
                            
                            date_options = [
                                {"label": value, "value": key}
                                for key, value in date_dict.items()
                            ]
    except Exception as e:
        print(f"Error loading data for route visualization: {e}")
    
    # Create the layout
    layout = html.Div([
        # Header
        html.Div([
            html.H1("Route Visualization", style={"margin": "0"}),
            html.P("View your cycling routes on an interactive map", 
                  style={"marginTop": "5px", "marginBottom": "20px", "opacity": "0.8"}),
            # Navigation breadcrumb
            html.Div([
                dcc.Link("Home", href="/", style={"color": "#94A3B8"}),
                html.Span(" > ", style={"color": "#64748B"}),
                html.Span("Route Visualization", style={"color": "#F8FAFC"})
            ], style={"fontSize": "14px", "marginTop": "5px"})
        ], style=HEADER_STYLE),
        
        # Main Content Row - Filters and Map
        dbc.Row([
            # Filters Column
            dbc.Col([
                html.Div([
                    html.H3("Filters", style={"color": "#38BDF8", "marginBottom": "15px"}),
                    
                    # Date Filter (if date options available)
                    html.Div([
                        html.Label("Select Date", style=FILTER_LABEL_STYLE),
                        dcc.Dropdown(
                            id='date-filter',
                            options=date_options,
                            value=None,
                            placeholder="All dates",
                            style={"backgroundColor": "#1E293B", "color": "#0F172A"},
                            className="dash-dropdown"
                        )
                    ], style=FILTER_STYLE) if date_options else html.Div(),
                    
                    # Activity Type Filter (if applicable)
                    html.Div([
                        html.Label("Activity Type", style=FILTER_LABEL_STYLE),
                        dcc.Dropdown(
                            id='activity-type-filter',
                            options=[
                                {"label": "All Activities", "value": "all"},
                                {"label": "Cycling", "value": "cycling"},
                                {"label": "Running", "value": "running"},
                                {"label": "Walking", "value": "walking"}
                            ],
                            value="all",
                            style={"backgroundColor": "#1E293B", "color": "#0F172A"},
                            className="dash-dropdown"
                        )
                    ], style=FILTER_STYLE),
                    
                    # Distance Range Filter
                    html.Div([
                        html.Label("Distance Range (km)", style=FILTER_LABEL_STYLE),
                        dcc.RangeSlider(
                            id='distance-filter',
                            min=0,
                            max=10,  # This should be dynamic based on your data
                            step=0.5,
                            marks={i: str(i) for i in range(0, 11, 2)},
                            value=[0, 10],
                            className="dash-slider"
                        )
                    ], style=FILTER_STYLE),
                    
                    # Reset Filters Button
                    html.Div([
                        html.Button(
                            "Reset Filters",
                            id="reset-filters-button",
                            style={
                                **BUTTON_STYLE,
                                "backgroundColor": "#475569",
                                "width": "100%"
                            }
                        )
                    ], style={"marginTop": "20px"})
                ], style=CONTROL_CARD_STYLE)
            ], xs=12, md=3),
            
            # Map Column
            dbc.Col([
                html.Div([
                    dcc.Loading(
                        id="loading-route-map",
                        type="circle",
                        color="#38BDF8",
                        children=[
                            # Map Container
                            html.Div([
                                dcc.Graph(
                                    id='route-map',
                                    figure=figure if figure is not None else {},
                                    style={"height": "70vh", "width": "100%"},
                                    config={
                                        'displayModeBar': True,
                                        'scrollZoom': True,
                                        'modeBarButtonsToRemove': ['select2d', 'lasso2d']
                                    }
                                )
                            ], style={"height": "70vh", "width": "100%"})
                        ]
                    ),
                    
                    # Map Info Card - displays additional info about the selected route
                    html.Div([
                        html.H4("Route Information", style={"color": "#38BDF8"}),
                        html.Div(id="route-info-content", children=[
                            html.P("Select a route or adjust filters to see detailed information.")
                        ])
                    ], style={**CARD_STYLE, "marginTop": "20px"})
                ])
            ], xs=12, md=9)
        ]),
        
        # Footer
        html.Footer([
            html.Hr(style={"margin": "30px 0", "borderColor": "#2D3748"}),
            html.P("Cycling Data Dashboard © 2025", 
                  style={"textAlign": "center", "color": "#94A3B8", "fontSize": "14px"})
        ])
    ], style=BASE_STYLE)
    
    return layout


# Callback functions would be defined in the main app.py file
# They would handle filter changes and update the map accordingly

# For testing
if __name__ == "__main__":
    # This would be used by the main app to generate the layout
    layout = create_route_visualization_layout()
    print("Route visualization layout created successfully")

