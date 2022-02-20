const path = require('path');
const parser = require('../src/functions');

describe('functions', () => {
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

  it('fails on invalid file', async () => {
    expect.hasAssertions();

    const filename = path.join(__dirname, 'unknown.xml');

    await expect(parser.readFile(filename)).rejects.toThrow('no such file or directory');
  });

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

      const xml = await parser.readFile(path.join(__dirname, filename));

      expect(xml).toHaveProperty('coverage');
      expect(xml.coverage).toHaveProperty('project');
      expect(xml.coverage.project).toHaveProperty('0');
      expect(xml.coverage.project[0]).toHaveProperty('metrics');
      expect(xml.coverage.project[0].metrics).toHaveProperty('0');

      const coverage = parser.readMetric(xml);

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

  it('calculates level', async () => {
    expect.hasAssertions();

    [
      [49, 50, 90, 'red'],
      [50, 50, 90, 'yellow'],
      [51, 50, 90, 'yellow'],
      [89, 50, 90, 'yellow'],
      [90, 50, 90, 'green'],
      [91, 50, 90, 'green'],
    ].forEach(
      ([rate, thresholdAlert, thresholdWarning, level]) => {
        expect(parser.calculateLevel({ rate }, thresholdAlert, thresholdWarning)).toBe(level);
      },
    );
  });

  it.each([
    {
      coverage: { lines: { rate: 50, level: 'red' }, threshold: { thresholdMetric: 'lines' } },
      expectedState: 'failure',
      expectedDescription: 'Error: Too low lines coverage - 50%',
    },
    {
      coverage: { statements: { rate: 50, level: 'yellow' }, threshold: { thresholdMetric: 'statements' } },
      expectedState: 'success',
      expectedDescription: 'Warning: low statements coverage - 50%',
    },
    {
      coverage: { branches: { rate: 50, level: 'green' }, threshold: { thresholdMetric: 'branches' } },
      expectedState: 'success',
      expectedDescription: 'Success: branches coverage - 50%',
    },
  ])('generates status', async ({
    coverage,
    expectedState,
    expectedDescription,
  }) => {
    expect.hasAssertions();
    const targetUrl = 'https://example.com';
    const statusContext = 'coverage';

    expect(parser.generateStatus({
      targetUrl,
      statusContext,
      coverage,
    })).toStrictEqual({
      state: expectedState,
      description: expectedDescription,
      target_url: targetUrl,
      context: statusContext,
    });
  });

  it('generates badge URL', async () => {
    expect.hasAssertions();

    const coverage = {
      threshold: { thresholdAlert: 0, thresholdWarning: 1, thresholdMetric: 'lines' },
      lines: { rate: 9.4, level: 'green' },
    };

    expect(parser.generateBadgeUrl(coverage)).toBe(
      'https://img.shields.io/static/v1?label=coverage&message=9%&color=green',
    );
  });

  it.each([
    { expected: ' 🎉', coverage: { lines: { rate: 100 }, threshold: { thresholdMetric: 'lines' } } },
    { expected: '', coverage: { branches: { rate: 99.99 }, threshold: { thresholdMetric: 'branches' } } },
  ])('generates emoji $expected', async ({ expected, coverage }) => {
    expect.hasAssertions();
    expect(parser.generateEmoji(coverage)).toBe(expected);
  });

  it('generates header', async () => {
    expect.hasAssertions();

    expect(parser.generateCommentHeader({ commentContext: 'foobar' })).toBe(`<!-- coverage-monitor-action: foobar -->`);
  });

  it('generates table', async () => {
    expect.hasAssertions();

    const coverage = {
      threshold: { thresholdAlert: 0, thresholdWarning: 50, thresholdMetric: 'lines' },
      statements: {
        total: 10,
        covered: 1,
        rate: 10,
        level: 'yellow',
      },
      lines: {
        total: 10,
        covered: 2,
        rate: 20,
        level: 'yellow',
      },
      methods: {
        total: 10,
        covered: 3,
        rate: 30,
        level: 'yellow',
      },
      branches: {
        total: 10,
        covered: 4,
        rate: 40,
        level: 'yellow',
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

    expect(parser.generateTable({ coverage, commentContext: 'Coverage Report' })).toBe(expectedString);
  });

  it('hides metric rows in table when metric is not available (total is zero)', async () => {
    expect.hasAssertions();

    const coverage = {
      threshold: { thresholdAlert: 30, thresholdWarning: 50, thresholdMetric: 'branches' },
      statements: {
        total: 10,
        covered: 1,
        rate: 10,
        level: 'red',
      },
      lines: {
        total: 10,
        covered: 2,
        rate: 20,
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
        rate: 40,
        level: 'yellow',
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

    expect(parser.generateTable({ coverage, commentContext: 'Coverage Report' })).toBe(expectedString);
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
