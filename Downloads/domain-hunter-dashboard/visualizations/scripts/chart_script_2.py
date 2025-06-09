import plotly.graph_objects as go
import plotly.io as pio

# Data from the provided JSON
criteres = ["Domain Rating\n(DR)", "Trust Flow", "Âge du\nDomaine", "Qualité\nBacklinks", "Trafic\nOrganique", "Potentiel\nCommercial", "Historique\nClean", "Pertinence\nNiche"]
scores = [75, 68, 85, 72, 60, 78, 90, 82]

# Create radar chart
fig = go.Figure()

fig.add_trace(go.Scatterpolar(
    r=scores,
    theta=criteres,
    fill='toself',
    fillcolor='rgba(31, 184, 205, 0.3)',  # Semi-transparent #1FB8CD
    line=dict(color='#1FB8CD', width=3),  # Strong cyan for line
    marker=dict(color='#1FB8CD', size=8),
    name='Scores'
))

fig.update_layout(
    title='Profil Domaine Expiré Premium',
    polar=dict(
        radialaxis=dict(
            visible=True,
            range=[0, 100],
            tickvals=[20, 40, 60, 80, 100],
            ticktext=['20', '40', '60', '80', '100']
        ),
        angularaxis=dict(
            tickfont=dict(size=11)
        )
    ),
    showlegend=False
)

# Save the chart
fig.write_image('radar_chart.png')