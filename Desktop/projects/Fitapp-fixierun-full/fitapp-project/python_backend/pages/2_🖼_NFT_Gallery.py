import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import json
from PIL import Image
import random
import base64
from io import BytesIO

# Page configuration
st.set_page_config(
    page_title="FixieRun - NFT Gallery",
    page_icon="🖼️",
    layout="wide"
)

# Check authentication status (from main app)
if 'authenticated' not in st.session_state or not st.session_state.authenticated:
    st.warning("Please login from the main page to access your NFT gallery.")
    st.stop()

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
    .nft-card {
        background-color: #f7f7f7;
        border-radius: 10px;
        padding: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
        cursor: pointer;
    }
    .nft-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
    }
    .metric-card {
        background-color: #f7f7f7;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .metric-value {
        font-size: 2rem;
        font-weight: 700;
        color: #FF5A5F;
    }
    .filter-container {
        background-color: #f0f0f0;
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 20px;
    }
    .detail-view {
        background-color: #f7f7f7;
        border-radius: 15px;
        padding: 20px;
        margin-top: 20px;
    }
    .detail-header {
        font-size: 1.8rem;
        font-weight: 600;
        color: #333;
    }
    .detail-subheader {
        font-size: 1.2rem;
        color: #666;
        margin-bottom: 15px;
    }
    .detail-metadata {
        background-color: #e6e6e6;
        border-radius: 8px;
        padding: 10px;
        font-family: monospace;
    }
    .rarity-common {
        color: #6c757d;
    }
    .rarity-uncommon {
        color: #28a745;
    }
    .rarity-rare {
        color: #007bff;
    }
    .rarity-epic {
        color: #6f42c1;
    }
    .rarity-legendary {
        color: #FF5A5F;
    }
</style>
""", unsafe_allow_html=True)

# Generate random NFT data for demonstration purposes
@st.cache_data
def generate_nft_data(n=12):
    rarities = ["Common", "Uncommon", "Rare", "Epic", "Legendary"]
    rarity_weights = [0.5, 0.25, 0.15, 0.08, 0.02]
    rarity_values = [10, 50, 250, 1000, 5000]
    bike_types = ["Road Bike", "Mountain Bike", "Fixie", "BMX", "Gravel Bike", "Track Bike"]
    colors = ["Red", "Blue", "Green", "Black", "White", "Gold", "Silver", "Purple", "Orange", "Pink"]
    bonuses = ["Speed +5%", "Distance +10%", "Tokens +15%", "Calories +8%", "Experience +20%", "Rarity +10%"]
    
    nfts = []
    for i in range(n):
        rarity_idx = random.choices(range(len(rarities)), weights=rarity_weights)[0]
        nft = {
            "id": f"NFT#{i+1:04d}",
            "name": f"{random.choice(colors)} {random.choice(bike_types)}",
            "rarity": rarities[rarity_idx],
            "rarity_value": rarity_values[rarity_idx],
            "level": random.randint(1, 10),
            "mint_date": f"2024-{random.randint(1,4)}-{random.randint(1,28)}",
            "description": f"A unique FixieRun NFT bike with special attributes and bonuses.",
            "image_url": f"https://via.placeholder.com/300x300.png?text=Bike+NFT+{i+1}",
            "attributes": {
                "color": random.choice(colors),
                "type": random.choice(bike_types),
                "bonus": random.choice(bonuses),
                "max_speed": random.randint(20, 60),
                "durability": random.randint(70, 100),
                "style": random.randint(1, 100)
            },
            "token_id": f"0x{random.randint(0, 0xFFFFFFFF):x}",
            "collection": "FixieRun Genesis",
            "last_price": round(random.uniform(0.01, 2.0), 3) if random.random() > 0.3 else None,
            "owner": st.session_state.wallet_address
        }
        nfts.append(nft)
    return nfts

def get_rarity_color(rarity):
    rarity_colors = {
        "Common": "rarity-common",
        "Uncommon": "rarity-uncommon",
        "Rare": "rarity-rare",
        "Epic": "rarity-epic",
        "Legendary": "rarity-legendary"
    }
    return rarity_colors.get(rarity, "")

# Main page header
st.markdown('<p class="main-header">NFT Gallery</p>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">Your collection of FixieRun bike NFTs</p>', unsafe_allow_html=True)

# Generate sample NFT data
nfts = generate_nft_data(15)
nft_df = pd.DataFrame(nfts)

# Filtering and sorting section
st.markdown('<div class="filter-container">', unsafe_allow_html=True)
col1, col2, col3 = st.columns([1, 1, 1])
with col1:
    filter_rarity = st.multiselect("Filter by Rarity", 
                                  options=sorted(nft_df["rarity"].unique()), 
                                  default=sorted(nft_df["rarity"].unique()))
with col2:
    filter_type = st.multiselect("Filter by Bike Type", 
                               options=sorted([nft["attributes"]["type"] for nft in nfts]), 
                               default=[])
with col3:
    sort_by = st.selectbox("Sort by", 
                          options=["Rarity Value (High to Low)", "Level (High to Low)", "Mint Date (Newest)", "Name (A-Z)"])

# Apply filters
filtered_nfts = nft_df.copy()
if filter_rarity:
    filtered_nfts = filtered_nfts[filtered_nfts["rarity"].isin(filter_rarity)]
if filter_type:
    filtered_nfts = filtered_nfts[filtered_nfts["attributes"].apply(lambda x: x["type"] in filter_type)]

# Apply sorting
if sort_by == "Rarity Value (High to Low)":
    filtered_nfts = filtered_nfts.sort_values("rarity_value", ascending=False)
elif sort_by == "Level (High to Low)":
    filtered_nfts = filtered_nfts.sort_values("level", ascending=False)
elif sort_by == "Mint Date (Newest)":
    filtered_nfts = filtered_nfts.sort_values("mint_date", ascending=False)
elif sort_by == "Name (A-Z)":
    filtered_nfts = filtered_nfts.sort_values("name")

# Search functionality
search_query = st.text_input("Search by name or ID", "")
if search_query:
    filtered_nfts = filtered_nfts[
        filtered_nfts["name"].str.contains(search_query, case=False) | 
        filtered_nfts["id"].str.contains(search_query, case=False)
    ]
st.markdown('</div>', unsafe_allow_html=True)

# NFT Collection Stats
st.markdown("### Collection Statistics")
stats_col1, stats_col2, stats_col3, stats_col4 = st.columns(4)

with stats_col1:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.markdown("**Total NFTs**")
    st.markdown(f'<p class="metric-value">{len(filtered_nfts)}</p>', unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

with stats_col2:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.markdown("**Collection Value**")
    total_value = filtered_nfts["rarity_value"].sum()
    st.markdown(f'<p class="metric-value">{total_value} $FIXIE</p>', unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

with stats_col3:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.markdown("**Rarest NFT**")
    if not filtered_nfts.empty:
        rarest = filtered_nfts.loc[filtered_nfts["rarity_value"].idxmax()]
        st.markdown(f'<p class="metric-value {get_rarity_color(rarest["rarity"])}">{rarest["rarity"]}</p>', unsafe_allow_html=True)
    else:
        st.markdown('<p class="metric-value">N/A</p>', unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

with stats_col4:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.markdown("**Average Level**")
    if not filtered_nfts.empty:
        avg_level = filtered_nfts["level"].mean()
        st.markdown(f'<p class="metric-value">{avg_level:.1f}</p>', unsafe_allow_html=True)
    else:
        st.markdown('<p class="metric-value">N/A</p>', unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

# Rarity distribution chart
st.markdown("### Rarity Distribution")
if not filtered_nfts.empty:
    rarity_counts = filtered_nfts["rarity"].value_counts().reset_index()
    rarity_counts.columns = ["Rarity", "Count"]
    
    # Define custom order for rarities
    rarity_order = ["Common", "Uncommon", "Rare", "Epic", "Legendary"]
    rarity_counts["Rarity"] = pd.Categorical(rarity_counts["Rarity"], categories=rarity_order, ordered=True)
    rarity_counts = rarity_counts.sort_values("Rarity")
    
    # Custom colors for rarities
    rarity_colors = {
        "Common": "#6c757d",
        "Uncommon": "#28a745",
        "Rare": "#007bff",
        "Epic": "#6f42c1",
        "Legendary": "#FF5A5F"
    }
    
    fig = px.bar(
        rarity_counts,
        x="Rarity",
        y="Count",
        color="Rarity",
        color_discrete_map=rarity_colors,
        title="NFT Rarity Distribution"
    )
    fig.update_layout(xaxis_title="Rarity", yaxis_title="Number of NFTs")
    st.plotly_chart(fig, use_container_width=True)
else:
    st.info("No NFTs match your current filters.")

# Detailed view for selected NFT
if "selected_nft" not in st.session_state:
    st.session_state.selected_nft = None

def view_nft_details(nft_id):
    st.session_state.selected_nft = nft_id

# Grid display of NFTs
st.markdown("### Your NFT Collection")

# Check if there are NFTs to display
if filtered_nfts.empty:
    st.warning("No NFTs match your current filters. Try adjusting your search criteria.")
else:
    # Determine number of columns (responsive based on number of NFTs)
    num_cols = 4 if len(filtered_nfts) >= 4 else len(filtered_nfts)
    cols = st.columns(num_cols)
    
    # Display NFTs in grid
    for i, (_, nft) in enumerate(filtered_nfts.iterrows()):
        col_idx = i % num_cols
        with cols[col_idx]:
            # NFT Card
            st.markdown(f'<div class="nft-card" id="nft-{nft["id"]}">', unsafe_allow_html=True)
            st.image(nft["image_url"], use_column_width=True)
            st.markdown(f"**{nft['name']}**")
            st.markdown(f'<span class="{get_rarity_color(nft["rarity"])}">{nft["rarity"]}</span> • Level {nft["level"]}', unsafe_allow_html=True)
            
            # Action buttons
            col1, col2 = st.columns(2)
            with col1:
                if st.button(f"Details", key=f"details_{nft['id']}"):
                    view_nft_details(nft["id"])
            with col2:
                st.button(f"Equip", key=f"equip_{nft['id']}")
            
            st.markdown('</div>', unsafe_allow_html=True)
            st.markdown("---")

# Display detailed view if an NFT is selected
if st.session_state.selected_nft:
    selected_nft_data = filtered_nfts[filtered_nfts["id"] == st.session_state.selected_nft].iloc[0]
    
    st.markdown('<div class="detail-view">', unsafe_allow_html=

