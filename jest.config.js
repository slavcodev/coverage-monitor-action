// https://jestjs.io/docs/en/configuration.html
module.exports = {
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'logs',
  coveragePathIgnorePatterns: ['tests'],
  coverageReporters: ['clover', 'html', 'json', 'text'],
};
