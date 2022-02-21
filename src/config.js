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
  const cloverFile = getInput('clover_file', { required: true });
  const workingDir = getInput('working_dir') || getWorkingDirectory();

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

  return {
    githubToken,
    cloverFile,
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
