import Bips from './Bips';
import CommentMode from './CommentMode';
import MetricType from './MetricType';

export default class Configuration {
  readonly githubToken: string;
  readonly coveragePath: string;
  readonly coverageFormat: string;
  readonly workingDir: string;
  readonly threshold: {
    metric: MetricType;
    alert: Bips;
    warning: Bips;
  };
  readonly comment?: {
    mode: CommentMode;
    context: string;
  };
  readonly check?: {
    context: string;
  };

  constructor({githubToken, coveragePath, coverageFormat, workingDir, threshold, comment, check}: Configuration) {
    this.githubToken = githubToken;
    this.coveragePath = coveragePath;
    this.coverageFormat = coverageFormat;
    this.workingDir = workingDir;
    this.threshold = threshold;
    this.githubToken = githubToken;
    this.comment = comment;
    this.check = check;
  }
}
