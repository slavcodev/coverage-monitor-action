import Bips from '../../src/types/Bips';
import CoverageSummary from '../../src/types/CoverageSummary';
import Integer from '../../src/types/Integer';
import MetricLevel from '../../src/types/MetricLevel';
import MetricType from '../../src/types/MetricType';
import Threshold from '../../src/types/Threshold';

describe(`${CoverageSummary.name}`, () => {
  const coverage = new CoverageSummary({
    lines: {total: 34, covered: 32},
    statements: {total: 66, covered: 45},
    methods: {total: 0, covered: 0},
    branches: {total: 20, covered: 11},
  });

  it.each([
    {
      threshold: {metric: MetricType.Branches, alert: 6000, warning: 8000},
      expectedResult: {
        metric: MetricType.Branches,
        total: 20,
        covered: 11,
        rate: 5500,
        level: MetricLevel.Red,
      },
    },
    {
      threshold: {metric: MetricType.Lines, alert: 1, warning: 8000},
      expectedResult: {
        metric: MetricType.Lines,
        total: 34,
        covered: 32,
        rate: 9412,
        level: MetricLevel.Green,
      },
    },
    {
      threshold: {metric: MetricType.Statements, alert: 0, warning: 7000},
      expectedResult: {
        metric: MetricType.Statements,
        total: 66,
        covered: 45,
        rate: 6818,
        level: MetricLevel.Yellow,
      },
    },
    {
      threshold: {metric: MetricType.Methods, alert: 0, warning: 5000},
      expectedResult: {
        metric: MetricType.Methods,
        total: 0,
        covered: 0,
        rate: 0,
        level: MetricLevel.Yellow,
      },
    },
  ] as {
    threshold: {metric: MetricType; alert: Bips; warning: Bips};
    expectedResult: {total: Integer; covered: Integer; rate: Bips; level: MetricLevel; metric: MetricType};
  }[])('parses clover xml: $threshold', async ({threshold: {metric, alert, warning}, expectedResult}) => {
    expect.hasAssertions();
    expect({...coverage.report(new Threshold(metric, alert, warning)).result}).toStrictEqual(expectedResult);
  });
});
