from dash import html, dcc, callback, Input, Output
import dash_bootstrap_components as dbc
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from datetime import datetime, timedelta
import numpy as np

def layout(data):
    """
    Generate the layout for the overview page
    
    Args:
        data: Processed cycling data DataFrame
    """
    if data is None or data.empty:
        return html.Div([
            html.H2("Cycling Data Dashboard"),
            html.Div("No cycling data available. Please check data source.")
        ])
    
    # Calculate key metrics
    total_distance = data['distance_km'].sum()
    total_rides = len(data)
    total_duration = data['duration_min'].sum()
    avg_speed = data['speed_kmh'].mean()
    
    # Recent trend - last 10 rides
    recent_data = data.sort_values('start_time', ascending=False).head(10)
    
    # Data range
    date_range = f"{data['start_time'].min().strftime('%Y-%m-%d')} to {data['start_time'].max().strftime('%Y-%m-%d')}"
    
    # Create layout
    return html.Div([
        html.H2("Cycling Analytics Dashboard", className="mb-4"),
        
        # Key metrics cards
        dbc.Row([
            dbc.Col(
                dbc.Card([
                    dbc.CardBody([
                        html.H4("Total Distance", className="card-title"),
                        html.H2(f"{total_distance:.1f} km", className="text-primary"),
                        html.P(f"{int(total_distance * 0.621371):.0f} miles", className="text-muted small")
                    ])
                ]),
                width={"size": 3, "order": 1}
            ),
            dbc.Col(
                dbc.Card([
                    dbc.CardBody([
                        html.H4("Total Rides", className="card-title"),
                        html.H2(f"{total_rides}", className="text-primary"),
                        html.P(f"{date_range}", className="text-muted small")
                    ])
                ]),
                width={"size": 3, "order": 2}
            ),
            dbc.Col(
                dbc.Card([
                    dbc.CardBody([
                        html.H4("Total Duration", className="card-title"),
                        html.H2(f"{int(total_duration // 60)}h {int(total_duration % 60)}m", className="text-primary"),
                        html.P(f"Avg: {int(total_duration / total_rides)} min/ride", className="text-muted small")
                    ])
                ]),
                width={"size": 3, "order": 3}
            ),
            dbc.Col(
                dbc.Card([
                    dbc.CardBody([
                        html.H4("Average Speed", className="card-title"),
                        html.H2(f"{avg_speed:.1f} km/h", className="text-primary"),
                        html.P(f"{avg_speed * 0.621371:.1f} mph", className="text-muted small")
                    ])
                ]),
                width={"size": 3, "order": 4}
            ),
        ], className="mb-4"),
        
        # Second row - Time series chart and map preview
        dbc.Row([
            # Time series chart of daily distances
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Activity Over Time"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=create_time_series_chart(data),
                            config={'displayModeBar': False}
                        )
                    ])
                ])
            ], width={"size": 8, "order": 1}),
            
            # Top routes
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Popular Routes"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=create_top_routes_chart(data),
                            config={'displayModeBar': False}
                        )
                    ])
                ])
            ], width={"size": 4, "order": 2}),
        ], className="mb-4"),
        
        # Third row - Recent activities table
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Recent Activities"),
                    dbc.CardBody(
                        create_recent_activities_table(recent_data)
                    )
                ])
            ], width=12)
        ]),
        
        # Hidden div for storing blockchain verification status
        html.Div(id='verification-status-store', style={'display': 'none'})
    ])

def create_time_series_chart(data):
    """Create a time series chart of daily cycling distances"""
    # Group data by date and calculate daily totals
    daily_data = data.groupby('date').agg({
        'distance_km': 'sum',
        'duration_min': 'sum',
        'start_time': 'count'
    }).reset_index()
    daily_data.rename(columns={'start_time': 'rides'}, inplace=True)
    
    # Create the figure
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=daily_data['date'],
        y=daily_data['distance_km'],
        mode='lines+markers',
        name='Distance (km)',
        line=dict(color='#007BFF', width=2),
        marker=dict(size=8, symbol='circle')
    ))
    
    # Update layout
    fig.update_layout(
        margin=dict(l=20, r=20, t=30, b=30),
        height=350,
        hovermode='x unified',
        legend=dict(orientation='h', yanchor='bottom', y=1.02, xanchor='right', x=1),
        xaxis=dict(title='Date'),
        yaxis=dict(title='Distance (km)'),
        plot_bgcolor='white',
    )
    
    # Add range selector
    fig.update_xaxes(
        rangeslider_visible=True,
        rangeselector=dict(
            buttons=list([
                dict(count=7, label="1w", step="day", stepmode="backward"),
                dict(count=1, label="1m", step="month", stepmode="backward"),
                dict(step="all")
            ])
        )
    )
    
    return fig

def create_top_routes_chart(data):
    """Create a chart showing top cycling routes"""
    # Create a simplified route identifier based on start and end coordinates
    data['route_simple'] = data.apply(
        lambda row: f"{row['start_lat']:.3f},{row['start_lon']:.3f} → {row['end_lat']:.3f},{row['end_lon']:.3f}", 
        axis=1
    )
    
    # Count frequency of each route
    route_counts = data['route_simple'].value_counts().reset_index()
    route_counts.columns = ['route', 'count']
    
    # Take top 5 routes
    top_routes = route_counts.head(5)
    
    # Create bar chart
    fig = px.bar(
        top_routes, 
        x='count', 
        y='route',
        orientation='h',
        labels={'count': 'Number of Rides', 'route': 'Route'},
        color='count',
        color_continuous_scale=px.colors.sequential.Blues
    )
    
    # Update layout
    fig.update_layout(
        margin=dict(l=20, r=20, t=20, b=20),
        height=350,
        plot_bgcolor='white',
        yaxis=dict(autorange="reversed")
    )
    
    return fig

def create_recent_activities_table(data):
    """Create a table displaying recent cycling activities"""
    if data.empty:
        return html.P("No recent activities")
    
    # Create table header
    header = html.Thead(html.Tr([
        html.Th("Date"),
        html.Th("Route"),
        html.Th("Distance"),
        html.Th("Duration"),
        html.Th("Avg Speed"),
        html.Th("Verification")
    ]))
    
    # Create table rows
    rows = []
    for i, row in data.iterrows():
        # Format the date
        date_str = row['start_time'].strftime("%b %d, %Y")
        time_str = row['start_time'].strftime("%H:%M")
        
        # Format route
        route = f"{row['start_lat']:.4f},{row['start_lon']:.4f} → {row['end_lat']:.4f},{row['end_lon']:.4f}"
        
        # Calculate metrics
        distance = f"{row['distance_km']:.2f} km"
        duration = f"{int(row['duration_min'])} min"
        speed = f"{row['speed_kmh']:.1f} km/h"
        
        # Create a row with verification status indicator
        rows.append(html.Tr([
            html.Td(f"{date_str} {time_str}"),
            html.Td(route, style={"maxWidth": "250px", "overflow": "hidden", "textOverflow": "ellipsis"}),
            html.Td(distance),
            html.Td(duration),
            html.Td(speed),
            html.Td(html.I(
                className="fas fa-check-circle text-success" if row['confidence'] > 0.8 else "fas fa-question-circle text-warning",
                id=f"verify-{i}"
            ))
        ]))
    
    # Create the table body
    body = html.Tbody(rows)
    
    # Return complete table
    return dbc.Table([header, body], bordered=True, hover=True, responsive=True, striped=True, size="sm")