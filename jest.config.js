// https://jestjs.io/docs/en/configuration.html
// eslint-disable-next-line import/no-commonjs
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  verbose: true,
  collectCoverage: true,
  coverageDirectory: '.coverage',
  collectCoverageFrom: [
    '**/src/**/*.ts',
    "!**/node_modules/**",
    "!**/tests/**"
  ],
  // https://istanbul.js.org/docs/advanced/alternative-reporters/
  // https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-reports/lib
  // coverageReporters: ['clover', 'html', 'json-summary', 'json', 'cobertura', 'teamcity', 'text-summary', 'text'],
  coverageReporters: ['clover', 'json-summary', 'html'],
  coveragePathIgnorePatterns: ['tests'],
};
