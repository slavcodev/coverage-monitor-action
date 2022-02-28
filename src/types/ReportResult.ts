import Bips from './Bips';
import Integer from './Integer';
import MetricLevel from './MetricLevel';
import MetricType from './MetricType';

export default interface ReportResult {
  readonly total: Integer;
  readonly covered: Integer;
  readonly rate: Bips;
  readonly level: MetricLevel;
  readonly metric: MetricType;
}
