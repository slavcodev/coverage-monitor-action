// https://jestjs.io/docs/en/configuration.html
module.exports = {
  verbose: true,
  collectCoverage: true,
  coverageDirectory: '.coverage',
  coveragePathIgnorePatterns: ['tests'],
  coverageReporters: ['clover', 'html', 'json', 'text'],
};
