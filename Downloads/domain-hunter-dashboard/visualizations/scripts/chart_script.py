import plotly.graph_objects as go

# Data from the provided JSON
mois = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
domaines_analyses_milliers = [1.2, 1.45, 1.68, 1.82, 2.1, 2.35, 2.58, 2.75, 2.9, 3.2, 3.45, 3.6]
opportunites_centaines = [1.5, 2.03, 2.52, 2.91, 3.57, 4.23, 4.9, 5.5, 6.09, 7.04, 7.76, 8.28]
roi_moyen = [180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345]
cout_analyse_centimes = [5.2, 4.8, 4.5, 4.2, 3.9, 3.6, 3.4, 3.2, 3.0, 2.8, 2.6, 2.4]

# Create the figure with secondary y-axis
fig = go.Figure()

# Brand colors in order
colors = ['#1FB8CD', '#FFC185', '#ECEBD5', '#5D878F']

# Add traces for left axis metrics (domaines and opportunites)
fig.add_trace(go.Scatter(
    x=mois, 
    y=domaines_analyses_milliers,
    mode='lines+markers',
    name='Domaines (k)',
    line=dict(color=colors[0], width=3),
    marker=dict(size=6),
    cliponaxis=False,
    yaxis='y'
))

fig.add_trace(go.Scatter(
    x=mois, 
    y=opportunites_centaines,
    mode='lines+markers',
    name='Opport. (100s)',
    line=dict(color=colors[1], width=3),
    marker=dict(size=6),
    cliponaxis=False,
    yaxis='y'
))

# Add traces for right axis metrics (ROI and cost)
fig.add_trace(go.Scatter(
    x=mois, 
    y=roi_moyen,
    mode='lines+markers',
    name='ROI (%)',
    line=dict(color=colors[2], width=3),
    marker=dict(size=6),
    cliponaxis=False,
    yaxis='y2'
))

fig.add_trace(go.Scatter(
    x=mois, 
    y=cout_analyse_centimes,
    mode='lines+markers',
    name='Coût (cts)',
    line=dict(color=colors[3], width=3),
    marker=dict(size=6),
    cliponaxis=False,
    yaxis='y2'
))

# Update layout with dual y-axes
fig.update_layout(
    title='Évolution Performance 12 Mois',
    xaxis_title='Mois',
    yaxis=dict(
        title='Domaines & Opport.',
        side='left'
    ),
    yaxis2=dict(
        title='ROI & Coût',
        side='right',
        overlaying='y'
    ),
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5)
)

# Update x-axis
fig.update_xaxes(
    tickmode='linear',
    tick0=1,
    dtick=1
)

# Save the chart
fig.write_image('performance_chart.png')