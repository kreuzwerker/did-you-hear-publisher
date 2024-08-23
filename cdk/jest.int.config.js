module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.int.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
