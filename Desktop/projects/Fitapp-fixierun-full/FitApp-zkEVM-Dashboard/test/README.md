# FitApp zkEVM Dashboard - Testing Architecture

This document describes the testing architecture for the FitApp zkEVM Dashboard application, covering both smart contract testing and frontend testing.

## Table of Contents

1. [Overview](#overview)
2. [Smart Contract Tests](#smart-contract-tests)
3. [Frontend Tests](#frontend-tests)
4. [Running Tests](#running-tests)
5. [Extending the Test Suite](#extending-the-test-suite)

## Overview

The FitApp zkEVM Dashboard uses a comprehensive testing strategy to ensure both the smart contracts and frontend application work correctly. The testing architecture is divided into two main parts:

1. **Smart Contract Tests**: Uses Hardhat and Ethers.js to test Solidity smart contracts
2. **Frontend Tests**: Uses Jest and React Testing Library to test React components, hooks, and pages

## Smart Contract Tests

Smart contract tests are located in the `test/` directory and use Hardhat's testing framework with Chai assertions.

### Test Files

- **HealthCoin.test.ts**: Tests the ERC20 token functionality
- **AchievementTracker.test.ts**: Tests the achievement and rewards system
- **ProfileManager.test.ts**: Tests user profile management and fitness data tracking

### Testing Approach

The smart contract tests follow this structure:

1. **Setup**: Deploy contracts and set up test accounts
2. **Unit Tests**: Test individual contract functions
3. **Integration Tests**: Test interactions between contracts
4. **Edge Cases**: Test boundary conditions and error cases

Each test file contains multiple test cases to verify the functionality of the smart contracts under different conditions.

## Frontend Tests

Frontend tests are located in the `frontend/__tests__/` directory and use Jest with React Testing Library.

### Directory Structure

- `frontend/__tests__/components/`: Tests for React UI components
- `frontend/__tests__/hooks/`: Tests for custom React hooks
- `frontend/__tests__/pages/`: Tests for page components

### Test Files

- **ProfileCard.test.tsx**: Tests the user profile card component
- **useWallet.test.tsx**: Tests the wallet connection hook
- **Dashboard.test.tsx**: Tests the main dashboard page

### Testing Approach

The frontend tests follow these patterns:

1. **Component Tests**: Test rendering and UI interactions
2. **Hook Tests**: Test custom React hooks with renderHook
3. **Integration Tests**: Test pages that combine multiple components
4. **Mocking**: Mock blockchain interactions for deterministic testing

Tests use data-testid attributes for stable component selection and mock the wallet/blockchain functionality to test without a real blockchain connection.

## Running Tests

### Smart Contract Tests

To run the smart contract tests:

```bash
# Run all smart contract tests
npx hardhat test

# Run a specific test file
npx hardhat test test/HealthCoin.test.ts
```

### Frontend Tests

To run the frontend tests:

```bash
# Navigate to the frontend directory
cd frontend

# Run all frontend tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run a specific test file
npm test -- components/ProfileCard.test.tsx
```

## Extending the Test Suite

### Adding Smart Contract Tests

1. Create a new test file in the `test/` directory
2. Import the required dependencies:
   ```typescript
   import { expect } from "chai";
   import { ethers } from "hardhat";
   ```
3. Use `describe` blocks to organize tests
4. Use `beforeEach` for setup code
5. Write test cases using `it` functions

### Adding Frontend Tests

1. Create a new test file in the appropriate directory under `frontend/__tests__/`
2. Import required testing utilities:
   ```typescript
   import { render, screen, fireEvent } from '@testing-library/react';
   import '@testing-library/jest-dom';
   ```
3. Mock external dependencies as needed
4. Test component rendering and interactions
5. Use async/await with `waitFor` for testing asynchronous behavior

### Best Practices

1. **Test Independence**: Each test should be independent of others
2. **Mock External Systems**: Use mocks for APIs, blockchain, etc.
3. **Test Real User Flows**: Focus on testing user journeys
4. **Coverage**: Aim for high test coverage of critical paths
5. **Descriptive Names**: Use clear test names that describe the behavior being tested

By following these patterns, you can maintain and extend the test suite to ensure the application remains robust as new features are added.

