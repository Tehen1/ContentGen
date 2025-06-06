#!/bin/bash
set -euo pipefail

# FixieRun Monorepo Setup Script
echo "🚴‍♂️ Setting up FixieRun Monorepo..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | sed 's/v//' | cut -d'.' -f1)
if (( NODE_VERSION < 18 )); then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) detected"

# Validate we're in the correct directory
if [ ! -f package.json ]; then
    print_error "package.json not found. Please run this script from the monorepo root directory."
    exit 1
fi

print_success "Found package.json - in correct directory"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_success "npm $(npm -v) detected"

# Install dependencies
print_status "Installing dependencies..."

if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating environment file..."
    cp .env.example .env
    print_warning "Please edit .env file with your configuration before running the application"
else
    print_warning ".env file already exists"
fi

# Build packages
print_status "Building packages..."

if npm run build; then
    print_success "Packages built successfully"
else
    print_error "Failed to build packages"
    exit 1
fi

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    if pgrep mongod > /dev/null; then
        print_success "MongoDB is running"
    else
        print_warning "MongoDB is installed but not running. Start it with: mongod"
    fi
else
    print_warning "MongoDB not found. Install MongoDB or use a cloud instance"
fi

# Check if Redis is running (optional)
if command -v redis-server &> /dev/null; then
    if pgrep redis-server > /dev/null; then
        print_success "Redis is running"
    else
        print_warning "Redis is installed but not running. Start it with: redis-server"
    fi
else
    print_warning "Redis not found. Install Redis or use a cloud instance"
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p apps/frontend/public/uploads
mkdir -p apps/backend/logs
mkdir -p packages/contracts/deployments

print_success "Directories created"

# Set up Git hooks (if .git exists)
if [ -d .git ]; then
    print_status "Setting up Git hooks..."
    
    # Create pre-commit hook
    if cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix the issues and try again."
    exit 1
fi

# Run type checking
npm run type-check
if [ $? -ne 0 ]; then
    echo "Type checking failed. Please fix the issues and try again."
    exit 1
fi

echo "Pre-commit checks passed!"
EOF
    then
        chmod +x .git/hooks/pre-commit
        print_success "Git hooks set up"
    else
        print_error "Failed to create Git hooks"
        exit 1
    fi
fi

# Display next steps
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start MongoDB and Redis (if using locally)"
echo "3. Run 'npm run dev' to start development servers"
echo ""
echo "🔗 Useful commands:"
echo "  npm run dev          - Start all development servers"
echo "  npm run build        - Build all packages"
echo "  npm run lint         - Run linting"
echo "  npm run test         - Run tests"
echo ""
echo "📚 Documentation:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:4000"
echo "  GraphQL:  http://localhost:4000/graphql"
echo ""
echo "Happy coding! 🚴‍♂️💨"