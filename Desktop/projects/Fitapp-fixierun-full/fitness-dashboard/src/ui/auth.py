import streamlit as st
import config
from utils import validate_password
import hashlib

def authentication_page():
    """Authentication page with login form and session management"""
    st.title("🔒 Fitness Dashboard Authentication")

    with st.form("auth_form"):
        username = st.text_input("Username", placeholder="Enter admin username")
        password = st.text_input("Password", type="password", placeholder="Enter admin password")
        submitted = st.form_submit_button("Login")

        if submitted:
            if validate_credentials(username, password):
                st.session_state.authenticated = True
                st.session_state.user = username
                st.experimental_rerun()
            else:
                st.error("Invalid credentials - Please verify username/password")

def validate_credentials(username: str, password: str) -> bool:
    """Validate credentials against environment config"""
    try:
        expected_hash = hashlib.sha256(
            (config.ADMIN_USER + config.ADMIN_PASSWORD).encode()
        ).hexdigest()
        input_hash = hashlib.sha256(
            (username + password).encode()
        ).hexdigest()
        return input_hash == expected_hash
    except AttributeError:
        st.error("Missing authentication configuration")
        return False