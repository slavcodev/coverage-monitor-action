import Metric from '../../src/types/Metric';
import MetricLevel from '../../src/types/MetricLevel';
import MetricType from '../../src/types/MetricType';
import Report from '../../src/types/Report';
import StatusState from '../../src/types/StatusState';
import Threshold from '../../src/types/Threshold';

describe(`${Report.name}`, () => {
  const metrics = {
    statements: new Metric({total: 10, covered: 6}),
    lines: new Metric({total: 10, covered: 2}),
    methods: new Metric({total: 0, covered: 0}),
    branches: new Metric({total: 10, covered: 4}),
  };

  it.each([
    {
      threshold: new Threshold(MetricType.Branches, 3000, 5000),
      expectedResult: {
        total: 10,
        covered: 4,
        rate: 4000,
        level: MetricLevel.Yellow,
        metric: MetricType.Branches,
      },
    },
    {
      threshold: new Threshold(MetricType.Methods, 3000, 5000),
      expectedResult: {
        total: 0,
        covered: 0,
        rate: 0,
        level: MetricLevel.Red,
        metric: MetricType.Methods,
      },
    },
    {
      threshold: new Threshold(MetricType.Lines, 3000, 5000),
      expectedResult: {
        total: 10,
        covered: 2,
        rate: 2000,
        level: MetricLevel.Red,
        metric: MetricType.Lines,
      },
    },
    {
      threshold: new Threshold(MetricType.Statements, 3000, 5000),
      expectedResult: {
        total: 10,
        covered: 6,
        rate: 6000,
        level: MetricLevel.Green,
        metric: MetricType.Statements,
      },
    },
  ])(
    'calculates the coverage report by $threshold and results to $expectedResult',
    async ({threshold, expectedResult}) => {
      expect.hasAssertions();
      const report: Report = new Report(metrics, threshold);
      expect(report.result).toStrictEqual(expectedResult);
    },
  );

  it('provides report comment', async () => {
    expect.hasAssertions();
    const report: Report = new Report(metrics, new Threshold(MetricType.Branches, 3000, 5000));
    const comment = report.toComment('Comment context');
    expect(comment.context).toBe('Comment context');
    expect(comment.result).toStrictEqual({
      total: 10,
      covered: 4,
      rate: 4000,
      level: MetricLevel.Yellow,
      metric: MetricType.Branches,
    });
  });

  it('provides report status', async () => {
    expect.hasAssertions();
    const report: Report = new Report(metrics, new Threshold(MetricType.Branches, 3000, 5000));
    const status = report.toStatus('Status context', 'https://example.com');
    expect(status.context).toBe('Status context');
    expect(status.target_url).toBe('https://example.com');
    expect(status.state).toBe(StatusState.Success);
    expect(status.description).toBe('Warning: low branches coverage - 40%');
  });
});
