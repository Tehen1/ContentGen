#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Layout module for the geospatial insights page of the cycling data dashboard.
"""

import os
import sys
import pandas as pd
from dash import html, dcc
import dash_bootstrap_components as dbc
from datetime import datetime, timedelta

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.plotting_utils import create_geospatial_heatmap
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

INSIGHT_CARD_STYLE = {
    **CARD_STYLE,
    "height": "100%"
}


def create_geospatial_insights_layout():
    """
    Create the layout for the geospatial insights page.
    
    Returns:
        Dash HTML layout
    """
    # Load data to create the visualization
    data_path = DEFAULT_DATA_PATH
    df = None
    figure = None
    heatmap_metrics = []
    
    try:
        if os.path.exists(data_path):
            df = load_and_preprocess(data_path)
            if not df.empty:
                # Create the initial heatmap with all data
                figure = create_geospatial_heatmap(df, MAPBOX_TOKEN)
                
                # Determine available metrics for heatmap intensity
                for col in ['distance', 'speed', 'heart_rate', 'duration_minutes', 'elevation']:
                    if col in df.columns:
                        heatmap_metrics.append({"label": col.replace('_', ' ').title(), "value": col})
                
                if not heatmap_metrics:
                    # Default if no metrics available
                    heatmap_metrics = [{"label": "Density", "value": "density"}]
    except Exception as e:
        print(f"Error loading data for geospatial insights: {e}")
    
    # Create the layout
    layout = html.Div([
        # Header
        html.Div([
            html.H1("Geospatial Insights", style={"margin": "0"}),
            html.P("Discover patterns and hotspots in your cycling activities", 
                  style={"marginTop": "5px", "marginBottom": "20px", "opacity": "0.8"}),
            # Navigation breadcrumb
            html.Div([
                dcc.Link("Home", href="/", style={"color": "#94A3B8"}),
                html.Span(" > ", style={"color": "#64748B"}),
                html.Span("Geospatial Insights", style={"color": "#F8FAFC"})
            ], style={"fontSize": "14px", "marginTop": "5px"})
        ], style=HEADER_STYLE),
        
        # Main Content Row - Filters and Heatmap
        dbc.Row([
            # Filters Column
            dbc.Col([
                html.Div([
                    html.H3("Heatmap Controls", style={"color": "#38BDF8", "marginBottom": "15px"}),
                    
                    # Heatmap Intensity Metric
                    html.Div([
                        html.Label("Heatmap Intensity", style=FILTER_LABEL_STYLE),
                        dcc.Dropdown(
                            id='heatmap-metric',
                            options=heatmap_metrics,
                            value=heatmap_metrics[0]["value"] if heatmap_metrics else None,
                            style={"backgroundColor": "#1E293B", "color": "#0F172A"},
                            className="dash-dropdown"
                        )
                    ], style=FILTER_STYLE),
                    
                    # Radius Control
                    html.Div([
                        html.Label("Heatmap Radius", style=FILTER_LABEL_STYLE),
                        dcc.Slider(
                            id='radius-slider',
                            min=5,
                            max=30,
                            step=5,
                            marks={i: str(i) for i in range(5, 35, 5)},
                            value=15,
                            className="dash-slider"
                        )
                    ], style=FILTER_STYLE),
                    
                    # Opacity Control
                    html.Div([
                        html.Label("Heatmap Opacity", style=FILTER_LABEL_STYLE),
                        dcc.Slider(
                            id='opacity-slider',
                            min=0.1,
                            max=1.0,
                            step=0.1,
                            marks={i/10: str(i/10) for i in range(1, 11, 2)},
                            value=0.7,
                            className="dash-slider"
                        )
                    ], style=FILTER_STYLE),
                    
                    # Color Scale Selection
                    html.Div([
                        html.Label("Color Scale", style=FILTER_LABEL_STYLE),
                        dcc.Dropdown(
                            id='colorscale-dropdown',
                            options=[
                                {"label": "Viridis", "value": "Viridis"},
                                {"label": "Plasma", "value": "Plasma"},
                                {"label": "Inferno", "value": "Inferno"},
                                {"label": "Turbo", "value": "Turbo"},
                                {"label": "Magma", "value": "Magma"},
                                {"label": "Cividis", "value": "Cividis"}
                            ],
                            value="Viridis",
                            style={"backgroundColor": "#1E293B", "color": "#0F172A"},
                            className="dash-dropdown"
                        )
                    ], style=FILTER_STYLE),
                    
                    # Apply Button
                    html.Div([
                        html.Button(
                            "Apply Settings",
                            id="apply-heatmap-settings",
                            style=BUTTON_STYLE
                        )
                    ], style={"marginTop": "20px", "textAlign": "center"})
                ], style=CONTROL_CARD_STYLE),
                
                # Additional Info Card
                html.Div([
                    html.H3("Understanding Heatmaps", style={"color": "#38BDF8", "marginBottom": "15px"}),
                    html.P([
                        "Heatmaps show the concentration of your cycling activity across geographic areas. ",
                        "Areas with more intense colors indicate higher activity levels based on the selected metric."
                    ]),
                    html.P([
                        "Use the controls to adjust how the heatmap is displayed and to focus on different aspects of your cycling data."
                    ])
                ], style=CONTROL_CARD_STYLE)
            ], xs=12, md=3),
            
            # Heatmap Column
            dbc.Col([
                dcc.Loading(
                    id="loading-heatmap",
                    type="circle",
                    color="#38BDF8",
                    children=[
                        # Heatmap Container
                        html.Div([
                            dcc.Graph(
                                id='geospatial-heatmap',
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
                )
            ], xs=12, md=9)
        ]),
        
        # Insights Section
        html.Div([
            html.H3("Location Insights", style={"marginTop": "30px", "marginBottom": "15px"}),
            dbc.Row([
                # Most Visited Areas
                dbc.Col([
                    html.Div([
                        html.H4("Most Visited Areas", style={"color": "#38BDF8"}),
                        html.Div(id="most-visited-areas", children=[
                            html.P("Your most frequented cycling areas appear to be concentrated around the central and northern parts of your map."),
                            html.P("These areas show the highest activity density, suggesting they are your preferred cycling routes.")
                        ])
                    ], style=INSIGHT_CARD_STYLE)
                ], md=4),
                
                # Activity Patterns
                dbc.Col([
                    html.Div([
                        html.H4("Activity Patterns", style={"color": "#38BDF8"}),
                        html.Div(id="activity-patterns", children=[
                            html.P("Your cycling routes appear to follow main roads and pathways, with some detours through scenic areas."),
                            html.P("The heatmap suggests linear patterns typical of road cycling rather than off-road or trail riding.")
                        ])
                    ], style=INSIGHT_CARD_STYLE)
                ], md=4),
                
                # Recommendations
                dbc.Col([
                    html.Div([
                        html.H4("Exploration Opportunities", style={"color": "#38BDF8"}),
                        html.Div(id="exploration-recommendations", children=[
                            html.P("Based on your current routes, you might enjoy exploring more areas to the east and south."),
                            html.P("Consider trying new routes in less frequented areas to add variety to your cycling experience.")
                        ])
                    ], style=INSIGHT_CARD_STYLE)
                ], md=4)
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
    layout = create_geospatial_insights_layout()
    print("Geospatial Insights layout created successfully")

