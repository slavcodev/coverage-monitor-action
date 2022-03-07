import Bips from '../Bips';
import CommentMode from '../CommentMode';
import Configuration from '../Configuration';
import Format from '../Format';
import GitHub from './GitHub';
import GitHubPullRequest from './GitHubPullRequest';
import GitHubWebhook from './GitHubWebhook';
import MetricType from '../MetricType';

export default class GitHubAdapter {
  readonly #core: GitHub;

  constructor(core: GitHub) {
    this.#core = core;
  }

  static #toBool(value: string | boolean, def: boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    switch (`${value}`.toLowerCase()) {
      case 'true':
      case 'on':
      case 'yes':
        return true;
      case 'false':
      case 'off':
      case 'no':
        return false;
      default:
        return def;
    }
  }

  static #toBips(value: string, def: number): Bips {
    return value !== undefined ? Math.round(Number(value) * 100) : def;
  }

  static #getWorkingDirectory(): string {
    return process.env.GITHUB_WORKSPACE || process.cwd();
  }

  loadConfig(): Configuration {
    const githubToken = this.#core.getInput('github_token', {required: true});
    const workingDir = this.#core.getInput('working_dir') || GitHubAdapter.#getWorkingDirectory();

    const cloverFile = this.#core.getInput('clover_file');
    const coveragePath = this.#core.getInput('coverage_path') || cloverFile;
    const coverageFormat = (this.#core.getInput('coverage_format') || Format.Auto) as Format;

    const thresholdAlert = GitHubAdapter.#toBips(this.#core.getInput('threshold_alert'), 5000);
    const thresholdWarning = GitHubAdapter.#toBips(this.#core.getInput('threshold_warning'), 9000);
    const thresholdMetric = (this.#core.getInput('threshold_metric') || MetricType.Lines) as MetricType;

    const check = GitHubAdapter.#toBool(this.#core.getInput('check'), true);
    const statusContext = this.#core.getInput('status_context') || 'Coverage Report';

    const comment = GitHubAdapter.#toBool(this.#core.getInput('comment'), true);
    const commentFooter = GitHubAdapter.#toBool(this.#core.getInput('comment_footer'), true);
    const commentContext = this.#core.getInput('comment_context') || 'Coverage Report';
    const commentMode = (this.#core.getInput('comment_mode') || CommentMode.Replace) as CommentMode;

    if (cloverFile && coveragePath !== cloverFile) {
      throw new Error('The `clover_file` option is deprecated and cannot be set along with `coverage_path`');
    }

    if (!coveragePath) {
      throw new Error('Missing or invalid option `coverage_path`');
    }

    if (!Object.values(Format).includes(coverageFormat)) {
      throw new Error(`Invalid option "coverage_format" - supported ${Object.values(Format).join(', ')}`);
    }

    if (!Object.values(MetricType).includes(thresholdMetric)) {
      throw new Error(`Invalid option "threshold_metric" - supported ${Object.values(MetricType).join(', ')}`);
    }

    if (!Object.values(CommentMode).includes(commentMode)) {
      throw new Error(`Invalid option "comment_mode" - supported ${Object.values(CommentMode).join(', ')}`);
    }

    return new Configuration({
      githubToken,
      coveragePath,
      coverageFormat,
      workingDir,
      threshold: {alert: thresholdAlert, warning: thresholdWarning, metric: thresholdMetric},
      comment: comment ? {context: commentContext, mode: commentMode, footer: commentFooter} : undefined,
      check: check ? {context: statusContext} : undefined,
    });
  }

  parseWebhook(request: GitHubWebhook): GitHubPullRequest | undefined {
    const {payload} = request || {};

    if (!payload) {
      throw new Error('Invalid github event');
    }

    const {pull_request: pr} = payload;

    if (!pr) {
      return undefined;
    }

    const {number, html_url: url, head: {sha} = {}} = pr;

    if (!number || !url || !sha) {
      throw new Error('Invalid pull_request event');
    }

    return {number, url, sha};
  }
}
