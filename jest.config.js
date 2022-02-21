// https://jestjs.io/docs/en/configuration.html
module.exports = {
  verbose: true,
  collectCoverage: true,
  coverageDirectory: '.coverage',
  coveragePathIgnorePatterns: ['tests'],
  // https://istanbul.js.org/docs/advanced/alternative-reporters/
  // coverageReporters: ['clover', 'html', 'json-summary', 'json', 'cobertura', 'teamcity', 'text-summary', 'text'],
  coverageReporters: ['clover', 'json-summary', 'html'],
};
