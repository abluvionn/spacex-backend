export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'services/**/*.js',
    '!**/node_modules/**',
  ],
  testPathIgnorePatterns: ['/node_modules/'],
};
