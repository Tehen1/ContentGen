#!/bin/bash

echo "Starting deployment process..."

# Check Python version
python3 --version || { echo "Python3 is required but not installed. Aborting."; exit 1; }

# Create and activate virtual environment
echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate || { echo "Failed to activate virtual environment. Aborting."; exit 1; }

# Install/upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt || { echo "Failed to install dependencies. Aborting."; exit 1; }

# Run tests
echo "Running tests..."
pytest test_dashboard.py || { echo "Tests failed. Aborting deployment."; exit 1; }

# Build and package application
echo "Building application..."
python setup.py build || { echo "Build failed. Aborting."; exit 1; }

# Deploy based on environment
if [ "$DEPLOYMENT_ENV" = "production" ]; then
    echo "Deploying to production..."
    # Add production deployment commands here
elif [ "$DEPLOYMENT_ENV" = "staging" ]; then
    echo "Deploying to staging..."
    # Add staging deployment commands here
else
    echo "Deploying to development..."
    # Add development deployment commands here
fi

# Start application
echo "Starting application..."
streamlit run dashboard_final.py

echo "Deployment complete!"

