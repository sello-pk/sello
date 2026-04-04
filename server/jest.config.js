/**
 * Jest configuration for server-side tests
 */
export default {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/tests/**/*.test.js", "**/__tests__/**/*.test.js"],
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/__tests__/**",
    "!**/scripts/**",
    "!jest.config.js",
    "!server.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "json", "html"],
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
