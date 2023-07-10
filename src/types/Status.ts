import MetricLevel from './MetricLevel';
import ReportResult from './ReportResult';
import StatusState from './StatusState';

export default class Status {
  readonly state: StatusState;
  readonly description: string;

  constructor(
    {level, rate, metric}: ReportResult,
    readonly context: string,
    readonly target_url: string,
  ) {
    if (level === MetricLevel.Red) {
      this.state = StatusState.Failure;
      this.description = `Error: Too low ${metric} coverage - ${rate / 100}%`;
    } else if (level === MetricLevel.Yellow) {
      this.state = StatusState.Success;
      this.description = `Warning: low ${metric} coverage - ${rate / 100}%`;
    } else {
      this.state = StatusState.Success;
      this.description = `Success: ${metric} coverage - ${rate / 100}%`;
    }
  }
}
