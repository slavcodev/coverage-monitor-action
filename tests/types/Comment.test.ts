import Comment from '../../src/types/Comment';
import Metric from '../../src/types/Metric';
import MetricLevel from '../../src/types/MetricLevel';
import MetricType from '../../src/types/MetricType';
import Report from '../../src/types/Report';
import ReportResult from '../../src/types/ReportResult';
import Threshold from '../../src/types/Threshold';

describe(`${Comment.name}`, () => {
  const defaultReportResult: ReportResult = {
    total: 10,
    covered: 10,
    rate: 10000,
    level: MetricLevel.Green,
    metric: MetricType.Branches,
  };

  it('generates badge URL', async () => {
    expect.hasAssertions();

    expect(Comment.generateBadgeUrl({...defaultReportResult, rate: 940, level: MetricLevel.Green})).toBe(
      'https://img.shields.io/static/v1?label=coverage&message=9%&color=green',
    );
  });

  it.each([
    {expected: ' 🎉', reportResult: {...defaultReportResult, rate: 10000}},
    {expected: '', reportResult: {...defaultReportResult, rate: 9999}},
  ] as {
    expected: string;
    reportResult: ReportResult;
  }[])('generates emoji $expected', async ({expected, reportResult}) => {
    expect.hasAssertions();
    expect(Comment.generateEmoji(reportResult)).toBe(expected);
  });

  it('generates table', async () => {
    expect.hasAssertions();

    const report: Report = new Report(
      {
        statements: new Metric({total: 10, covered: 1}),
        lines: new Metric({total: 10, covered: 2}),
        methods: new Metric({total: 10, covered: 3}),
        branches: new Metric({total: 10, covered: 4}),
      },
      new Threshold(MetricType.Lines, 0, 5000),
    );

    const expectedString = `<!-- coverage-monitor-action: foobar coverage -->
## foobar coverage

|  Totals | ![Coverage](https://img.shields.io/static/v1?label=coverage&message=20%&color=yellow) |
| :-- | :-- |
| Statements: | 10% ( 1 / 10 ) |
| Methods: | 30% ( 3 / 10 ) |
| Lines: | 20% ( 2 / 10 ) |
| Branches: | 40% ( 4 / 10 ) |
`;

    expect(report.toComment('foobar coverage').generateTable()).toBe(expectedString);
  });

  it('hides metric rows in table when metric is not available (total is zero)', async () => {
    expect.hasAssertions();

    const report: Report = new Report(
      {
        statements: new Metric({total: 10, covered: 1}),
        lines: new Metric({total: 10, covered: 2}),
        methods: new Metric({total: 0, covered: 0}),
        branches: new Metric({total: 10, covered: 4}),
      },
      new Threshold(MetricType.Branches, 30, 5000),
    );

    const expectedString = `<!-- coverage-monitor-action: Coverage Report -->
## Coverage Report

|  Totals | ![Coverage](https://img.shields.io/static/v1?label=coverage&message=40%&color=yellow) |
| :-- | :-- |
| Statements: | 10% ( 1 / 10 ) |
| Lines: | 20% ( 2 / 10 ) |
| Branches: | 40% ( 4 / 10 ) |
`;

    expect(report.toComment('Coverage Report').generateTable()).toBe(expectedString);
  });
});
