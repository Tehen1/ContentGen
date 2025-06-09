import plotly.graph_objects as go
import plotly.io as pio

# Data from the provided JSON
categories = ["Budget Serré", "Budget Moyen", "Budget Élevé"]
affiliation = [45, 30, 20]
vente_liens = [35, 40, 30]
revente_directe = [20, 25, 30]
developpement_dapps = [0, 5, 20]

# Create the stacked bar chart with better contrasting colors
fig = go.Figure()

# Add each strategy as a separate trace with better colors and borders
fig.add_trace(go.Bar(
    name='Affiliation',
    x=categories,
    y=affiliation,
    text=[f'{val}%' for val in affiliation],
    textposition='inside',
    textfont=dict(color='white', size=12),
    marker=dict(color='#1FB8CD', line=dict(color='white', width=1)),
    cliponaxis=False
))

fig.add_trace(go.Bar(
    name='Vente liens',
    x=categories,
    y=vente_liens,
    text=[f'{val}%' for val in vente_liens],
    textposition='inside',
    textfont=dict(color='black', size=12),
    marker=dict(color='#FFC185', line=dict(color='white', width=1)),
    cliponaxis=False
))

fig.add_trace(go.Bar(
    name='Revente',
    x=categories,
    y=revente_directe,
    text=[f'{val}%' for val in revente_directe],
    textposition='inside',
    textfont=dict(color='black', size=12),
    marker=dict(color='#D2BA4C', line=dict(color='white', width=1)),
    cliponaxis=False
))

fig.add_trace(go.Bar(
    name='DApps',
    x=categories,
    y=developpement_dapps,
    text=[f'{val}%' if val > 0 else '' for val in developpement_dapps],
    textposition='inside',
    textfont=dict(color='white', size=12),
    marker=dict(color='#B4413C', line=dict(color='white', width=1)),
    cliponaxis=False
))

# Update layout for stacked bars
fig.update_layout(
    barmode='stack',
    title='Stratégies Monét. par Budget',
    xaxis_title='Budget',
    yaxis_title='Pourcentage (%)',
    legend=dict(
        orientation='h', 
        yanchor='bottom', 
        y=1.05, 
        xanchor='center', 
        x=0.5,
        font=dict(size=12)
    )
)

# Update axes with better spacing
fig.update_yaxes(range=[0, 100])
fig.update_xaxes(tickangle=0)

# Save the chart
fig.write_image('monetization_strategies_chart.png')