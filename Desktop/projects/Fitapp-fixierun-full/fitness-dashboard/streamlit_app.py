"""
Main Streamlit application for fitness dashboard.

This is the main entry point for the fitness dashboard application.
It imports functionality from the modular components and creates the UI.
"""
import streamlit as st
import plotly.express as px
import pandas as pd
from datetime import datetime
import os
import sys

# Import data loading functions
from src.data_loader import load_data, load_tcx_data

# Import UI components
from src.ui.dashboard import create_dashboard
from src.ui.route_maps import create_route_maps_section
from src.ui.performance import create_performance_section
from src.ui.auth import authentication_page
from src.ui.settings import create_settings_section, load_settings

# Import config
import config
def load_css():
    """Load custom CSS styles."""
    css_file = 'style.css'
    if os.path.exists(css_file):
        with open(css_file) as f:
            st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)
    else:
        # Use default styles
        st.markdown("""
        <style>
            .stApp {
                max-width: 1200px;
                margin: 0 auto;
            }
            /* Responsive adjustments for mobile */
            @media (max-width: 640px) {
                .stApp {
                    padding-left: 5px;
                    padding-right: 5px;
                }
                /* Make sure tables don't overflow on mobile */
                .dataframe-container {
                    overflow-x: auto;
                }
                /* Improve button sizes on mobile */
                .stButton>button {
                    height: 3em;
                    padding: 0.5em;
                    width: 100%;
                }
            }
        </style>
        """, unsafe_allow_html=True)

# Page configuration
def check_authentication():
    """Check if user is authenticated"""
    if not st.session_state.get('authenticated'):
        authentication_page()
        st.stop()

def main_app():
    """Main application after authentication"""
    load_css()
    
    # Sidebar
    with st.sidebar:
        st.title("Fitness Dashboard")
        if st.button("Déconnexion"):
            st.session_state.authenticated = False
            st.experimental_rerun()

        # Load user settings
        if 'settings' not in st.session_state:
            st.session_state.settings = load_settings()

        # Date range filter
        st.subheader("Filtres")
        date_range = st.date_input(
            "Période",
            value=(
                datetime.now().replace(month=1, day=1),
                datetime.now()
            )
        )

        # Activity type filter
        activity_type = st.selectbox(
            "Type d'Activité",
            options=["Tous", "Marche", "Vélo", "Course"]
        )

        # Apply filters button
        apply_filters = st.button("Appliquer les filtres", type="primary")

        # Settings
        if st.button("Paramètres"):
            st.session_state.show_settings = True

    # Main content
    check_authentication()
    
    # Load data
    df = load_data()
    if df is None:
        st.stop()

    # Load TCX data
    tcx_data = load_tcx_data()

    # Show settings if requested
    if st.session_state.get('show_settings', False):
        settings = create_settings_section()
        if st.button("Fermer les paramètres"):
            st.session_state.show_settings = False
        st.stop()

    # Create tabs
    tab1, tab2, tab3, tab4 = st.tabs([
        "Vue d'ensemble",
        "Tendances",
        "Analyses",
        "Carte"
    ])

    # Fill each tab with the corresponding components
    with tab1:
        create_dashboard(df, tcx_data)

    with tab2:
        create_performance_section(df, tcx_data)

    with tab3:
        # Additional analysis components can be added here
        st.header("Analyses Avancées")

        # Example of additional analysis that could be added
        if not df.empty:
            # Activity distribution by day of week
            st.subheader("Distribution par Jour de la Semaine")
            # Ensure Date column is datetime type before using dt accessor
            df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
            df['day_of_week'] = df['Date'].dt.day_name()
            day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            day_counts = df['day_of_week'].value_counts().reindex(day_order)

            if not day_counts.empty:
                fig = px.bar(
                    x=day_counts.index,
                    y=day_counts.values,
                    labels={'x': 'Jour', 'y': 'Nombre d\'Activités'},
                    title='Activités par Jour de la Semaine'
                )
                st.plotly_chart(fig, use_container_width=True)

    with tab4:
        create_route_maps_section(df, tcx_data)

    # Footer
    st.markdown("---")
    st.markdown(
        "Fitness Dashboard | Données mises à jour: " +
        datetime.now().strftime("%Y-%m-%d %H:%M")
    )

# Page configuration
st.set_page_config(
    page_title=config.UI_CONFIG["page_title"],
    page_icon=config.UI_CONFIG["page_icon"],
    layout=config.UI_CONFIG["layout"],
    initial_sidebar_state=config.UI_CONFIG["initial_sidebar_state"]
)

if __name__ == '__main__':
    if st.runtime.exists():
        main_app()
    else:
        import streamlit.cli as stcli
        sys.exit(stcli.main())
