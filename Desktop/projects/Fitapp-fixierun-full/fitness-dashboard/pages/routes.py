from dash import html, dcc, callback, Input, Output
import dash_bootstrap_components as dbc
import pandas as pd
from datetime import datetime, timedelta
import numpy as np

def layout(data):
    """
    Generate the layout for the routes visualization page
    
    Args:
        data: Processed cycling data DataFrame
    """
    if data is None or data.empty:
        return html.Div([
            html.H2("Routes Visualization"),
            html.Div("No cycling data available. Please check data source.")
        ])
    
    # Create date range options
    date_options = [
        {'label': 'All time', 'value': 'all'},
        {'label': 'Last 7 days', 'value': '7d'},
        {'label': 'Last 30 days', 'value': '30d'}
    ]
    
    # Extract unique months for the dropdown
    unique_months = data.groupby(['year', 'month']).size().reset_index()
    unique_months['month_name'] = unique_months.apply(
        lambda row: datetime(int(row['year']), int(row['month']), 1).strftime('%B %Y'), 
        axis=1
    )
    unique_months['month_value'] = unique_months.apply(
        lambda row: f"{row['year']}-{row['month']}", 
        axis=1
    )
    
    # Add month options
    for _, row in unique_months.iterrows():
        date_options.append({
            'label': row['month_name'],
            'value': row['month_value']
        })
    
    # Identify the two geographic regions
    data['region'] = data.apply(
        lambda row: 'Belgium' if 50 <= row['start_lat'] <= 52 else 'Spain' if 41 <= row['start_lat'] <= 42 else 'Other',
        axis=1
    )
    
    region_options = [
        {'label': 'All regions', 'value': 'all'},
        {'label': 'Belgium (Liège)', 'value': 'Belgium'},
        {'label': 'Spain (Barcelona)', 'value': 'Spain'}
    ]
    
    return html.Div([
        html.H2("Cycling Routes", className="mb-4"),
        
        # Filter controls
        dbc.Row([
            dbc.Col([
                html.Label("Date Range:"),
                dcc.Dropdown(
                    id='date-filter',
                    options=date_options,
                    value='all',
                    clearable=False
                )
            ], width={"size": 3, "order": 1}),
            
            dbc.Col([
                html.Label("Region:"),
                dcc.Dropdown(
                    id='region-filter',
                    options=region_options,
                    value='all',
                    clearable=False
                )
            ], width={"size": 3, "order": 2}),
            
            dbc.Col([
                html.Label("Min Distance (km):"),
                dcc.Slider(
                    id='distance-filter',
                    min=0,
                    max=round(data['distance_km'].max()),
                    step=1,
                    value=0,
                    marks={i: str(i) for i in range(0, round(data['distance_km'].max()) + 1, 5)},
                )
            ], width={"size": 6, "order": 3}),
        ], className="mb-4"),
        
        # Map and stats
        dbc.Row([
            # Map
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Cycling Routes Map"),
                    dbc.CardBody([
                        dcc.Graph(
                            id='routes-map',
                            figure={},
                            style={'height': 700},
                            config={
                                'displayModeBar': True,
                                'scrollZoom': True
                            }
                        )
                    ])
                ])
            ], width=9),
            
            # Route details and stats
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Selected Route Details"),
                    dbc.CardBody([
                        html.Div(id='route-details', className="mb-4"),
                        html.Hr(),
                        html.H5("Route Statistics"),
                        html.Div(id='route-stats')
                    ])
                ], className="mb-3"),
                
                dbc.Card([
                    dbc.CardHeader("Blockchain Verification"),
                    dbc.CardBody([
                        html.Div(id='blockchain-verification'),
                        html.Button(
                            "Verify on Blockchain", 
                            id="verify-button",
                            className="btn btn-primary mt-3"
                        )
                    ])
                ])
            ], width=3),
        ]),
        
        # Hidden div to store the selected route data
        html.Div(id='selected-route-store', style={'display': 'none'})
    ])

@callback(
    Output('routes-map', 'figure'),
    Input('date-filter', 'value'),
    Input('region-filter', 'value'),
    Input('distance-filter', 'value')
)
def update_map(date_filter, region_filter, min_distance):
    """Update the routes map based on filters"""
    # Apply filtering
    filtered_data = filter_data(data, date_filter, region_filter, min_distance)
    
    # Create the map figure
    fig = create_routes_map(filtered_data)
    
    return fig

@callback(
    Output('selected-route-store', 'children'),
    Input('routes-map', 'clickData')
)
def store_selected_route(click_data):
    """Store the selected route data when a route is clicked"""
    if not click_data:
        return "No route selected"
    
    # Get the index of the selected point
    point_index = click_data['points'][0]['pointIndex']
    curve_number = click_data['points'][0]['curveNumber']
    
    # Get the filtered data based on current filters
    # Note: this is a simplified version - in a real app you'd track the filters state
    filtered_data = data.copy()
    
    # Find the selected route
    if 0 <= point_index < len(filtered_data):
        selected_route = filtered_data.iloc[point_index]
        # Convert to JSON for storage
        return selected_route.to_json()
    
    return "Route not found"

@callback(
    Output('route-details', 'children'),
    Output('route-stats', 'children'),
    Output('blockchain-verification', 'children'),
    Input('selected-route-store', 'children')
)
def update_route_details(selected_route_json):
    """Update the route details panel when a route is selected"""
    if not selected_route_json or selected_route_json == "No route selected" or selected_route_json == "Route not found":
        # Default content when no route is selected
        return (
            html.P("Click on a route to see details"),
            html.P("No statistics available"),
            html.Div([
                html.P("No route selected for verification"),
                html.I(className="fas fa-question-circle fa-2x text-secondary")
            ])
        )
    
    # Parse the JSON to get the selected route
    try:
        selected_route = pd.read_json(selected_route_json, typ='series')
    except:
        return (
            html.P("Error loading route details"),
            html.P("No statistics available"),
            html.Div([
                html.P("Verification error"),
                html.I(className="fas fa-exclamation-triangle fa-2x text-danger")
            ])
        )
    
    # Format the details
    route_details = html.Div([
        html.H5(f"Route on {selected_route['start_time'].split(' ')[0]}"),
        html.P([
            html.Strong("Start: "), 
            f"{selected_route['start_time']} at {selected_route['start_lat']:.4f}, {selected_route['start_lon']:.4f}"
        ]),
        html.P([
            html.Strong("End: "), 
            f"{selected_route['end_time']} at {selected_route['end_lat']:.4f}, {selected_route['end_lon']:.4f}"
        ]),
        html.P([
            html.Strong("Distance: "), 
            f"{selected_route['distance_km']:.2f} km"
        ]),
        html.P([
            html.Strong("Activity: "), 
            f"{selected_route['activity_type']}"
        ]),
    ])
    
    # Calculate statistics
    duration = pd.to_datetime(selected_route['end_time']) - pd.to_datetime(selected_route['start_time'])
    duration_mins = duration.total_seconds() / 60
    speed = selected_route['distance_km'] / (duration_mins / 60) if duration_mins > 0 else 0
    
    route_stats = html.Div([
        html.P([html.Strong("Duration: "), f"{int(duration_mins)} minutes"]),
        html.P([html.Strong("Avg Speed: "), f"{speed:.1f} km/h"]),
        html.P([html.Strong("Confidence: "), f"{selected_route['confidence']:.2f}"]),
    ])
    
    # Blockchain verification status
    verification_status = html.Div([
        html.P("This route can be verified on the blockchain for immutable proof of activity."),
        html.Div([
            html.I(className="fas fa-fingerprint fa-2x mr-2 text-info"),
            html.Span(f"Route Hash: {selected_route['route_hash'][:10]}...", className="text-monospace")
        ])
    ])
    
    return route_details, route_stats, verification_status

def filter_data(data, date_filter, region_filter, min_distance):
    """Filter data based on user selections"""
    filtered_data = data.copy()
    
    # Apply date filter
    now = datetime.now()
    if date_filter == '7d':
        start_date = now - timedelta(days=7)
        filtered_data = filtered_data[filtered_data['start_time'] >= start_date]
    elif date_filter == '30d':
        start_date = now - timedelta(days=30)
        filtered_data = filtered_data[filtered_data['start_time'] >= start_date]
    elif date_filter != 'all' and '-' in date_filter:
        # Handle year-month filter
        year, month = date_filter.split('-')
        filtered_data = filtered_data[(filtered_data['year'] == int(year)) & (filtered_data['month'] == int(month))]
    
    # Apply region filter
    if region_filter != 'all':
        filtered_data = filtered_data[filtered_data['region'] == region_filter]
    
    # Apply distance filter
    if min_distance > 0:
        filtered_data = filtered_data[filtered_data['distance_km'] >= min_distance]
    
    return filtered_data

def create_routes_map(data):
    """Create a map visualization of the cycling routes"""
    if data.empty:
        # Return empty map with message
        fig = go.Figure()
        fig.add_annotation(
            text="No routes to display with current filters",
            xref="paper", yref="paper",
            x=0.5, y=0.5,
            showarrow=False,
            font=dict(size=16)
        )
        return fig
    
    # Create base map
    fig = go.Figure()
    
    # Add lines for each cycling route
    for i, row in data.iterrows():
        fig.add_trace(go.Scattermapbox(
            mode="lines+markers",
            lon=[row['start_lon'], row['end_lon']],
            lat=[row['start_lat'], row['end_lat']],
            marker=dict(size=10, color="#007BFF"),
            line=dict(width=2, color="#007BFF"),
            opacity=0.7,
            hoverinfo="text",
            hovertext=f"Date: {row['start_time']}<br>Distance: {row['distance_km']:.2f} km<br>" +
                     f"Duration: {int(row['duration_min'])} min<br>" +
                     f"Speed: {row['speed_kmh']:.1f} km/h",
            name=f"Route {i}",
            showlegend=False,
            customdata=[i]  # Store the index for callbacks
        ))
    
    # Determine the map center and zoom level
    # Check if there's a predominant region
    if 'region' in data.columns and data['region'].value_counts().idxmax() == 'Belgium':
        # Center around Belgium
        center_lat = 50.6
        center_lon = 5.6
        zoom = 10
    else:
        # Center around Barcelona
        center_lat = 41.4
        center_lon = 2.2
        zoom = 9
    
    # Update layout
    fig.update_layout(
        mapbox=dict(
            style="open-street-map",
            center=dict(lat=center_lat, lon=center_lon),
            zoom=zoom
        ),
        margin=dict(l=0, r=0, t=0, b=0),
        height=700,
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1
        )
    )
    
    return fig