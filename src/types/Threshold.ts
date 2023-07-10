import Bips from './Bips';
import MetricLevel from './MetricLevel';
import MetricType from './MetricType';

export default class Threshold {
  constructor(
    readonly metric: MetricType,
    readonly alert: Bips,
    readonly warning: Bips,
  ) {}

  calc(rate: Bips): MetricLevel {
    if (rate < this.alert) {
      return MetricLevel.Red;
    } else if (rate < this.warning) {
      return MetricLevel.Yellow;
    } else {
      return MetricLevel.Green;
    }
  }
}
