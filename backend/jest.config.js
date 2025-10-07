// backend/jest.config.js
export default {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.js"],
  // Ignore the smoke test (that one is run with Node's built-in runner, not Jest)
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/src/tests/api.smoke.test.js",
  ],
  transform: {}, // no Babel needed
  verbose: true,
};
