import MetricLevel from '../../src/types/MetricLevel';
import MetricType from '../../src/types/MetricType';
import ReportResult from '../../src/types/ReportResult';
import Status from '../../src/types/Status';
import StatusState from '../../src/types/StatusState';
import Threshold from '../../src/types/Threshold';

describe(`${Status.name}`, () => {
  it.each([
    {
      metric: {metric: MetricType.Lines, rate: 5000, level: MetricLevel.Red},
      expectedState: StatusState.Failure,
      expectedDescription: 'Error: Too low lines coverage - 50%',
    },
    {
      metric: {metric: MetricType.Statements, rate: 5000, level: MetricLevel.Yellow},
      expectedState: StatusState.Success,
      expectedDescription: 'Warning: low statements coverage - 50%',
    },
    {
      metric: {metric: MetricType.Branches, rate: 5000, level: MetricLevel.Green},
      expectedState: StatusState.Success,
      expectedDescription: 'Success: branches coverage - 50%',
    },
  ] as {
    threshold: Threshold;
    metric: ReportResult;
    expectedState: StatusState;
    expectedDescription: string;
  }[])('generates status "$expectedDescription"', async ({metric, expectedState, expectedDescription}) => {
    expect.hasAssertions();
    const targetUrl = 'https://example.com';
    const statusContext = 'coverage';

    expect({...new Status(metric, statusContext, targetUrl)}).toStrictEqual({
      state: expectedState,
      description: expectedDescription,
      target_url: targetUrl,
      context: statusContext,
    });
  });
});
