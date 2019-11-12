const core = require('@actions/core');
const github = require('@actions/github');
const {
  readFile,
  readMetric,
  generateStatus,
  generateTable,
} = require('./functions');

async function run() {
  if (!github.context.payload.pull_request) {
    throw new Error('Action supports only pull_request event');
  }

  const comment = core.getInput('comment');
  const check = core.getInput('check');

  if (!check && !comment) {
    return;
  }

  const { context } = github;
  const {
    pull_request: {
      number: prNumber,
      html_url: prUrl,
    },
    after: sha,
  } = context.payload;

  const githubToken = core.getInput('github_token');
  const client = new github.GitHub(githubToken);

  const cloverFile = core.getInput('clover_file');
  const thresholdAlert = core.getInput('threshold_alert');
  const thresholdWarning = core.getInput('threshold_warning');
  const coverage = await readFile(cloverFile);
  const metric = readMetric(coverage, { thresholdAlert, thresholdWarning });

  if (check) {
    const statusContext = core.getInput('status_context');
    client.repos.createStatus({
      ...context.repo,
      sha,
      ...generateStatus({ targetUrl: prUrl, metric, statusContext }),
    });
  }

  if (comment) {
    const message = generateTable(metric);
    client.issues.createComment({
      ...context.repo,
      issue_number: prNumber,
      body: message,
    });
  }
}

run().catch((error) => core.setFailed(error.message));
