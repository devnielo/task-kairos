import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageDirectory: '<rootDir>/coverage',
  clearMocks: true,
};

export default config;
