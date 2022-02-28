import Metric from './Metric';
import MetricCollection from './MetricCollection';
import MetricType from './MetricType';
import ReportResult from './ReportResult';

export default class Comment {
  constructor(readonly metrics: MetricCollection, readonly result: ReportResult, readonly context: string) {}

  static generateBadgeUrl({rate, level}: ReportResult): string {
    return `https://img.shields.io/static/v1?label=coverage&message=${Math.round(rate / 100)}%&color=${level}`;
  }

  static generateEmoji({rate}: ReportResult): string {
    return rate === 10000 ? ' 🎉' : '';
  }
  static generateTableRow(title: string, {rate, total, covered}: Metric): string {
    return total ? `| ${title}: | ${rate / 100}% ( ${covered} / ${total} ) |\n` : '';
  }

  generateCommentHeader(): string {
    return `<!-- coverage-monitor-action: ${this.context} -->`;
  }

  generateTable(): string {
    return `${this.generateCommentHeader()}
## ${this.context}${Comment.generateEmoji(this.result)}

|  Totals | ![Coverage](${Comment.generateBadgeUrl(this.result)}) |
| :-- | :-- |
${[
  Comment.generateTableRow('Statements', this.metrics[MetricType.Statements]),
  Comment.generateTableRow('Methods', this.metrics[MetricType.Methods]),
  Comment.generateTableRow('Lines', this.metrics[MetricType.Lines]),
  Comment.generateTableRow('Branches', this.metrics[MetricType.Branches]),
].join('')}`;
  }
}
