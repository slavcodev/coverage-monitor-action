const path = require('path');
const { parseFile } = require('../src/files');
const { formats } = require('../src/consts');

describe(`${parseFile.name}`, () => {
  const workingDir = path.join(__dirname, 'stubs');

  const coverageFiles = [
    {
      format: formats.FORMAT_CLOVER,
      filename: 'clover/clover.xml',
      expectedCoverage: {
        lines: { total: 34, covered: 24 },
        statements: { total: 66, covered: 45 },
        methods: { total: 12, covered: 10 },
        branches: { total: 20, covered: 11 },
      },
    },
    {
      format: formats.FORMAT_AUTO,
      filename: 'clover/clover_no_branches.xml',
      expectedCoverage: {
        lines: { total: 10, covered: 9 },
        statements: { total: 12, covered: 11 },
        methods: { total: 4, covered: 3 },
        branches: { total: 0, covered: 0 },
      },
    },
    {
      format: formats.FORMAT_JSON_SUMMARY,
      filename: 'json-summary/coverage-summary.json',
      expectedCoverage: {
        lines: { total: 90, covered: 78 },
        statements: { total: 91, covered: 78 },
        methods: { total: 27, covered: 18 },
        branches: { total: 57, covered: 53 },
      },
    },
    {
      format: formats.FORMAT_AUTO,
      filename: 'json-summary/coverage-summary.json',
      expectedCoverage: {
        lines: { total: 90, covered: 78 },
        statements: { total: 91, covered: 78 },
        methods: { total: 27, covered: 18 },
        branches: { total: 57, covered: 53 },
      },
    },
  ];

  it.each(coverageFiles)('parses coverage: $filename ($format)', async ({ format, filename, expectedCoverage }) => {
    expect.hasAssertions();
    const coverage = await parseFile(workingDir, filename, format);
    expect(coverage).toStrictEqual(expectedCoverage);
  });

  it('fails on invalid file', async () => {
    expect.hasAssertions();
    await expect(parseFile(workingDir, 'unknown.xml', formats.FORMAT_AUTO))
      .rejects
      .toThrow('no such file or directory');
  });

  it('fails on invalid format', async () => {
    expect.hasAssertions();
    await expect(parseFile(workingDir, 'json-summary/coverage-summary.json', 'foo'))
      .rejects
      .toThrow(`Invalid option \`coverage_format\` - supported ${Object.values(formats).join(', ')}`);
  });

  it('fails on format guessing failure', async () => {
    expect.hasAssertions();
    await expect(parseFile(workingDir, 'coverage.png', formats.FORMAT_AUTO))
      .rejects
      .toThrow('Cannot guess format of "coverage.png"');
  });
});
