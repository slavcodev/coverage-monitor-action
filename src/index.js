const core = require('@actions/core');
const github = require('@actions/github');
const {
  readFile,
  readMetric,
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

  const coverage = readMetric(
    await readFile(cloverFile),
    { thresholdAlert, thresholdWarning, thresholdMetric },
  );

  if (check) {
    await createStatus({
      client,
      context,
      sha,
      status: generateStatus({
        targetUrl: prUrl,
        coverage,
        statusContext,
        thresholdMetric,
      }),
    });
  }

  if (comment) {
    const message = generateTable({ metric: coverage, commentContext });

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
