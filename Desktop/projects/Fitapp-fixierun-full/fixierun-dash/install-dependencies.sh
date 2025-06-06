#!/bin/bash

echo "🚀 Installing Fixie.Run Dependencies..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing npm dependencies..."

# Install all dependencies
npm install

# Install additional development tools
echo "🛠️ Installing development tools..."
npm install -D @types/node@latest @types/react@latest @types/react-dom@latest

# Install missing Radix UI components
echo "🎨 Installing UI components..."
npm install @radix-ui/react-accordion@latest
npm install @radix-ui/react-alert-dialog@latest
npm install @radix-ui/react-avatar@latest
npm install @radix-ui/react-checkbox@latest
npm install @radix-ui/react-collapsible@latest
npm install @radix-ui/react-context-menu@latest
npm install @radix-ui/react-dialog@latest
npm install @radix-ui/react-dropdown-menu@latest
npm install @radix-ui/react-hover-card@latest
npm install @radix-ui/react-label@latest
npm install @radix-ui/react-menubar@latest
npm install @radix-ui/react-navigation-menu@latest
npm install @radix-ui/react-popover@latest
npm install @radix-ui/react-progress@latest
npm install @radix-ui/react-radio-group@latest
npm install @radix-ui/react-scroll-area@latest
npm install @radix-ui/react-select@latest
npm install @radix-ui/react-separator@latest
npm install @radix-ui/react-sheet@latest
npm install @radix-ui/react-slider@latest
npm install @radix-ui/react-slot@latest
npm install @radix-ui/react-switch@latest
npm install @radix-ui/react-tabs@latest
npm install @radix-ui/react-toast@latest
npm install @radix-ui/react-toggle@latest
npm install @radix-ui/react-toggle-group@latest
npm install @radix-ui/react-tooltip@latest

# Install additional utilities
echo "⚡ Installing additional utilities..."
npm install class-variance-authority@latest
npm install clsx@latest
npm install tailwind-merge@latest
npm install tailwindcss-animate@latest

# Install Web3 and blockchain dependencies
echo "🔗 Installing Web3 dependencies..."
npm install web3@latest
npm install @web3modal/wagmi@latest
npm install wagmi@latest
npm install viem@latest

# Install database dependencies
echo "🗄️ Installing database dependencies..."
npm install @neondatabase/serverless@latest

# Install theme and internationalization dependencies
echo "🌍 Installing theme and i18n dependencies..."
npm install next-themes@latest

# Install icon library
echo "🎯 Installing icon library..."
npm install lucide-react@latest

# Install Next.js 15 and React 18
echo "⚛️ Installing Next.js 15 and React 18..."
npm install next@15.0.0
npm install react@^18.2.0 react-dom@^18.2.0

# Install TypeScript
echo "📝 Installing TypeScript..."
npm install -D typescript@latest

# Install ESLint and Prettier
echo "🔍 Installing linting tools..."
npm install -D eslint@latest eslint-config-next@15.0.0
npm install -D prettier@latest eslint-config-prettier@latest eslint-plugin-prettier@latest

# Install PostCSS and Autoprefixer
echo "🎨 Installing CSS tools..."
npm install -D postcss@latest autoprefixer@latest

# Install Tailwind CSS
echo "💨 Installing Tailwind CSS..."
npm install -D tailwindcss@latest

# Verify installation
echo "✅ Verifying installation..."
npm list --depth=0

echo ""
echo "🎉 All dependencies installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Start building your Fixie.Run app!"
echo ""
echo "🔧 Available scripts:"
echo "  npm run dev     - Start development server"
echo "  npm run build   - Build for production"
echo "  npm run start   - Start production server"
echo "  npm run lint    - Run ESLint"
echo ""
