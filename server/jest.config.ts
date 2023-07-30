/**
 * Jest Configuration File for TypeScript Tests
 */

import { Config } from "@jest/types";

// Define the base test directory.
const baseTestDir = "<rootDir>/test";

// Define the available test directories as an array of strings.
const availableDirs: Array<typeof process.env.TEST_DIR> = ["services", "infra"];
// Jest configuration object
const config: Config.InitialOptions = {
  // Use the "ts-jest" preset to enable TypeScript support.
  preset: "ts-jest",

  // Set the test environment to "node" for Node.js testing.
  testEnvironment: "node",

  // Ignore the test files that are executed by the debugger (non-jest tests).
  modulePathIgnorePatterns: [`${baseTestDir}/debugger`],

  // Define the test match patterns based on the TEST_DIR environment variable.
  testMatch: [
    // If no TEST_DIR environment variable specified or the value is invalid,
    // check for all test files in the entire test directory.
    `${baseTestDir}/${
      availableDirs.includes(process.env?.TEST_DIR) ? process.env.TEST_DIR : ""
    }**/*test.ts`,
  ],
};

// Export the Jest configuration object.
export default config;
