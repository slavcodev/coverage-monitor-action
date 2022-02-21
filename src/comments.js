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

module.exports = {
  generateBadgeUrl,
  generateEmoji,
  generateTable,
  generateCommentHeader,
};
