import Bips from './Bips';
import Integer from './Integer';
import ReportResult from './ReportResult';
import Threshold from './Threshold';

export default class Metric {
  readonly total: Integer;
  readonly covered: Integer;
  readonly rate: Bips;

  constructor({total, covered}: {total: Integer; covered: Integer}) {
    this.total = total;
    this.covered = covered;
    this.rate = total ? Number(Number((covered / total) * 10000).toFixed(0)) : 0;
  }

  report(threshold: Threshold): ReportResult {
    return {
      metric: threshold.metric,
      level: threshold.calc(this.rate),
      ...this,
    };
  }
}
