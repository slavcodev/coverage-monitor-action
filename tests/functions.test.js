const parser = require('../src/functions');
const { parseFile } = require('../src/files');
const { generateReport } = require('../src/report');

describe('functions', () => {
  const workingDir = __dirname;

  const cloverCases = [
    {
      filename: '/stubs/clover/clover.xml',
      expectedMetric: {
        lines: {
          total: 34,
          covered: 24,
          rate: 70.59,
          level: 'yellow', // < DEFAULT_THRESHOLD_WARNING
        },
        statements: {
          total: 66,
          covered: 45,
          rate: 68.18,
          level: 'yellow', // < DEFAULT_THRESHOLD_WARNING
        },
        methods: {
          total: 12,
          covered: 10,
          rate: 83.33,
          level: 'yellow', // < DEFAULT_THRESHOLD_WARNING
        },
        branches: {
          total: 20,
          covered: 11,
          rate: 55,
          level: 'yellow', // < DEFAULT_THRESHOLD_WARNING
        },
      },
    },
    {
      filename: '/stubs/clover/clover_no_branches.xml',
      expectedMetric: {
        lines: {
          total: 10,
          covered: 9,
          rate: 90,
          level: 'green', // >= DEFAULT_THRESHOLD_WARNING
        },
        statements: {
          total: 12,
          covered: 11,
          rate: 91.67,
          level: 'green', // >= DEFAULT_THRESHOLD_WARNING
        },
        methods: {
          total: 4,
          covered: 3,
          rate: 75,
          level: 'yellow', // < DEFAULT_THRESHOLD_WARNING
        },
        branches: {
          total: 0,
          covered: 0,
          rate: 0,
          level: 'red', // < DEFAULT_THRESHOLD_ALERT
        },
      },
    },
  ];

  it.each(cloverCases)(
    'parses $filename to JS',
    async ({
      filename,
      expectedMetric: {
        lines,
        statements,
        methods,
        branches,
      },
    }) => {
      expect.hasAssertions();

      const threshold = {
        thresholdAlert: 50,
        thresholdWarning: 90,
        thresholdMetric: 'lines',
      };

      const report = generateReport({
        alert: parseInt(threshold.thresholdAlert * 100, 10),
        warning: parseInt(threshold.thresholdWarning * 100, 10),
      }, await parseFile(workingDir, filename));

      const coverage = parser.readCoverage(report, threshold);

      ['statements', 'lines', 'methods', 'branches'].forEach((type) => {
        expect(coverage).toHaveProperty(type);
        expect(coverage[type]).toHaveProperty('total');
        expect(coverage[type]).toHaveProperty('covered');
        expect(coverage[type]).toHaveProperty('rate');
        expect(coverage[type]).toHaveProperty('level');
      });

      expect(coverage.lines).toStrictEqual(lines);
      expect(coverage.statements).toStrictEqual(statements);
      expect(coverage.methods).toStrictEqual(methods);
      expect(coverage.branches).toStrictEqual(branches);
    },
  );

  it.each([
    {
      threshold: { metric: 'lines' },
      metrics: { lines: { rate: 5000, level: 'red' } },
      expectedState: 'failure',
      expectedDescription: 'Error: Too low lines coverage - 50%',
    },
    {
      threshold: { metric: 'statements' },
      metrics: { statements: { rate: 5000, level: 'yellow' } },
      expectedState: 'success',
      expectedDescription: 'Warning: low statements coverage - 50%',
    },
    {
      threshold: { metric: 'branches' },
      metrics: { branches: { rate: 5000, level: 'green' } },
      expectedState: 'success',
      expectedDescription: 'Success: branches coverage - 50%',
    },
  ])('generates status "$expectedDescription"', async ({
    threshold,
    metrics,
    expectedState,
    expectedDescription,
  }) => {
    expect.hasAssertions();
    const targetUrl = 'https://example.com';
    const statusContext = 'coverage';

    expect(parser.generateStatus({
      targetUrl,
      statusContext,
      report: { metrics, threshold },
    })).toStrictEqual({
      state: expectedState,
      description: expectedDescription,
      target_url: targetUrl,
      context: statusContext,
    });
  });

  it('generates badge URL', async () => {
    expect.hasAssertions();

    expect(parser.generateBadgeUrl({ rate: 940, level: 'green' })).toBe(
      'https://img.shields.io/static/v1?label=coverage&message=9%&color=green',
    );
  });

  it.each([
    { expected: ' 🎉', metric: { rate: 10000 } },
    { expected: '', metric: { rate: 9999 } },
  ])('generates emoji $expected', async ({ expected, metric }) => {
    expect.hasAssertions();
    expect(parser.generateEmoji(metric)).toBe(expected);
  });

  it('generates header', async () => {
    expect.hasAssertions();

    expect(parser.generateCommentHeader({ commentContext: 'foobar' })).toBe(`<!-- coverage-monitor-action: foobar -->`);
  });

  it('generates table', async () => {
    expect.hasAssertions();

    const report = {
      threshold: { alert: 0, warning: 50, metric: 'lines' },
      metrics: {
        statements: {
          total: 10,
          covered: 1,
          rate: 1000,
          level: 'yellow',
        },
        lines: {
          total: 10,
          covered: 2,
          rate: 2000,
          level: 'yellow',
        },
        methods: {
          total: 10,
          covered: 3,
          rate: 3000,
          level: 'yellow',
        },
        branches: {
          total: 10,
          covered: 4,
          rate: 4000,
          level: 'yellow',
        },
      },
    };

    const expectedString = `<!-- coverage-monitor-action: Coverage Report -->
## Coverage Report

|  Totals | ![Coverage](https://img.shields.io/static/v1?label=coverage&message=20%&color=yellow) |
| :-- | :-- |
| Statements: | 10% ( 1 / 10 ) |
| Methods: | 30% ( 3 / 10 ) |
| Lines: | 20% ( 2 / 10 ) |
| Branches: | 40% ( 4 / 10 ) |
`;

    expect(parser.generateTable({ report, commentContext: 'Coverage Report' })).toBe(expectedString);
  });

  it('hides metric rows in table when metric is not available (total is zero)', async () => {
    expect.hasAssertions();

    const report = {
      threshold: { alert: 30, warning: 50, metric: 'branches' },
      metrics: {
        statements: {
          total: 10,
          covered: 1,
          rate: 1000,
          level: 'red',
        },
        lines: {
          total: 10,
          covered: 2,
          rate: 2000,
          level: 'red',
        },
        methods: {
          total: 0,
          covered: 0,
          rate: 0,
          level: 'red',
        },
        branches: {
          total: 10,
          covered: 4,
          rate: 4000,
          level: 'yellow',
        },
      },
    };

    const expectedString = `<!-- coverage-monitor-action: Coverage Report -->
## Coverage Report

|  Totals | ![Coverage](https://img.shields.io/static/v1?label=coverage&message=40%&color=yellow) |
| :-- | :-- |
| Statements: | 10% ( 1 / 10 ) |
| Lines: | 20% ( 2 / 10 ) |
| Branches: | 40% ( 4 / 10 ) |
`;

    expect(parser.generateTable({ report, commentContext: 'Coverage Report' })).toBe(expectedString);
  });

  function createConfigReader(inputs) {
    return {
      getInput(name) {
        return inputs[
          name.split('_').reduce(
            (carry, item) => (carry === null ? item : `${carry}${item[0].toUpperCase() + item.slice(1)}`),
            null,
          )
        ];
      },
    };
  }

  it('loads config', async () => {
    expect.hasAssertions();

    const inputs = {
      comment: true,
      check: false,
      githubToken: '***',
      cloverFile: 'clover.xml',
      thresholdAlert: 10,
      thresholdWarning: 20,
      thresholdMetric: 'branches',
      statusContext: 'Coverage',
      commentContext: 'Coverage Report',
      commentMode: 'replace',
    };

    const reader = createConfigReader(inputs);
    const config = parser.loadConfig(reader);

    expect(config).toStrictEqual(inputs);
  });

  it('uses defaults on loading config', async () => {
    expect.hasAssertions();

    const inputs = {
      githubToken: '***',
      cloverFile: 'clover.xml',
    };

    const expected = {
      comment: false,
      check: false,
      githubToken: '***',
      cloverFile: 'clover.xml',
      thresholdAlert: 90,
      thresholdWarning: 50,
      thresholdMetric: 'lines',
      statusContext: 'Coverage Report',
      commentContext: 'Coverage Report',
      commentMode: 'replace',
    };

    const reader = createConfigReader(inputs);
    const config = parser.loadConfig(reader);

    expect(config).toStrictEqual(expected);
  });

  it('coerces config values', async () => {
    expect.hasAssertions();

    const inputs = {
      comment: 'true',
      check: 'false',
      githubToken: '***',
      cloverFile: 'clover.xml',
      thresholdAlert: '10',
      thresholdWarning: '20',
      thresholdMetric: 'branches',
      statusContext: 'Coverage',
      commentContext: 'Coverage Report',
      commentMode: 'replace',
    };

    const expected = {
      comment: true,
      check: false,
      githubToken: '***',
      cloverFile: 'clover.xml',
      thresholdAlert: 10,
      thresholdWarning: 20,
      thresholdMetric: 'branches',
      statusContext: 'Coverage',
      commentContext: 'Coverage Report',
      commentMode: 'replace',
    };

    const reader = createConfigReader(inputs);
    const config = parser.loadConfig(reader);

    expect(config).toStrictEqual(expected);
  });

  it('uses default comment mode if got unsupported value', async () => {
    expect.hasAssertions();

    const inputs = {
      githubToken: '***',
      cloverFile: 'clover.xml',
      commentMode: 'foo',
    };

    const expected = {
      comment: false,
      check: false,
      githubToken: '***',
      cloverFile: 'clover.xml',
      thresholdAlert: 90,
      thresholdWarning: 50,
      thresholdMetric: 'lines',
      statusContext: 'Coverage Report',
      commentContext: 'Coverage Report',
      commentMode: 'replace',
    };

    const reader = createConfigReader(inputs);
    const config = parser.loadConfig(reader);

    expect(config).toStrictEqual(expected);
  });

  it('uses default threshold metric if got unsupported value', async () => {
    expect.hasAssertions();

    const inputs = {
      githubToken: '***',
      cloverFile: 'clover.xml',
      commentMode: 'replace',
      thresholdMetric: 'foo',
    };

    const expected = {
      comment: false,
      check: false,
      githubToken: '***',
      cloverFile: 'clover.xml',
      thresholdAlert: 90,
      thresholdWarning: 50,
      thresholdMetric: 'lines',
      statusContext: 'Coverage Report',
      commentContext: 'Coverage Report',
      commentMode: 'replace',
    };

    const reader = createConfigReader(inputs);
    const config = parser.loadConfig(reader);

    expect(config).toStrictEqual(expected);
  });

  Object.entries({
    'on undefined request': undefined,
    'on empty request': {},
    'on missing payload': { payload: undefined },
    'on invalid payload': { payload: {} },
    'on missing pull request': { payload: { pull_request: undefined } },
    'on invalid pull request': { payload: { pull_request: {} } },
    'on missing number': { payload: { pull_request: { html_url: 'https://example.com', head: { sha: 'foo' } } } },
    'on missing pull request URL': { payload: { pull_request: { number: 1234, head: { sha: 'foo' } } } },
    'on missing head info': { payload: { pull_request: { number: 1234, html_url: 'https://example.com' } } },
    'on invalid head sha': { payload: { pull_request: { number: 1234, html_url: 'https://example.com', head: {} } } },
  }).forEach(([dataset, request]) => {
    it(`fails on invalid webhook request: ${dataset}`, async () => {
      expect.hasAssertions();
      expect(() => { parser.parseWebhook(request); }).toThrow(new Error('Action supports only pull_request event'));
    });
  });

  it('parses webhook request', async () => {
    expect.hasAssertions();

    const {
      prNumber,
      prUrl,
      sha,
    } = parser.parseWebhook({
      payload: {
        pull_request: {
          number: 1234,
          html_url: 'https://example.com',
          head: { sha: 'foo' },
        },
      },
    });

    expect(prNumber).toBe(1234);
    expect(prUrl).toBe('https://example.com');
    expect(sha).toBe('foo');
  });
});
