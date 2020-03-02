const core = require('@actions/core');
const github = require('@actions/github');
const {
  readFile,
  readMetric,
  generateStatus,
  generateTable,
  loadConfig,
} = require('./functions');

async function run() {
  if (!github.context.payload.pull_request) {
    throw new Error('Action supports only pull_request event');
  }

  const {
    comment,
    check,
    githubToken,
    cloverFile,
    thresholdAlert,
    thresholdWarning,
    statusContext,
    commentContext,
  } = loadConfig(core);

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

  const client = new github.GitHub(githubToken);

  const coverage = await readFile(cloverFile);
  const metric = readMetric(coverage, { thresholdAlert, thresholdWarning });

  if (check) {
    client.repos.createStatus({
      ...context.repo,
      sha,
      ...generateStatus({ targetUrl: prUrl, metric, statusContext }),
    });
  }

  if (comment) {
    const message = generateTable({ metric, commentContext });
    client.issues.createComment({
      ...context.repo,
      issue_number: prNumber,
      body: message,
    });
  }
}

run().catch((error) => core.setFailed(error.message));
