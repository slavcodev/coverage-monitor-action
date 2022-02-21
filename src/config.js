function toBool(value) {
  return typeof value === 'boolean'
    ? value
    : value === 'true';
}

function getWorkingDirectory() {
  return process.env.GITHUB_WORKSPACE || process.cwd();
}

function loadConfig({ getInput }) {
  const comment = toBool(getInput('comment'));
  const check = toBool(getInput('check'));
  const githubToken = getInput('github_token', { required: true });
  const cloverFile = getInput('clover_file', { required: true });
  const workingDir = getInput('working_dir') || getWorkingDirectory();
  const thresholdAlert = Number(getInput('threshold_alert') || 90);
  const thresholdWarning = Number(getInput('threshold_warning') || 50);
  const statusContext = getInput('status_context') || 'Coverage Report';
  const commentContext = getInput('comment_context') || 'Coverage Report';
  let commentMode = getInput('comment_mode');
  let thresholdMetric = getInput('threshold_metric') || 'lines';

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
    workingDir,
    thresholdAlert,
    thresholdWarning,
    thresholdMetric,
    statusContext,
    commentContext,
    commentMode,
  };
}

module.exports = {
  loadConfig,
};
