import Bips from '../../src/types/Bips';
import Integer from '../../src/types/Integer';
import Metric from '../../src/types/Metric';
import MetricLevel from '../../src/types/MetricLevel';
import MetricType from '../../src/types/MetricType';
import Threshold from '../../src/types/Threshold';

describe(`${Metric.name}`, () => {
  const defaultThreshold: {alert: Bips; warning: Bips} = {alert: 5000, warning: 9000};
  const defaultTotal = 100;

  it.each([
    {covered: 49, threshold: defaultThreshold, expectedRate: 4900, expectedLevel: MetricLevel.Red},
    {covered: 50, threshold: defaultThreshold, expectedRate: 5000, expectedLevel: MetricLevel.Yellow},
    {covered: 51, threshold: defaultThreshold, expectedRate: 5100, expectedLevel: MetricLevel.Yellow},
    {covered: 89, threshold: defaultThreshold, expectedRate: 8900, expectedLevel: MetricLevel.Yellow},
    {covered: 90, threshold: defaultThreshold, expectedRate: 9000, expectedLevel: MetricLevel.Green},
    {covered: 91, threshold: defaultThreshold, expectedRate: 9100, expectedLevel: MetricLevel.Green},
    {covered: 100, threshold: defaultThreshold, expectedRate: 10000, expectedLevel: MetricLevel.Green},
    {covered: 95, threshold: {alert: 0, warning: 9000}, expectedRate: 9500, expectedLevel: MetricLevel.Green},
  ] as {
    covered: Integer;
    threshold: {alert: Bips; warning: Bips};
    expectedRate: Bips;
    expectedLevel: MetricLevel;
  }[])(
    'calculates the coverage rate of $covered from 100 is $expectedRate, in relation to $threshold the level is $expectedLevel',
    async ({covered, threshold: {alert, warning}, expectedRate, expectedLevel}) => {
      expect.hasAssertions();
      const metric = new Metric({total: defaultTotal, covered});
      expect(metric.rate).toBe(expectedRate);
      expect(metric.report(new Threshold(MetricType.Branches, alert, warning)).level).toBe(expectedLevel);
    },
  );

  it('calculates the coverage rate even there is no total', async () => {
    expect.hasAssertions();
    const metric = new Metric({total: 0, covered: 0});
    expect(metric.rate).toBe(0);
    expect(metric.report(new Threshold(MetricType.Branches, 0, 50)).level).toBe(MetricLevel.Yellow);
  });
});
