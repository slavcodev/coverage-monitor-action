const path = require('path');
const { parseFile } = require('../src/files');

describe(`${parseFile.name}`, () => {
  const workingDir = path.join(__dirname, 'stubs');

  const cloverCases = [
    {
      filename: 'clover/clover.xml',
      expectedCoverage: {
        lines: { total: 34, covered: 24 },
        statements: { total: 66, covered: 45 },
        methods: { total: 12, covered: 10 },
        branches: { total: 20, covered: 11 },
      },
    },
    {
      filename: 'clover/clover_no_branches.xml',
      expectedCoverage: {
        lines: { total: 10, covered: 9 },
        statements: { total: 12, covered: 11 },
        methods: { total: 4, covered: 3 },
        branches: { total: 0, covered: 0 },
      },
    },
  ];

  it.each(cloverCases)('parses clover xml: $filename', async ({ filename, expectedCoverage }) => {
    expect.hasAssertions();
    const coverage = await parseFile(workingDir, filename);
    expect(coverage).toStrictEqual(expectedCoverage);
  });

  it('fails on invalid file', async () => {
    expect.hasAssertions();
    await expect(parseFile(workingDir, 'unknown.xml')).rejects.toThrow('no such file or directory');
  });
});
