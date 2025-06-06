#!/bin/bash

echo "Checking for existing SSH key..."

# Check if SSH key exists
if [ -f ~/.ssh/id_rsa.pub ]; then
    echo "Existing SSH key found:"
    cat ~/.ssh/id_rsa.pub
else
    echo "No SSH key found. Generating new SSH key..."
    ssh-keygen -t rsa -b 4096 -C "tehen.antony@protonmail.com"
    echo "\nNew SSH key generated:"
    cat ~/.ssh/id_rsa.pub
fi

echo "\nNext steps:"
echo "1. Copy the SSH key above"
echo "2. Go to https://github.com/settings/keys"
echo "3. Click 'New SSH key'"
echo "4. Paste your key and save"
echo "5. Create new repository at https://github.com/new"
echo "6. Use 'fitness-dashboard' as repository name"
echo "7. Copy the SSH repository URL"
echo "\nThen run:"
echo "git remote add origin git@github.com:tehen1/fitness-dashboard.git"
echo "git push -u origin master"

