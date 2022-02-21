const core = require('@actions/core');
const github = require('@actions/github');
const path = require('path');
const {
  generateStatus,
  generateTable,
  loadConfig,
  generateCommentHeader,
  parseWebhook,
} = require('./functions');
const {
  createStatus,
  listComments,
  insertComment,
  upsertComment,
  replaceComment,
} = require('./github');
const { parseFile } = require('./files');
const { generateReport } = require('./report');

async function run() {
  const {
    comment,
    check,
    githubToken,
    cloverFile,
    thresholdAlert,
    thresholdWarning,
    thresholdMetric,
    statusContext,
    commentContext,
    commentMode,
  } = loadConfig(core);

  const workingDir = path.join(__dirname, '..');

  if (!check && !comment) {
    return;
  }
  const { context = {} } = github || {};
  const { prNumber, prUrl, sha } = parseWebhook(context);

  if (core.isDebug()) {
    core.debug('Handle webhook request');
    console.log(context);
  }

  const client = github.getOctokit(githubToken).rest;

  const threshold = {
    metric: thresholdMetric,
    alert: parseInt(thresholdAlert * 100, 10),
    warning: parseInt(thresholdWarning * 100, 10),
  };

  const report = generateReport(threshold, await parseFile(workingDir, cloverFile));

  if (check) {
    await createStatus({
      client,
      context,
      sha,
      status: generateStatus({
        report,
        targetUrl: prUrl,
        statusContext,
      }),
    });
  }

  if (comment) {
    const message = generateTable({ report, commentContext });

    switch (commentMode) {
      case 'insert':
        await insertComment({
          client,
          context,
          prNumber,
          body: message,
        });

        break;
      case 'update':
        await upsertComment({
          client,
          context,
          prNumber,
          body: message,
          existingComments: await listComments({
            client,
            context,
            prNumber,
            commentHeader: generateCommentHeader({ commentContext }),
          }),
        });

        break;
      case 'replace':
      default:
        await replaceComment({
          client,
          context,
          prNumber,
          body: message,
          existingComments: await listComments({
            client,
            context,
            prNumber,
            commentContext,
            commentHeader: generateCommentHeader({ commentContext }),
          }),
        });
    }
  }
}

run().catch((error) => core.setFailed(error.message));
