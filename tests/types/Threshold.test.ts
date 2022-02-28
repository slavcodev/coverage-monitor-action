import Bips from '../../src/types/Bips';
import MetricLevel from '../../src/types/MetricLevel';
import MetricType from '../../src/types/MetricType';
import Threshold from '../../src/types/Threshold';

describe(`${Threshold.name}`, () => {
  const defaultThreshold: {alert: Bips; warning: Bips} = {alert: 5000, warning: 9000};

  it.each([
    {rate: 4900, threshold: defaultThreshold, expectedLevel: MetricLevel.Red},
    {rate: 5000, threshold: defaultThreshold, expectedLevel: MetricLevel.Yellow},
    {rate: 5100, threshold: defaultThreshold, expectedLevel: MetricLevel.Yellow},
    {rate: 8900, threshold: defaultThreshold, expectedLevel: MetricLevel.Yellow},
    {rate: 9000, threshold: defaultThreshold, expectedLevel: MetricLevel.Green},
    {rate: 9100, threshold: defaultThreshold, expectedLevel: MetricLevel.Green},
    {rate: 10000, threshold: defaultThreshold, expectedLevel: MetricLevel.Green},
    {rate: 9500, threshold: {...defaultThreshold, alert: 0}, expectedLevel: MetricLevel.Green},
  ] as {
    rate: Bips;
    threshold: {alert: Bips; warning: Bips};
    expectedLevel: MetricLevel;
  }[])(
    'calculates level $rate with $threshold is $level',
    async ({rate, threshold: {alert, warning}, expectedLevel}) => {
      expect.hasAssertions();
      expect(new Threshold(MetricType.Branches, alert, warning).calc(rate)).toBe(expectedLevel);
    },
  );
});
