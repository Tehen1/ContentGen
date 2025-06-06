module.exports = {
  roots: [
    "<rootDir>/src",
    "<rootDir>/test"
  ],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx"
  ],
  coverageDirectory: "coverage",
  testEnvironment: "node"
};