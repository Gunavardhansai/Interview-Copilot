// jest.config.ts

import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  detectOpenHandles: true,

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  transform: {
    "^.+\\.ts$": "ts-jest",
  },

  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
};

export default config;