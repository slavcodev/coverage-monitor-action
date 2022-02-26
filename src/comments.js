function generateBadgeUrl({ rate, level }) {
  return `https://img.shields.io/static/v1?label=coverage&message=${Math.round(rate / 100)}%&color=${level}`;
}

function generateEmoji({ rate }) {
  return rate === 10000 ? ' 🎉' : '';
}

function generateCommentHeader({ context }) {
  return `<!-- coverage-monitor-action: ${context} -->`;
}

function generateTableRow(title, {
  rate,
  total,
  covered,
}) {
  return total ? `| ${title}: | ${rate / 100}% ( ${covered} / ${total} ) |\n` : '';
}

function generateTable({
  report: { metrics, threshold: { metric } },
  context,
}) {
  const { rate, level } = metrics[metric];

  return `${generateCommentHeader({ context })}
## ${context}${generateEmoji({ rate })}

|  Totals | ![Coverage](${generateBadgeUrl({ rate, level })}) |
| :-- | :-- |
${[
    generateTableRow('Statements', metrics.statements),
    generateTableRow('Methods', metrics.methods),
    generateTableRow('Lines', metrics.lines),
    generateTableRow('Branches', metrics.branches),
  ].join('')}`;
}

module.exports = {
  generateBadgeUrl,
  generateEmoji,
  generateTable,
  generateCommentHeader,
};
