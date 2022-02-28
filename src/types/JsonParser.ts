import CoverageItem from './CoverageItem';
import MetricCollection from './MetricCollection';

interface JsonSummaryItem {
  total: number;
  covered: number;
}

interface JsonSummaryRecord {
  total: {
    statements: JsonSummaryItem;
    lines: JsonSummaryItem;
    functions: JsonSummaryItem;
    branches: JsonSummaryItem;
  };
}

export default class JsonParser {
  #parseJsonFile(buffer: string): JsonSummaryRecord {
    return JSON.parse(buffer) as JsonSummaryRecord;
  }

  async parseJsonSummary(buffer: string): Promise<MetricCollection<CoverageItem>> {
    const {total} = this.#parseJsonFile(buffer);

    return {
      statements: {total: Number(total.statements.total), covered: Number(total.statements.covered)},
      lines: {total: Number(total.lines.total), covered: Number(total.lines.covered)},
      methods: {total: Number(total.functions.total), covered: Number(total.functions.covered)},
      branches: {total: Number(total.branches.total), covered: Number(total.branches.covered)},
    };
  }
}
