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

function toBool(value) {
  return typeof value === 'boolean'
    ? value
    : value === 'true';
}

function toNumber(value) {
  return value * 1;
}

function calculateLevel({ rate }, thresholdAlert, thresholdWarning) {
  if (rate < thresholdAlert) {
    return 'red';
  }

  if (rate < thresholdWarning) {
    return 'yellow';
  }

  return 'green';
}

function calcMetric(total, covered, thresholdAlert, thresholdWarning) {
  const rate = total
    ? toNumber(Number((covered / total) * 100).toFixed(2))
    : 0;

  const level = calculateLevel({ rate }, thresholdAlert, thresholdWarning);

  return {
    total,
    covered,
    rate,
    level,
  };
}

function readMetric(xml, {
  thresholdAlert = DEFAULT_THRESHOLD_ALERT,
  thresholdWarning = DEFAULT_THRESHOLD_WARNING,
  thresholdMetric = DEFAULT_THRESHOLD_METRIC,
} = {}) {
  const {
    elements,
    coveredelements,
    statements,
    coveredstatements,
    methods,
    coveredmethods,
    conditionals,
    coveredconditionals,
  } = xml.coverage.project[0].metrics[0].$;

  return {
    threshold: { thresholdAlert, thresholdWarning, thresholdMetric },
    statements: calcMetric(toNumber(elements), toNumber(coveredelements), thresholdAlert, thresholdWarning),
    lines: calcMetric(toNumber(statements), toNumber(coveredstatements), thresholdAlert, thresholdWarning),
    methods: calcMetric(toNumber(methods), toNumber(coveredmethods), thresholdAlert, thresholdWarning),
    branches: calcMetric(toNumber(conditionals), toNumber(coveredconditionals), thresholdAlert, thresholdWarning),
  };
}

function generateBadgeUrl(coverage) {
  const { rate, level } = coverage[coverage.threshold.thresholdMetric];

  return `https://img.shields.io/static/v1?label=coverage&message=${Math.round(rate)}%&color=${level}`;
}

function generateEmoji(coverage) {
  const { rate } = coverage[coverage.threshold.thresholdMetric];

  return rate === 100 ? ' 🎉' : '';
}

function generateCommentHeader({ commentContext }) {
  return `<!-- coverage-monitor-action: ${commentContext} -->`;
}

function generateTableRow(title, {
  rate,
  total,
  covered,
}) {
  return total ? `| ${title}: | ${rate}% ( ${covered} / ${total} ) |\n` : '';
}

function generateTable({
  coverage,
  commentContext,
}) {
  return `${generateCommentHeader({ commentContext })}
## ${commentContext}${generateEmoji(coverage)}

|  Totals | ![Coverage](${generateBadgeUrl(coverage)}) |
| :-- | :-- |
${[
    generateTableRow('Statements', coverage.statements),
    generateTableRow('Methods', coverage.methods),
    generateTableRow('Lines', coverage.lines),
    generateTableRow('Branches', coverage.branches),
  ].join('')}`;
}

function generateStatus({
  coverage,
  targetUrl,
  statusContext,
  thresholdMetric = DEFAULT_THRESHOLD_METRIC,
}) {
  const { rate, level } = coverage[thresholdMetric];

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

function loadConfig({ getInput }) {
  const comment = toBool(getInput('comment'));
  const check = toBool(getInput('check'));
  const githubToken = getInput('github_token', { required: true });
  const cloverFile = getInput('clover_file', { required: true });
  const thresholdAlert = toNumber(getInput('threshold_alert') || 90);
  const thresholdWarning = toNumber(getInput('threshold_warning') || 50);
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
