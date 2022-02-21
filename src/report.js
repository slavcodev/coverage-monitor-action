function calculateLevel(rate, { alert, warning }) {
  if (rate < alert) {
    return 'red';
  }

  if (rate < warning) {
    return 'yellow';
  }

  return 'green';
}

function calcMetric(threshold, total, covered) {
  // Use bips, rather than percentage, prefer integer arther than float.
  const rate = total
    ? Number((Number((covered / total) * 10000).toFixed(0)))
    : 0;

  const level = calculateLevel(rate, threshold);

  return {
    total,
    covered,
    rate,
    level,
  };
}

function generateReport(threshold, coverage) {
  return {
    threshold,
    metrics: {
      statements: calcMetric(threshold, coverage.statements.total, coverage.statements.covered),
      lines: calcMetric(threshold, coverage.lines.total, coverage.lines.covered),
      methods: calcMetric(threshold, coverage.methods.total, coverage.methods.covered),
      branches: calcMetric(threshold, coverage.branches.total, coverage.branches.covered),
    },
  };
}

module.exports = {
  calculateLevel,
  generateReport,
};
