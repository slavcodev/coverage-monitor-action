const xml2js = require('xml2js');
const fs = require('fs');

fs.readFileAsync = (filename) => new Promise(
  (resolve, reject) => {
    fs.readFile(filename, { encoding: 'utf-8' }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(`${data}`.replace('\ufeff', ''));
      }
    });
  },
);

const parser = new xml2js.Parser(/* options */);

const DEFAULT_THRESHOLD_METRIC = 'lines';
const DEFAULT_THRESHOLD_ALERT = 50;
const DEFAULT_THRESHOLD_WARNING = 90;

async function readFile(filename) {
  return parser.parseStringPromise(await fs.readFileAsync(filename));
}

function calcMetric(total, covered) {
  const available = total > 0 && covered > 0;
  const rate = total
    ? Number((covered / total) * 100).toFixed(2) * 1
    : 0;

  return {
    available,
    total,
    covered,
    rate,
  };
}

function calculateLevel(metric, {
  thresholdAlert = DEFAULT_THRESHOLD_ALERT,
  thresholdWarning = DEFAULT_THRESHOLD_WARNING,
  thresholdMetric = DEFAULT_THRESHOLD_METRIC,
} = {}) {
  const { rate: linesRate } = metric[thresholdMetric];

  if (linesRate < thresholdAlert) {
    return 'red';
  }

  if (linesRate < thresholdWarning) {
    return 'yellow';
  }

  return 'green';
}

function readMetric(coverage, {
  thresholdAlert = DEFAULT_THRESHOLD_ALERT,
  thresholdWarning = DEFAULT_THRESHOLD_WARNING,
  thresholdMetric = DEFAULT_THRESHOLD_METRIC,
} = {}) {
  const data = coverage.coverage.project[0].metrics[0].$;
  const metric = {
    statements: calcMetric(data.elements * 1, data.coveredelements * 1),
    lines: calcMetric(data.statements * 1, data.coveredstatements * 1),
    methods: calcMetric(data.methods * 1, data.coveredmethods * 1),
    branches: calcMetric(data.conditionals * 1, data.coveredconditionals * 1),
  };

  metric.level = calculateLevel(metric, { thresholdAlert, thresholdWarning, thresholdMetric });

  return metric;
}

function generateBadgeUrl(metric) {
  return `https://img.shields.io/static/v1?label=coverage&message=${Math.round(metric.lines.rate)}%&color=${metric.level}`;
}

function generateEmoji(metric) {
  return metric.lines.rate === 100
    ? ' 🎉'
    : '';
}

function generateInfo({
  available,
  rate,
  total,
  covered,
}) {
  return available
    ? `${rate}% ( ${covered} / ${total} )`
    : 'N/A';
}

function generateCommentHeader({ commentContext }) {
  return `<!-- coverage-monitor-action: ${commentContext} -->`;
}

function generateTable({
  metric,
  commentContext,
}) {
  return `${generateCommentHeader({ commentContext })}
## ${commentContext}${generateEmoji(metric)}

|  Totals | ![Coverage](${generateBadgeUrl(metric)}) |
| :-- | :-- |
| Statements: | ${generateInfo(metric.statements)} |
| Lines: | ${generateInfo(metric.lines)} |
| Methods: | ${generateInfo(metric.methods)} |
| Branches: | ${generateInfo(metric.branches)} |
`;
}

function generateStatus({
  metric,
  targetUrl,
  statusContext,
  thresholdMetric = DEFAULT_THRESHOLD_METRIC,
}) {
  const { level } = metric;
  const { rate } = metric[thresholdMetric];
  if (level === 'red') {
    return {
      state: 'failure',
      description: `Error: Too low ${thresholdMetric} coverage - ${rate}%`,
      target_url: targetUrl,
      context: statusContext,
    };
  }

  if (level === 'yellow') {
    return {
      state: 'success',
      description: `Warning: low ${thresholdMetric} coverage - ${rate}%`,
      target_url: targetUrl,
      context: statusContext,
    };
  }

  return {
    state: 'success',
    description: `Success: ${thresholdMetric} coverage - ${rate}%`,
    target_url: targetUrl,
    context: statusContext,
  };
}

function toBool(value) {
  return typeof value === 'boolean'
    ? value
    : value === 'true';
}

function toInt(value) {
  return value * 1;
}

function loadConfig({ getInput }) {
  const comment = toBool(getInput('comment'));
  const check = toBool(getInput('check'));
  const githubToken = getInput('github_token', { required: true });
  const cloverFile = getInput('clover_file', { required: true });
  const thresholdAlert = toInt(getInput('threshold_alert') || 90);
  const thresholdWarning = toInt(getInput('threshold_warning') || 50);
  const statusContext = getInput('status_context') || 'Coverage Report';
  const commentContext = getInput('comment_context') || 'Coverage Report';
  let commentMode = getInput('comment_mode');
  let thresholdMetric = getInput('threshold_metric') || DEFAULT_THRESHOLD_METRIC;

  if (!['replace', 'update', 'insert'].includes(commentMode)) {
    commentMode = 'replace';
  }

  if (!['statements', 'lines', 'methods', 'branches'].includes(thresholdMetric)) {
    thresholdMetric = DEFAULT_THRESHOLD_METRIC;
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
  readFile,
  readMetric,
  generateBadgeUrl,
  generateEmoji,
  generateTable,
  calculateLevel,
  generateStatus,
  loadConfig,
  generateCommentHeader,
  parseWebhook,
};
