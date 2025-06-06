# Fixie.Run

Privacy-first cycling rewards on zkEVM blockchain.

## Overview

Fixie.Run is a toolkit for adapting cycling activity reports with blockchain integration on zkEVM. 
It transforms standard cycling analysis reports into privacy-preserving, blockchain-integrated reports with token rewards.

Key features:
- **Privacy-Preserving Analytics**: Generate zero-knowledge proofs of cycling activities
- **Token Rewards**: Calculate and distribute FIXIE tokens based on cycling performance
- **Enhanced Visualizations**: Brand and adapt cycling visualizations
- **Web Interface**: Generate a responsive web interface to display reports and rewards
- **zkEVM Integration**: Connect with the zkEVM blockchain for token transactions

## Installation

```bash
# Create a virtual environment
python -m venv .venv
source .venv/bin/activate  # Unix/macOS
# or
.\.venv\Scripts\activate  # Windows

# Install the package
pip install -e .

# For development
pip install -e ".[dev]"
```

## Usage

### Command Line Interface

```bash
# Run with default settings
fixie-run

# Specify custom directories
fixie-run --input-dir /path/to/cycling_data --output-dir /path/to/output

# Disable blockchain integration
fixie-run --no-blockchain

# Display help
fixie-run --help
```

### Environment Variables

Configure the application by setting environment variables or using a `.env` file:

```
# Input/Output Paths
FIXIE_INPUT_DIR=cycling_analysis_results
FIXIE_OUTPUT_DIR=fixie_run_output

# Reward Settings
FIXIE_REWARD_BASE=10.0
FIXIE_REWARD_DISTANCE_RATE=0.5

# Blockchain Settings
FIXIE_BLOCKCHAIN_ENABLED=True
FIXIE_BLOCKCHAIN_RPC_URL=https://zkevm-rpc.com
```

See `.env.example` for all available configuration options.

## Development

### Directory Structure

```
fixie_run/
├── __init__.py
├── config/             # Configuration settings
├── core/               # Core business logic
├── adapters/           # Data transformation
├── web/                # HTML generation
├── tests/              # Test suite
└── main.py             # Entry point
```

### Testing

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=fixie_run
```

### Code Quality

```bash
# Format code
black fixie_run

# Sort imports
isort fixie_run

# Type checking
mypy fixie_run

# Linting
flake8 fixie_run
```

## License

MIT Licens