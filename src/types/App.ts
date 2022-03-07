import FileSystem from './FileSystem';
import GitHub from './github/GitHub';
import GitHubAction from './github/GitHubAction';
import GitHubAdapter from './github/GitHubAdapter';
import GitHubClientAdapter from './github/GitHubClientAdapter';
import Threshold from './Threshold';

export default class App {
  readonly #core: GitHub;
  readonly #action: GitHubAction;

  constructor(core: GitHub, action: GitHubAction) {
    this.#core = core;
    this.#action = action;
  }

  async run(): Promise<void> {
    if (this.#core.isDebug()) {
      this.#core.debug('Processing webhook request...');
      console.log(this.#action.context);
    }

    const adapter = new GitHubAdapter(this.#core);
    const config = adapter.loadConfig();
    const fs = new FileSystem(config.workingDir);
    const coverage = await fs.parseFile(config.coveragePath, config.coverageFormat);
    const report = coverage.report(
      new Threshold(config.threshold.metric, config.threshold.alert, config.threshold.warning),
    );

    if (this.#core.isDebug()) {
      this.#core.debug('Prepared coverage report');
      console.log(report);
    }

    const client = new GitHubClientAdapter(
      this.#action.getOctokit(config.githubToken).rest,
      this.#action.context,
      adapter.parseWebhook(this.#action.context),
    );

    const requests = [];

    if (config.check) {
      requests.push(client.createStatus(config.check.context, report));
    }

    if (config.comment) {
      requests.push(client.commentReport(config.comment, config.comment.context, report));
    }

    if (requests.length > 0) {
      await Promise.all(requests);
    }
  }
}
