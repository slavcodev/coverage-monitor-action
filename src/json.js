async function parseJsonFile(buffer) {
  return JSON.parse(buffer);
}

async function parseJsonSummary(buffer) {
  const { total } = (await parseJsonFile(buffer));

  return {
    statements: { total: Number(total.statements.total), covered: Number(total.statements.covered) },
    lines: { total: Number(total.lines.total), covered: Number(total.lines.covered) },
    methods: { total: Number(total.functions.total), covered: Number(total.functions.covered) },
    branches: { total: Number(total.branches.total), covered: Number(total.branches.covered) },
  };
}

module.exports = {
  parseJsonSummary,
};
