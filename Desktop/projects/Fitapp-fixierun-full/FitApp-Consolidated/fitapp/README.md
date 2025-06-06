# FitApp - Fitness Data Analysis and Web3 Integration

## Overview
FitApp is a React-based web application that allows users to visualize and analyze their fitness data while incorporating Web3 functionality. The application provides a dashboard for viewing fitness metrics, activity maps, and integrates with blockchain wallets.

## Features
- Fitness data visualization (steps, calories, distance)
- Interactive maps showing activity locations
- Web3 wallet integration
- Activity history and statistics

## Technologies Used
- React
- TypeScript
- Vite
- Ethers.js for Web3 integration
- Mapbox GL for map visualization
- Docker for containerization

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask extension (for Web3 functionality)

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fitapp.git
   cd fitapp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a .env file in the project root and add:
   ```
   VITE_MAPBOX_TOKEN='your_mapbox_token'
   VITE_API_URL='http://localhost:8000'
   VITE_CONTRACT_ADDRESSES='{"token":"0x...","nft":"0x..."}'
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Building for Production
1. Build the application:
   ```
   npm run build
   ```

2. Preview the production build:
   ```
   npm run preview
   ```

## Docker Deployment
1. Build the Docker image:
   ```
   docker-compose build
   ```

2. Run the container:
   ```
   docker-compose up
   ```

## License
MIT
