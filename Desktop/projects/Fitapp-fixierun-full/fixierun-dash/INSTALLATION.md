# 🚀 Fixie.Run Installation Guide

This guide will help you install all the required dependencies for the Fixie.Run Move-to-Earn cycling platform.

## 📋 Prerequisites

Before installing Fixie.Run, make sure you have:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm 9+** or **yarn 1.22+** or **pnpm 8+**
- **Git** - [Download here](https://git-scm.com/)

## 🛠️ Quick Installation

### Option 1: Automated Installation (Recommended)

\`\`\`bash
# Make the installation script executable
chmod +x install-dependencies.sh

# Run the automated installation
./install-dependencies.sh
\`\`\`

### Option 2: Manual Installation

\`\`\`bash
# Install core dependencies
npm install

# Install all Radix UI components
npm install @radix-ui/react-accordion@latest \
  @radix-ui/react-dialog@latest \
  @radix-ui/react-dropdown-menu@latest \
  @radix-ui/react-label@latest \
  @radix-ui/react-progress@latest \
  @radix-ui/react-radio-group@latest \
  @radix-ui/react-select@latest \
  @radix-ui/react-separator@latest \
  @radix-ui/react-sheet@latest \
  @radix-ui/react-slider@latest \
  @radix-ui/react-slot@latest \
  @radix-ui/react-tabs@latest \
  @radix-ui/react-tooltip@latest

# Install utility libraries
npm install class-variance-authority@latest \
  clsx@latest \
  tailwind-merge@latest \
  tailwindcss-animate@latest

# Install Web3 dependencies
npm install web3@latest

# Install database dependencies
npm install @neondatabase/serverless@latest

# Install theme and UI dependencies
npm install next-themes@latest \
  lucide-react@latest

# Install development dependencies
npm install -D @types/node@latest \
  @types/react@latest \
  @types/react-dom@latest \
  autoprefixer@latest \
  eslint@latest \
  eslint-config-next@15.0.0 \
  postcss@latest \
  tailwindcss@latest \
  typescript@latest
\`\`\`

## ✅ Verify Installation

Run the verification script to check if all dependencies are installed correctly:

\`\`\`bash
node scripts/verify-installation.js
\`\`\`

## 📦 Package Overview

### Core Framework
- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety

### UI Components
- **Radix UI** - Headless UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **class-variance-authority** - Component variants

### Web3 & Blockchain
- **Web3.js** - Ethereum interaction
- **zkEVM** - Zero-knowledge Ethereum Virtual Machine

### Database
- **Neon** - Serverless PostgreSQL

### Theming & Internationalization
- **next-themes** - Theme switching
- **Custom i18n** - Multi-language support

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **PostCSS** - CSS processing

## 🚀 Getting Started

After installation, you can start the development server:

\`\`\`bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Type checking
npm run type-check
\`\`\`

## 🌍 Environment Setup

1. Copy the environment example file:
\`\`\`bash
cp .env.example .env
\`\`\`

2. Fill in your environment variables:
\`\`\`env
# Database
DATABASE_URL=your_neon_database_url

# Web3
NEXT_PUBLIC_CHAIN_ID=1101
NEXT_PUBLIC_ZKEVM_RPC_URL=https://rpc.public.zkevm-test.net

# NFT Contract Addresses (add after deployment)
NEXT_PUBLIC_RHYMECHAIN_NFT_ADDRESS=
NEXT_PUBLIC_RHYMECHAIN_MARKETPLACE_ADDRESS=
NEXT_PUBLIC_RHYMECHAIN_BATTLE_ADDRESS=

# Analytics
NEXT_PUBLIC_ANALYTICS_ENABLED=true
\`\`\`

## 🐳 Docker Setup (Optional)

For containerized development:

\`\`\`bash
# Make Docker setup script executable
chmod +x docker-setup.sh

# Run Docker setup
./docker-setup.sh
\`\`\`

## 🎨 Theme System

Fixie.Run includes 9 built-in themes:
- ☀️ Light
- 🌙 Dark  
- 💜 Cyberpunk
- 💚 Neon Green
- 💖 Retro Wave
- 💙 Midnight
- 🧡 Sunset
- ⚫ True Black
- ⚪ True White

## 🌍 Multi-Language Support

Supported languages:
- 🇺🇸 English
- 🇪🇸 Español
- 🇫🇷 Français
- 🇩🇪 Deutsch
- 🇯🇵 日本語
- 🇰🇷 한국어
- 🇨🇳 中文

## 🔧 Troubleshooting

### Common Issues

1. **Node.js version error**
   \`\`\`bash
   # Check Node.js version
   node --version
   # Should be 18.0.0 or higher
   \`\`\`

2. **npm permission errors**
   \`\`\`bash
   # Fix npm permissions
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   \`\`\`

3. **TypeScript errors**
   \`\`\`bash
   # Clear TypeScript cache
   rm -rf .next
   npm run type-check
   \`\`\`

4. **Dependency conflicts**
   \`\`\`bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   \`\`\`

### Getting Help

- 📖 [Documentation](./docs)
- 🐛 [Report Issues](https://github.com/fixierun/issues)
- 💬 [Discord Community](https://discord.gg/fixierun)
- 📧 [Support Email](mailto:support@fixierun.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy Cycling! 🚴‍♂️💨**
