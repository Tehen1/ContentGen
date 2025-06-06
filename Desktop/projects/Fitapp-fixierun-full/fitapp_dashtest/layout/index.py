#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Layout module for the index (landing) page of the cycling data dashboard.
"""

import os
import sys
import pandas as pd
from dash import html, dcc
import dash_bootstrap_components as dbc

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.plotting_utils import create_activity_stats
from scripts.data_loader import load_and_preprocess

# Default path to the data file
DEFAULT_DATA_PATH = "/Users/devtehen/Downloads/location_history_enriched.json"

# Base styles
BASE_STYLE = {
    "fontFamily": "Inter, sans-serif",
    "backgroundColor": "#0F172A",  # Dark blue background
    "color": "#F8FAFC",            # Light text
    "padding": "20px",
    "minHeight": "100vh"
}

CARD_STYLE = {
    "backgroundColor": "#1E293B",  # Darker card background
    "borderRadius": "8px",
    "padding": "16px",
    "margin": "10px 0",
    "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.1)"
}

HEADER_STYLE = {
    "color": "#F8FAFC",
    "marginBottom": "10px",
    "borderBottom": "1px solid #2D3748",
    "paddingBottom": "10px"
}

STAT_CARD_STYLE = {
    "backgroundColor": "#1E293B",
    "color": "#F8FAFC",
    "borderRadius": "8px",
    "padding": "16px",
    "margin": "10px",
    "textAlign": "center",
    "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.1)",
    "minHeight": "120px",
    "display": "flex",
    "flexDirection": "column",
    "justifyContent": "center"
}

STAT_VALUE_STYLE = {
    "fontSize": "24px",
    "fontWeight": "bold",
    "color": "#38BDF8",  # Light blue for emphasis
    "margin": "10px 0"
}

STAT_TITLE_STYLE = {
    "fontSize": "14px",
    "color": "#94A3B8"  # Lighter text for the title
}

BUTTON_STYLE = {
    "backgroundColor": "#38BDF8",
    "color": "#0F172A",
    "border": "none",
    "borderRadius": "4px",
    "padding": "10px 15px",
    "margin": "5px",
    "fontWeight": "bold",
    "cursor": "pointer",
    "textDecoration": "none",
    "display": "inline-block"
}


def create_index_layout():
    """
    Create the layout for the index/landing page.
    
    Returns:
        Dash HTML layout
    """
    # Load data to get statistics
    data_path = DEFAULT_DATA_PATH
    df = None
    stats = []
    
    try:
        if os.path.exists(data_path):
            df = load_and_preprocess(data_path)
            if not df.empty:
                stats = create_activity_stats(df)
    except Exception as e:
        print(f"Error loading data for index page: {e}")
    
    # Convert stats to cards
    stat_cards = []
    for stat in stats:
        stat_cards.append(
            dbc.Col(
                html.Div([
                    html.Div(stat['title'], style=STAT_TITLE_STYLE),
                    html.Div(stat['value'], style=STAT_VALUE_STYLE)
                ], style=STAT_CARD_STYLE),
                xs=12, sm=6, md=4, lg=2  # Responsive grid layout
            )
        )
    
    # If no stats available, provide a placeholder
    if not stat_cards:
        stat_cards = [
            dbc.Col(
                html.Div([
                    html.Div("No cycling data available", style=STAT_TITLE_STYLE),
                    html.Div("Upload data to begin", style=STAT_VALUE_STYLE)
                ], style=STAT_CARD_STYLE),
                width=12
            )
        ]
    
    # Create the layout
    layout = html.Div([
        # Header
        html.Div([
            html.H1("Cycling Data Dashboard", style={"margin": "0"}),
            html.P("Analyze and visualize your cycling activities", 
                  style={"marginTop": "5px", "marginBottom": "20px", "opacity": "0.8"})
        ], style=HEADER_STYLE),
        
        # Introduction Card
        html.Div([
            html.H2("Welcome to Your Cycling Analytics Hub", style={"color": "#38BDF8"}),
            html.P([
                "This dashboard helps you analyze and visualize your cycling data from location history. ",
                "Explore your routes, track your progress, and gain insights into your cycling performance."
            ]),
            html.P([
                "Use the navigation links below to explore different visualizations and analyses of your cycling data."
            ])
        ], style=CARD_STYLE),
        
        # Statistics Cards
        html.Div([
            html.H3("Your Cycling Statistics", style={"marginTop": "20px", "marginBottom": "10px"}),
            dbc.Row(
                stat_cards,
                className="g-0"  # No gutters for tight layout
            )
        ]),
        
        # Navigation Buttons
        html.Div([
            html.H3("Explore Your Data", style={"marginTop": "30px", "marginBottom": "15px"}),
            dbc.Row([
                dbc.Col([
                    html.Div([
                        html.H4("Route Visualization", style={"color": "#38BDF8"}),
                        html.P("View your cycling routes on an interactive map to see where you've been."),
                        dcc.Link(
                            html.Button("View Routes", style=BUTTON_STYLE),
                            href="/route-visualization"
                        )
                    ], style=CARD_STYLE)
                ], xs=12, md=4),
                
                dbc.Col([
                    html.Div([
                        html.H4("Time & Distance Analysis", style={"color": "#38BDF8"}),
                        html.P("Analyze your cycling distance over time and track your progress."),
                        dcc.Link(
                            html.Button("View Analysis", style=BUTTON_STYLE),
                            href="/time-distance-analysis"
                        )
                    ], style=CARD_STYLE)
                ], xs=12, md=4),
                
                dbc.Col([
                    html.Div([
                        html.H4("Geospatial Insights", style={"color": "#38BDF8"}),
                        html.P("Discover patterns and hotspots in your cycling activities with heatmaps."),
                        dcc.Link(
                            html.Button("View Insights", style=BUTTON_STYLE),
                            href="/geospatial-insights"
                        )
                    ], style=CARD_STYLE)
                ], xs=12, md=4)
            ])
        ]),
        
        # Footer
        html.Footer([
            html.Hr(style={"margin": "30px 0", "borderColor": "#2D3748"}),
            html.P("Cycling Data Dashboard © 2025", 
                  style={"textAlign": "center", "color": "#94A3B8", "fontSize": "14px"})
        ])
    ], style=BASE_STYLE)
    
    return layout


# For testing
if __name__ == "__main__":
    # This would be used by the main app to generate the layout
    layout = create_index_layout()
    print("Index layout created successfully")

