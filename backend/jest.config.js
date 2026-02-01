// jest.config.js
export default {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/src/tests/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/server.js", "!src/tests/**"],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  testTimeout: 30000,
  detectOpenHandles: true,
};
