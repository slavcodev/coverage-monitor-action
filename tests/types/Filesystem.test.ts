import CoverageSummary from '../../src/types/CoverageSummary';
import FileSystem from '../../src/types/FileSystem';
import Format from '../../src/types/Format';
import path from 'path';

describe(`${FileSystem.name}`, () => {
  const coverageFiles = [
    {
      format: Format.Clover,
      filename: 'clover/clover.xml',
      expectedCoverage: {
        lines: {total: 34, covered: 24},
        statements: {total: 66, covered: 45},
        methods: {total: 12, covered: 10},
        branches: {total: 20, covered: 11},
      },
    },
    {
      format: Format.Auto,
      filename: 'clover/clover_no_branches.xml',
      expectedCoverage: {
        lines: {total: 10, covered: 9},
        statements: {total: 12, covered: 11},
        methods: {total: 4, covered: 3},
        branches: {total: 0, covered: 0},
      },
    },
    {
      format: Format.JsonSummary,
      filename: 'json-summary/coverage-summary.json',
      expectedCoverage: {
        lines: {total: 90, covered: 78},
        statements: {total: 91, covered: 78},
        methods: {total: 27, covered: 18},
        branches: {total: 57, covered: 53},
      },
    },
    {
      format: Format.Auto,
      filename: 'json-summary/coverage-summary.json',
      expectedCoverage: {
        lines: {total: 90, covered: 78},
        statements: {total: 91, covered: 78},
        methods: {total: 27, covered: 18},
        branches: {total: 57, covered: 53},
      },
    },
  ];

  const fs = new FileSystem(path.join(__dirname, '../stubs'));

  it.each(coverageFiles)('parses coverage: $filename ($format)', async ({format, filename, expectedCoverage}) => {
    expect.hasAssertions();
    const coverage = await fs.parseFile(filename, format);
    expect(coverage).toStrictEqual(new CoverageSummary(expectedCoverage));
  });

  it('fails on invalid file', async () => {
    expect.hasAssertions();
    await expect(fs.parseFile('unknown.xml', Format.Auto)).rejects.toThrow('no such file or directory');
  });

  it('fails on invalid format', async () => {
    expect.hasAssertions();
    await expect(fs.parseFile('json-summary/coverage-summary.json', 'foo')).rejects.toThrow(
      `Invalid option "coverage_format" - supported ${Object.values(Format).join(', ')}`,
    );
  });

  it('fails on format guessing failure', async () => {
    expect.hasAssertions();
    await expect(fs.parseFile('coverage.png', Format.Auto)).rejects.toThrow('Cannot guess format of "coverage.png"');
  });
});
