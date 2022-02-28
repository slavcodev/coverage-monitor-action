import CoverageItem from './CoverageItem';
import Metric from './Metric';
import MetricCollection from './MetricCollection';
import MetricType from './MetricType';
import Report from './Report';
import Threshold from './Threshold';

export default class CoverageSummary {
  constructor(readonly metrics: MetricCollection<CoverageItem>) {}

  report(threshold: Threshold): Report {
    return new Report(
      {
        [MetricType.Statements]: new Metric(this.metrics[MetricType.Statements]),
        [MetricType.Lines]: new Metric(this.metrics[MetricType.Lines]),
        [MetricType.Methods]: new Metric(this.metrics[MetricType.Methods]),
        [MetricType.Branches]: new Metric(this.metrics[MetricType.Branches]),
      },
      threshold,
    );
  }
}
