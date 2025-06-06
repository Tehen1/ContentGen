import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import random
import json
from PIL import Image
import time

# Page configuration
st.set_page_config(
    page_title="FixieRun - Earnings",
    page_icon="💰",
    layout="wide"
)

# Check authentication status (from main app)
if 'authenticated' not in st.session_state or not st.session_state.authenticated:
    st.warning("Please login from the main page to access your earnings dashboard.")
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
    .metric-subtitle {
        font-size: 0.9rem;
        color: #666;
    }
    .token-card {
        background-color: #2d3436;
        color: white;
        border-radius: 15px;
        padding: 25px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        background-image: linear-gradient(135deg, #2d3436 0%, #4a5568 100%);
    }
    .token-balance {
        font-size: 3rem;
        font-weight: 700;
        color: #ffd700;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    .token-label {
        font-size: 1.1rem;
        color: #ddd;
        margin-bottom: 10px;
    }
    .token-address {
        font-family: monospace;
        font-size: 0.9rem;
        color: #ddd;
        background-color: rgba(0, 0, 0, 0.2);
        padding: 5px 10px;
        border-radius: 5px;
        margin-top: 15px;
    }
    .breakdown-card {
        background-color: #f7f7f7;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .filter-container {
        background-color: #f0f0f0;
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 20px;
    }
    .stButton>button {
        background-color: #FF5A5F;
        color: white;
        border-radius: 5px;
        border: none;
        padding: 8px 16px;
    }
    .stButton>button:hover {
        background-color: #FF4046;
    }
    div[data-testid="stHorizontalBlock"] {
        gap: 10px;
    }
    input[type="text"], input[type="number"] {
        border-radius: 5px !important;
        border: 1px solid #ddd !important;
    }
    .withdraw-card {
        background-color: #f7f7f7;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-top: 20px;
    }
    .stProgress > div > div {
        background-color: #FF5A5F;
    }
</style>
""", unsafe_allow_html=True)

# Generate sample token earnings data
@st.cache_data
def generate_token_data():
    # Current timestamp
    now = datetime.now()
    
    # Generate daily token history for the past 180 days
    dates = [now - timedelta(days=i) for i in range(180)]
    dates.reverse()  # Oldest to newest
    
    # Initial balance
    initial_balance = 0
    
    # Sources of tokens
    sources = ["Cycling Activity", "Referral Bonus", "Challenge Reward", "Staking Reward", "NFT Boost"]
    source_weights = [0.7, 0.1, 0.1, 0.05, 0.05]  # Probability weights
    
    # Token price fluctuation (simulating market value)
    base_token_price = 0.05  # Base price in USD
    token_prices = []
    price = base_token_price
    
    # Generate token transactions
    transactions = []
    daily_balances = []
    running_balance = initial_balance
    
    for date in dates:
        # Random token price fluctuation
        price_change = np.random.normal(0, 0.001)  # Small random changes
        price = max(0.01, price * (1 + price_change))  # Ensure minimum price
        token_prices.append(price)
        
        # Random number of transactions per day (0-3)
        num_transactions = np.random.choice([0, 1, 2, 3], p=[0.3, 0.4, 0.2, 0.1])
        
        daily_earned = 0
        daily_spent = 0
        
        for _ in range(num_transactions):
            is_earning = random.random() < 0.85  # 85% are earnings, 15% are spending
            
            if is_earning:
                # Earning transaction
                source = np.random.choice(sources, p=source_weights)
                
                # Amount depends on source
                if source == "Cycling Activity":
                    amount = round(random.uniform(1, 10), 2)
                elif source == "Challenge Reward":
                    amount = round(random.uniform(10, 50), 2)
                elif source == "Referral Bonus":
                    amount = round(random.uniform(5, 20), 2)
                elif source == "Staking Reward":
                    amount = round(running_balance * random.uniform(0.001, 0.003), 2)  # 0.1-0.3% of balance
                else:  # NFT Boost
                    amount = round(random.uniform(0.5, 3), 2)
                
                daily_earned += amount
                running_balance += amount
                
                transactions.append({
                    "date": date,
                    "timestamp": date.strftime("%Y-%m-%d %H:%M:%S"),
                    "type": "Earning",
                    "source": source,
                    "amount": amount,
                    "balance_after": running_balance,
                    "token_price_usd": price,
                    "value_usd": amount * price,
                    "tx_hash": f"0x{random.getrandbits(160):040x}"
                })
            else:
                # Spending transaction
                if running_balance > 0:
                    amount = round(min(running_balance * random.uniform(0.05, 0.2), running_balance), 2)
                    source = random.choice(["NFT Purchase", "Merchandise", "Token Transfer"])
                    
                    daily_spent += amount
                    running_balance -= amount
                    
                    transactions.append({
                        "date": date,
                        "timestamp": date.strftime("%Y-%m-%d %H:%M:%S"),
                        "type": "Spending",
                        "source": source,
                        "amount": -amount,
                        "balance_after": running_balance,
                        "token_price_usd": price,
                        "value_usd": amount * price,
                        "tx_hash": f"0x{random.getrandbits(160):040x}"
                    })
        
        # Record daily balance
        daily_balances.append({
            "date": date,
            "balance": running_balance,
            "earned": daily_earned,
            "spent": daily_spent,
            "token_price_usd": price,
            "value_usd": running_balance * price
        })
    
    # Create DataFrames
    transactions_df = pd.DataFrame(transactions)
    balances_df = pd.DataFrame(daily_balances)
    
    # Current token stats
    current_stats = {
        "balance": running_balance,
        "token_price": price,
        "value_usd": running_balance * price,
        "earned_30d": balances_df.tail(30)["earned"].sum(),
        "earned_7d": balances_df.tail(7)["earned"].sum(),
        "earnings_trend": balances_df.tail(7)["earned"].sum() / balances_df.tail(14).head(7)["earned"].sum() - 1
    }
    
    return transactions_df, balances_df, current_stats

# Main page header
st.markdown('<p class="main-header">$FIXIE Earnings</p>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">Track and manage your token earnings</p>', unsafe_allow_html=True)

# Generate sample data
transactions_df, balances_df, current_stats = generate_token_data()

# Token balance card
st.markdown('<div class="token-card">', unsafe_allow_html=True)
col1, col2 = st.columns([2, 1])

with col1:
    st.markdown('<p class="token-label">Current Balance</p>', unsafe_allow_html=True)
    st.markdown(f'<p class="token-balance">{current_stats["balance"]:.2f} $FIXIE</p>', unsafe_allow_html=True)
    st.markdown(f'<p class="token-label">≈ ${current_stats["value_usd"]:.2f} USD</p>', unsafe_allow_html=True)
    
    # Token address
    st.markdown(f'<p class="token-address">Contract: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e</p>', unsafe_allow_html=True)

with col2:
    st.markdown(f'<p class="token-label">Last 7 Days</p>', unsafe_allow_html=True)
    st.markdown(f'<p class="token-balance">+{current_stats["earned_7d"]:.2f}</p>', unsafe_allow_html=True)
    
    # Trend indicator
    trend_emoji = "📈" if current_stats["earnings_trend"] > 0 else "📉"
    trend_color = "#28a745" if current_stats["earnings_trend"] > 0 else "#dc3545"
    trend_percentage = abs(current_stats["earnings_trend"] * 100)
    
    st.markdown(f'<p class="token-label" style="color: {trend_color}">{trend_emoji} {trend_percentage:.1f}% vs previous week</p>', unsafe_allow_html=True)

st.markdown('</div>', unsafe_allow_html=True)

# Tabs for different sections
tab1, tab2, tab3 = st.tabs(["Earnings Analysis", "Transaction History", "Token Management"])

with tab1:
    st.markdown("### Earnings Breakdown")
    
    # Time period selector
    time_periods = {
        "Last 7 days": 7,
        "Last 30 days": 30,
        "Last 90 days": 90,
        "All time": len(balances_df)
    }
    
    selected_period = st.selectbox("Select time period", list(time_periods.keys()))
    days = time_periods[selected_period]
    
    # Filter data based on time period
    filtered_transactions = transactions_df.tail(days).copy()
    filtered_balances = balances_df.tail(days).copy()
    
    # Earnings by source (donut chart)
    earnings_by_source = filtered_transactions[filtered_transactions["type"] == "Earning"].groupby("source")["amount"].sum().reset_index()
    
    if not earnings_by_source.empty:
        fig_sources = px.pie(
            earnings_by_source,
            values="amount",
            names="source",
            title=f"Earnings by Source ({selected_period})",
            hole=0.4,
            color_discrete_sequence=px.colors.qualitative.Bold
        )
        fig_sources.update_traces(textposition='inside', textinfo='percent+label')
        st.plotly_chart(fig_sources, use_container_width=True)
    
    # Daily earnings chart
    daily_earnings = filtered_balances.groupby(filtered_balances["date"].dt.date)[["earned", "spent"]].sum().reset_index()
    daily_earnings["net"] = daily_earnings["earned"] - daily_earnings["spent"]
    
    fig_daily = go.Figure()
    
    fig_daily.add_trace(go.Bar(
        x=daily_earnings["date"],
        y=daily_earnings["earned"],
        name="Earned",
        marker_color="#28a745"
    ))
    
    fig_daily.add_trace(go.Bar(
        x=daily_earnings["date"],
        y=-daily_earnings["spent"],
        name="Spent",
        marker_color="#dc3545"
    ))
    
    fig_daily.add_trace(go.Scatter(
        x=daily_earnings["date"],
        y=daily_earnings["net"],
        name="Net",
        mode="lines+markers",
        line=dict(color="#FF5A5F", width=3)
    ))
    
    fig_daily.update_layout(
        title=f"Daily Token Flow ({selected_period})",
        xaxis_title="Date",
        yaxis_title="$FIXIE Tokens",
        barmode="relative",
        hovermode="x unified"
    )
    
    st.plotly_chart(fig_daily, use_container_width=True)
    
    # Token price chart
    fig_price = px.line(
        filtered_balances,
        x="date",
        y="token_price_usd",
        title=f"$FIXIE Token Price (USD)",
        labels={"date": "Date", "token_price_usd": "Price (USD)"}
    )
    fig_price.update_traces(line_color="#ffd700", line_width=2)
    
    # Portfolio value chart
    fig_value = px.line(
        filtered_

