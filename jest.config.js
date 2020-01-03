module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  testEnvironment: 'node',
  transform: {
    '^.+\.ts?$': 'ts-jest'
  },
  setupFiles: ['./tests/setup.ts'],
  verbose: true,
  globals: {
    "ts-jest": {
      tsConfig: './tsconfig.test.json',
    }
  }
};
