import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import pydeck as pdk
from datetime import datetime, timedelta
import os
import json
import requests
from PIL import Image

# Custom utility imports (to be implemented later)
# from utils.auth import check_authentication
# from utils.db import get_user_data, get_activity_data
# from utils.web3_client import get_token_balance
# from components.metrics import display_metric_card
# from components.charts import plot_activity_chart

# App configuration
st.set_page_config(
    page_title="FixieRun Dashboard",
    page_icon="🚴",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #FF5A5F;
        font-weight: 700;
    }
    .sub-header {
        font-size: 1.5rem;
        color: #666;
        font-weight: 500;
    }
    .metric-card {
        background-color: #f7f7f7;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .metric-label {
        font-size: 1rem;
        color: #666;
    }
    .metric-value {
        font-size: 2rem;
        font-weight: 700;
        color: #FF5A5F;
    }
    .metric-delta {
        font-size: 0.9rem;
        color: green;
    }
    .stButton>button {
        background-color: #FF5A5F;
        color: white;
        border-radius: 5px;
        border: none;
        padding: 10px 20px;
    }
    .stButton>button:hover {
        background-color: #FF4046;
    }
    footer {visibility: hidden;}
    #MainMenu {visibility: hidden;}
</style>
""", unsafe_allow_html=True)

# Initialize session state for authentication
if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False
if 'username' not in st.session_state:
    st.session_state.username = ""
if 'wallet_address' not in st.session_state:
    st.session_state.wallet_address = ""

# Temporary authentication for demo purposes (will be replaced with proper auth later)
def demo_login():
    st.session_state.authenticated = True
    st.session_state.username = "demo_user"
    st.session_state.wallet_address = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"

# Sidebar
with st.sidebar:
    st.image("https://via.placeholder.com/150x150.png?text=FixieRun", width=150)
    st.markdown("### FixieRun")
    
    if not st.session_state.authenticated:
        st.warning("You are not logged in.")
        if st.button("Demo Login"):
            demo_login()
    else:
        st.success(f"Logged in as {st.session_state.username}")
        st.markdown(f"Wallet: `{st.session_state.wallet_address[:10]}...`")
        
        # Navigation is handled by the multipage app, but we can add custom links
        st.markdown("### Quick Links")
        st.markdown("- [NFT Marketplace](https://fixierun.io/marketplace)")
        st.markdown("- [Leaderboard](https://fixierun.io/leaderboard)")
        st.markdown("- [Documentation](https://docs.fixierun.io)")
        
        if st.button("Logout"):
            st.session_state.authenticated = False
            st.session_state.username = ""
            st.session_state.wallet_address = ""
            st.experimental_rerun()

# Main content
def main():
    if not st.session_state.authenticated:
        show_login_page()
    else:
        show_dashboard()

def show_login_page():
    st.markdown('<p class="main-header">Welcome to FixieRun Dashboard</p>', unsafe_allow_html=True)
    
    col1, col2 = st.columns([3, 2])
    
    with col1:
        st.markdown("""
        ### FixieRun: Move-to-Earn Cycling Platform
        
        FixieRun est une plateforme Web3 qui intègre fitness, blockchain technology et NFTs pour 
        créer une expérience unique et gratifiante pour les cyclistes du monde entier. 
        
        **Key Features:**
        - 🚴 **Move-to-Earn**: Earn $FIXIE tokens for cycling activities
        - 🖼️ **NFT Marketplace**: Collect unique virtual bike NFTs
        - 🌐 **Global Challenges**: Participate in worldwide cycling events
        - 💰 **Token Rewards**: Convert activity to real value
        - 🔐 **Blockchain Security**: Powered by zkEVM technology
        
        Click the "Demo Login" button in the sidebar to explore the dashboard!
        """)
    
    with col2:
        st.image("https://via.placeholder.com/400x300.png?text=FixieRun+Promo", use_column_width=True)
        st.markdown("""
        #### Ready to ride?
        
        Get started with the FixieRun app:
        
        [Download for iOS](https://apps.apple.com) | [Download for Android](https://play.google.com)
        """)

def show_dashboard():
    st.markdown('<p class="main-header">FixieRun Dashboard</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Your cycling activity overview</p>', unsafe_allow_html=True)
    
    # Generate sample data for demonstration
    @st.cache_data
    def get_sample_data():
        # Sample activity data for the past 30 days
        dates = [datetime.now() - timedelta(days=i) for i in range(30)]
        distances = [np.random.uniform(5, 30) for _ in range(30)]
        durations = [d * np.random.uniform(3, 5) for d in distances]  # minutes
        calories = [d * np.random.uniform(30, 50) for d in distances]
        tokens = [d * np.random.uniform(0.5, 1.5) for d in distances]
        
        return pd.DataFrame({
            'Date': dates,
            'Distance (km)': distances,
            'Duration (min)': durations,
            'Calories': calories,
            'Tokens earned': tokens
        })
    
    df = get_sample_data()
    
    # Display metrics in cards
    st.markdown("### Today's Stats")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown('<div class="metric-card">', unsafe_allow_html=True)
        st.markdown('<p class="metric-label">Distance</p>', unsafe_allow_html=True)
        st.markdown(f'<p class="metric-value">{df["Distance (km)"][0]:.1f} km</p>', unsafe_allow_html=True)
        st.markdown(f'<p class="metric-delta">+12% vs last week</p>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="metric-card">', unsafe_allow_html=True)
        st.markdown('<p class="metric-label">Duration</p>', unsafe_allow_html=True)
        st.markdown(f'<p class="metric-value">{df["Duration (min)"][0]:.0f} min</p>', unsafe_allow_html=True)
        st.markdown(f'<p class="metric-delta">+5% vs last week</p>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col3:
        st.markdown('<div class="metric-card">', unsafe_allow_html=True)
        st.markdown('<p class="metric-label">Calories</p>', unsafe_allow_html=True)
        st.markdown(f'<p class="metric-value">{df["Calories"][0]:.0f}</p>', unsafe_allow_html=True)
        st.markdown(f'<p class="metric-delta">+8% vs last week</p>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col4:
        st.markdown('<div class="metric-card">', unsafe_allow_html=True)
        st.markdown('<p class="metric-label">$FIXIE Earned</p>', unsafe_allow_html=True)
        st.markdown(f'<p class="metric-value">{df["Tokens earned"][0]:.2f}</p>', unsafe_allow_html=True)
        st.markdown(f'<p class="metric-delta">+15% vs last week</p>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
    
    # Weekly activity chart
    st.markdown("### Weekly Activity")
    weekly_df = df.head(7).copy()
    weekly_df['Day'] = weekly_df['Date'].dt.strftime('%a')
    
    fig = px.bar(
        weekly_df, 
        x='Day', 
        y='Distance (km)',
        color='Tokens earned',
        color_continuous_scale='Viridis',
        labels={'Distance (km)': 'Distance (km)', 'Tokens earned': '$FIXIE Tokens'},
        title="Distance and Tokens Earned"
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # Map view of recent activity (sample location)
    st.markdown("### Recent Activity Map")
    
    # Sample data point for Paris
    map_data = pd.DataFrame({
        'lat': [48.8566],
        'lon': [2.3522]
    })
    
    st.pydeck_chart(pdk.Deck(
        map_style='mapbox://styles/mapbox/light-v10',
        initial_view_state=pdk.ViewState(
            latitude=48.8566,
            longitude=2.3522,
            zoom=13,
            pitch=50,
        ),
        layers=[
            pdk.Layer(
                'ScatterplotLayer',
                data=map_data,
                get_position='[lon, lat]',
                get_color='[200, 30, 0, 160]',
                get_radius=500,
                pickable=True
            ),
            pdk.Layer(
                'PathLayer',
                data=pd.DataFrame({
                    'path': [[
                        [2.3522, 48.8566],
                        [2.3622, 48.8666],
                        [2.3722, 48.8566],
                        [2.3622, 48.8466],
                        [2.3522, 48.8566]
                    ]],
                    'color': [[255, 0, 0]]
                }),
                get_path='path',
                get_color='color',
                width_scale=20,
                width_min_pixels=2,
            )
        ],
    ))
    
    # NFT Collection Preview
    st.markdown("### Your NFT Collection")
    nft_col1, nft_col2, nft_col3 = st.columns(3)
    
    with nft_col1:
        st.image("https://via.placeholder.com/300x300.png?text=Fixie+NFT+1", caption="Fixie Racer - Rare")
        st.markdown("**Level**: 3")
        st.markdown("**Bonus**: +5% tokens")
        st.progress(75)
    
    with nft_col2:
        st.image("https://via.placeholder.com/300x300.png?text=Fixie+NFT+2", caption="Mountain Explorer - Epic")
        st.markdown("**Level**: 2")
        st.markdown("**Bonus**: +10% distance")
        st.progress(45)
    
    with nft_col3:
        st.image("https://via.placeholder.com/300x300.png?text=Fixie+NFT+3", caption="Urban Rider - Common")
        st.markdown("**Level**: 5")
        st.markdown("**Bonus**: +3% calories")
        st.progress(100)
    
    st.markdown("### Active Challenges")
    challenge_col1, challenge_col2 = st.columns(2)
    
    with challenge_col1:
        st.markdown("#### Tour de Ville")
        st.markdown("Parcourez 100km dans votre ville")
        st.markdown("**Reward**: 50 $FIXIE")
        st.progress(65)
        st.caption("65% completed - 3 days left")
    
    with challenge_col2:
        st.markdown("#### Sprint Matinal")
        st.markdown("5 sorties de plus de 10km avant 8h")
        st.markdown("**Reward**: 25 $FIXIE")
        st.progress(80)
        st.caption("80% completed - 2 days left")

if __name__ == "__main__":
    main()

