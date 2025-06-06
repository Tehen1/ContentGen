"""
Configuration settings for the Fixie.Run application.
Values are loaded from environment variables with sensible defaults.
"""

import os
from pathlib import Path
from typing import Dict, Any

# Base directories - use Path for cross-platform compatibility
BASE_DIR = Path(__file__).resolve().parent.parent.parent
INPUT_DIR = Path(os.environ.get("FIXIE_INPUT_DIR", "cycling_analysis_results"))
OUTPUT_DIR = Path(os.environ.get("FIXIE_OUTPUT_DIR", "fixie_run_output"))

# Ensure input directory is absolute
if not INPUT_DIR.is_absolute():
    INPUT_DIR = BASE_DIR / INPUT_DIR

# Ensure output directory is absolute
if not OUTPUT_DIR.is_absolute():
    OUTPUT_DIR = BASE_DIR / OUTPUT_DIR

# File names
REPORT_FILENAME = os.environ.get("FIXIE_REPORT_FILENAME", "cycling_report.md")
OUTPUT_REPORT_FILENAME = os.environ.get("FIXIE_OUTPUT_REPORT_FILENAME", "fixie_report.md")
LANDING_PAGE_FILENAME = os.environ.get("FIXIE_LANDING_PAGE_FILENAME", "index.html")

# Visualization file mapping
VISUALIZATION_MAPPING: Dict[str, str] = {
    "cycling_distance_distribution.png": "fixie_distance.png",
    "cycling_by_day.png": "fixie_days.png",
    "cycling_by_hour.png": "fixie_hours.png",
    "cycling_day_hour_heatmap.png": "fixie_heatmap.png",
    "cycling_routes_map.html": "fixie_routes.html"
}

# Reward parameters
REWARD_BASE = float(os.environ.get("FIXIE_REWARD_BASE", "10.0"))
REWARD_DISTANCE_RATE = float(os.environ.get("FIXIE_REWARD_DISTANCE_RATE", "0.5"))
REWARD_TIME_RATE = float(os.environ.get("FIXIE_REWARD_TIME_RATE", "2.0"))
WEEKLY_CHALLENGE_THRESHOLD = float(os.environ.get("FIXIE_WEEKLY_CHALLENGE_THRESHOLD", "20.0"))
WEEKLY_CHALLENGE_BONUS = float(os.environ.get("FIXIE_WEEKLY_CHALLENGE_BONUS", "15.0"))

# zkEVM Blockchain settings
BLOCKCHAIN_ENABLED = os.environ.get("FIXIE_BLOCKCHAIN_ENABLED", "False").lower() == "true"
BLOCKCHAIN_RPC_URL = os.environ.get("FIXIE_BLOCKCHAIN_RPC_URL", "")
TOKEN_CONTRACT_ADDRESS = os.environ.get("FIXIE_TOKEN_CONTRACT_ADDRESS", "")

def get_settings() -> Dict[str, Any]:
    """Get all application settings as a dictionary."""
    return {
        "input_dir": INPUT_DIR,
        "output_dir": OUTPUT_DIR,
        "report_filename": REPORT_FILENAME,
        "output_report_filename": OUTPUT_REPORT_FILENAME,
        "landing_page_filename": LANDING_PAGE_FILENAME,
        "visualization_mapping": VISUALIZATION_MAPPING,
        "reward_base": REWARD_BASE,
        "reward_distance_rate": REWARD_DISTANCE_RATE,
        "reward_time_rate": REWARD_TIME_RATE,
        "weekly_challenge_threshold": WEEKLY_CHALLENGE_THRESHOLD,
        "weekly_challenge_bonus": WEEKLY_CHALLENGE_BONUS,
        "blockchain_enabled": BLOCKCHAIN_ENABLED,
        "blockchain_rpc_url": BLOCKCHAIN_RPC_URL,
        "token_contract_address": TOKEN_CONTRACT_ADDRESS,
    }