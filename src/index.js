const core = require('@actions/core');
const github = require('@actions/github');
const {
  readFile,
  readMetric,
  generateStatus,
  generateTable,
  loadConfig,
  generateCommentHeader,
} = require('./functions');
const {
  createStatus,
  listComments,
  insertComment,
  upsertComment,
  replaceComment,
} = require('./github');

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
    commentMode,
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
  } = context.payload;
  const { sha } = context;
  console.log("Hello", sha);

  const client = new github.GitHub(githubToken);

  const coverage = await readFile(cloverFile);
  const metric = readMetric(coverage, { thresholdAlert, thresholdWarning });

  if (check) {
    createStatus({
      client,
      context,
      sha,
      status: generateStatus({ targetUrl: prUrl, metric, statusContext }),
    });
  }

  if (comment) {
    const message = generateTable({ metric, commentContext });

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
