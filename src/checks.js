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

module.exports = {
  generateStatus,
};
