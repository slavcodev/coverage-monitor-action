import Comment from './Comment';
import MetricCollection from './MetricCollection';
import ReportResult from './ReportResult';
import Status from './Status';
import Threshold from './Threshold';

export default class Report {
  readonly result: ReportResult;

  constructor(
    readonly metrics: MetricCollection,
    readonly threshold: Threshold,
  ) {
    this.result = this.metrics[this.threshold.metric].report(threshold);
  }

  toComment(context: string, footer: boolean): Comment {
    return new Comment(this.metrics, this.result, context, footer);
  }

  toStatus(context: string, targetUrl: string): Status {
    return new Status(this.result, context, targetUrl);
  }
}
