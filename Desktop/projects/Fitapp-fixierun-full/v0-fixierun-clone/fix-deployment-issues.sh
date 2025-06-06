#!/bin/bash

# Install ts-node if not already installed
if ! command -v ts-node &> /dev/null; then
  echo "Installing ts-node..."
  npm install -g ts-node typescript
fi

# Run the fix-all-issues script
echo "Running fix-all-issues script..."
npx ts-node scripts/fix-all-issues.ts

echo "Deployment issues fixed!"
