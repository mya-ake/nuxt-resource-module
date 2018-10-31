module.exports = {
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/tests/unit/**/*.spec.ts'],
  testURL: 'http://localhost/',
  setupFiles: ['<rootDir>/tests/fixtures/setup/index.ts'],
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: ['TS2722'],
      },
    },
  },
};
