# FixieRun Application

A blockchain-based Move-to-Earn (M2E) fitness application targeting cyclists, similar to the Zipline model. The platform rewards users with crypto tokens for physical activities, featuring NFT bikes that evolve based on usage, and implements a robust reward system verified through zero-knowledge proofs.

## Environment Configuration

### Required Environment Variables

The application requires the following environment variables to be set:

| Variable | Description | Required | Format | Example |
|----------|-------------|----------|--------|---------|
| `MAPBOX_TOKEN` | Mapbox API token for map functionality | Yes | String | `pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2t4YW1wbGV9.ZXhhbXBsZWtleQ==` |
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://[user]:[password]@[host]:[port]/[database]` | `postgresql://user:password@localhost:5432/fixierun` |
| `NODE_ENV` | Environment mode | No | `development`, `production`, or `test` | `development` |

### Environment-Specific Configurations

#### Production Environment

In production, additional security measures are enforced:

- `DATABASE_URL` must include SSL mode (`?sslmode=require`)
- All required environment variables must be set

#### Development Environment

For local development:

1. Copy `.env.local.example` to `.env.local`
2. Fill in the required environment variables
3. Run `npm run dev` to start the development server

#### Test Environment

For running tests:

1. Environment variables are mocked in `jest.setup.js`
2. No actual external services are called during tests

### Setting Up Your Environment

1. **Local Development**:
   \`\`\`bash
   # Copy example env file
   cp .env.local.example .env.local
   
   # Edit the file with your values
   nano .env.local
   
   # Start development server
   npm run dev
   \`\`\`

2. **Production Deployment**:
   - Set environment variables in your hosting platform (Vercel, Netlify, etc.)
   - Ensure all required variables are set with proper values
   - The build process will validate your environment configuration

### Validating Environment Configuration

You can manually validate your environment configuration by running:

\`\`\`bash
npm run validate-env
\`\`\`

This will check for:
- Missing required variables
- Invalid formats
- Environment-specific requirements

## Menu Structure

The application's menu is organized into two main categories:

### FixieRun
- Dashboard
- Activity
- Live Tracking
- Activity Import
- Run Map

### Community
- Connected Accounts
- NFT Gallery
- Marketplace
- Profile
- Leaderboard
- Settings

## Menu Structure Review Process

The menu structure is reviewed regularly to ensure it remains intuitive and efficient. The review process includes:

1. **Quarterly Reviews**:
   - Analyze user navigation patterns
   - Review feature usage statistics
   - Identify potential improvements

2. **User Feedback Collection**:
   - In-app feedback mechanisms
   - User surveys
   - Support ticket analysis

3. **Implementation of Changes**:
   - Document proposed changes
   - Test changes with a sample user group
   - Roll out changes with clear communication

4. **Post-Implementation Analysis**:
   - Monitor user adaptation
   - Collect feedback on changes
   - Make adjustments as needed

## Development Workflow

1. **Setup Environment**:
   - Configure environment variables
   - Install dependencies
   - Run validation

2. **Development**:
   - Write code
   - Run tests
   - Validate environment

3. **Testing**:
   - Unit tests
   - Integration tests
   - End-to-end tests

4. **Deployment**:
   - Environment validation
   - Build
   - Deploy

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
\`\`\`

Finally, let's create a document for the menu structure review process:
