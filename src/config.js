const { formats } = require('./consts');

function toBool(value, def) {
  if (typeof value === 'boolean') {
    return value;
  }

  switch (`${value}`.toLowerCase()) {
    case 'true':
    case 'on':
    case 'yes':
      return true;
    case 'false':
    case 'off':
    case 'no':
      return false;
    default:
      return def;
  }
}

function toBips(value, def) {
  return Math.round(Number(value) * 100) || def;
}

function getWorkingDirectory() {
  return process.env.GITHUB_WORKSPACE || process.cwd();
}

function loadConfig({ getInput }) {
  const githubToken = getInput('github_token', { required: true });
  const workingDir = getInput('working_dir') || getWorkingDirectory();

  const cloverFile = getInput('clover_file');
  const coveragePath = getInput('coverage_path') || cloverFile;
  const coverageFormat = getInput('coverage_format') || formats.FORMAT_AUTO;

  const thresholdAlert = toBips(getInput('threshold_alert'), 5000);
  const thresholdWarning = toBips(getInput('threshold_warning'), 9000);
  const thresholdMetric = getInput('threshold_metric') || 'lines';

  const check = toBool(getInput('check'), true);
  const statusContext = getInput('status_context') || 'Coverage Report';

  const comment = toBool(getInput('comment'), true);
  const commentContext = getInput('comment_context') || 'Coverage Report';
  let commentMode = getInput('comment_mode');

  if (!['replace', 'update', 'insert'].includes(commentMode)) {
    commentMode = 'replace';
  }

  if (cloverFile && coveragePath !== cloverFile) {
    throw new Error('The `clover_file` option is deprecated and cannot be set along with `coverage_path`');
  }

  if (!coveragePath) {
    throw new Error('Missing or invalid option `coverage_path`');
  }

  if (!Object.values(formats).includes(coverageFormat)) {
    throw new Error(
      `Invalid option \`coverage_format\` - supported ${Object.values(formats).join(', ')}`,
    );
  }

  return {
    githubToken,
    coveragePath,
    coverageFormat,
    workingDir,
    threshold: {
      alert: thresholdAlert,
      warning: thresholdWarning,
      metric: ['statements', 'lines', 'methods', 'branches'].includes(thresholdMetric)
        ? thresholdMetric
        : 'lines',
    },
    comment: comment
      ? {
        context: commentContext,
        mode: commentMode,
      }
      : undefined,
    check: check
      ? { context: statusContext }
      : undefined,
  };
}

module.exports = {
  loadConfig,
};
