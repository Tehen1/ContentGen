"""
Fixie.Run - A toolkit for adapting cycling analytics with blockchain integration on zkEVM.

This package provides tools to transform standard cycling analysis reports
into privacy-preserving, blockchain-integrated formats with token rewards.
"""

__version__ = "0.1.0"
__author__ = "Fixie.Run Team"
__email__ = "dev@fixie.run"

from pathlib import Path

# Import core components for easier access
from fixie_run.core.rewards import ActivityData, RewardBreakdown, calculate_rewards
from fixie_run.core.blockchain import BlockchainClient

# Define package base path
PACKAGE_DIR = Path(__file__).resolve().parent