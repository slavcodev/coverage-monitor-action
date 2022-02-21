const DEFAULT_THRESHOLD_METRIC = 'lines';

function toBool(value) {
  return typeof value === 'boolean'
    ? value
    : value === 'true';
}

function generateBadgeUrl({ rate, level }) {
  return `https://img.shields.io/static/v1?label=coverage&message=${Math.round(rate / 100)}%&color=${level}`;
}

function generateEmoji({ rate }) {
  return rate === 10000 ? ' 🎉' : '';
}

function generateCommentHeader({ commentContext }) {
  return `<!-- coverage-monitor-action: ${commentContext} -->`;
}

function generateTableRow(title, {
  rate,
  total,
  covered,
}) {
  return total ? `| ${title}: | ${rate / 100}% ( ${covered} / ${total} ) |\n` : '';
}

function generateTable({
  report,
  commentContext,
}) {
  const metric = report.metrics[report.threshold.metric];

  return `${generateCommentHeader({ commentContext })}
## ${commentContext}${generateEmoji(metric)}

|  Totals | ![Coverage](${generateBadgeUrl(metric)}) |
| :-- | :-- |
${[
    generateTableRow('Statements', report.metrics.statements),
    generateTableRow('Methods', report.metrics.methods),
    generateTableRow('Lines', report.metrics.lines),
    generateTableRow('Branches', report.metrics.branches),
  ].join('')}`;
}

function generateStatus({
  report: { metrics, threshold: { metric } },
  targetUrl,
  statusContext,
}) {
  const { rate, level } = metrics[metric];

  if (level === 'red') {
    return {
      state: 'failure',
      description: `Error: Too low ${metric} coverage - ${rate / 100}%`,
      target_url: targetUrl,
      context: statusContext,
    };
  }

  if (level === 'yellow') {
    return {
      state: 'success',
      description: `Warning: low ${metric} coverage - ${rate / 100}%`,
      target_url: targetUrl,
      context: statusContext,
    };
  }

  return {
    state: 'success',
    description: `Success: ${metric} coverage - ${rate / 100}%`,
    target_url: targetUrl,
    context: statusContext,
  };
}

function loadConfig({ getInput }) {
  const comment = toBool(getInput('comment'));
  const check = toBool(getInput('check'));
  const githubToken = getInput('github_token', { required: true });
  const cloverFile = getInput('clover_file', { required: true });
  const thresholdAlert = Number(getInput('threshold_alert') || 90);
  const thresholdWarning = Number(getInput('threshold_warning') || 50);
  const statusContext = getInput('status_context') || 'Coverage Report';
  const commentContext = getInput('comment_context') || 'Coverage Report';
  let commentMode = getInput('comment_mode');
  let thresholdMetric = getInput('threshold_metric') || DEFAULT_THRESHOLD_METRIC;

  if (!['replace', 'update', 'insert'].includes(commentMode)) {
    commentMode = 'replace';
  }

  if (!['statements', 'lines', 'methods', 'branches'].includes(thresholdMetric)) {
    thresholdMetric = 'lines';
  }

  return {
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
  };
}

function parseWebhook(request) {
  const {
    payload: {
      pull_request: {
        number: prNumber,
        html_url: prUrl,
        head: { sha } = {},
      } = {},
    } = {},
  } = request || {};

  if (!prNumber || !prUrl || !sha) {
    throw new Error('Action supports only pull_request event');
  }

  return {
    prNumber,
    prUrl,
    sha,
  };
}

module.exports = {
  generateBadgeUrl,
  generateEmoji,
  generateTable,
  generateStatus,
  loadConfig,
  generateCommentHeader,
  parseWebhook,
};
