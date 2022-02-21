const core = require('@actions/core');
const github = require('@actions/github');
const { loadConfig } = require('./config');
const { generateStatus } = require('./checks');
const { generateTable, generateCommentHeader } = require('./comments');
const { parseFile } = require('./files');
const { generateReport } = require('./report');
const {
  createStatus,
  listComments,
  insertComment,
  upsertComment,
  replaceComment,
  parseWebhook,
} = require('./github');

async function run() {
  const {
    comment,
    check,
    githubToken,
    coveragePath,
    workingDir,
    threshold,
  } = loadConfig(core);

  const { context = {} } = github || {};
  const { pr } = parseWebhook(context);

  if (core.isDebug()) {
    core.debug('Handle webhook request');
    console.log(context);
  }

  const report = generateReport(threshold, await parseFile(workingDir, coveragePath));

  if (pr) {
    const client = github.getOctokit(githubToken).rest;

    if (check) {
      await createStatus({
        client,
        context,
        sha: pr.sha,
        status: generateStatus({
          report,
          targetUrl: pr.url,
          ...check,
        }),
      });
    }

    if (comment) {
      const message = generateTable({ report, ...comment });

      switch (comment.mode) {
        case 'insert':
          await insertComment({
            client,
            context,
            prNumber: pr.number,
            body: message,
          });

          break;
        case 'update':
          await upsertComment({
            client,
            context,
            prNumber: pr.number,
            body: message,
            existingComments: await listComments({
              client,
              context,
              prNumber: pr.number,
              commentHeader: generateCommentHeader({ ...comment }),
            }),
          });

          break;
        case 'replace':
        default:
          await replaceComment({
            client,
            context,
            prNumber: pr.number,
            body: message,
            existingComments: await listComments({
              client,
              context,
              prNumber: pr.number,
              commentHeader: generateCommentHeader({ ...comment }),
            }),
          });
      }
    }
  }
}

run().catch((error) => core.setFailed(error.message));
