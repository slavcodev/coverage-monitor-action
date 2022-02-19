const path = require('path');
const parser = require('../src/functions');

describe('functions', () => {
  const cloverCases = [
    {
      filename: '/stubs/clover/clover.xml',
      expectedMetric: {
        lines: {
          available: true,
          total: 34,
          covered: 24,
          rate: 70.59,
        },
        statements: {
          available: true,
          total: 66,
          covered: 45,
          rate: 68.18,
        },
        methods: {
          available: true,
          total: 12,
          covered: 10,
          rate: 83.33,
        },
        branches: {
          available: true,
          total: 20,
          covered: 11,
          rate: 55,
        },
        level: 'yellow', // 79.59 < 90
      },
    },
    {
      filename: '/stubs/clover/clover_no_branches.xml',
      expectedMetric: {
        lines: {
          available: true,
          total: 10,
          covered: 9,
          rate: 90,
        },
        statements: {
          available: true,
          total: 12,
          covered: 11,
          rate: 91.67,
        },
        methods: {
          available: true,
          total: 4,
          covered: 3,
          rate: 75,
        },
        branches: {
          available: false,
          total: 0,
          covered: 0,
          rate: 0,
        },
        level: 'green',
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
        level,
      },
    }) => {
      expect.hasAssertions();

      const coverage = await parser.readFile(path.join(__dirname, filename));

      expect(coverage).toHaveProperty('coverage');
      expect(coverage.coverage).toHaveProperty('project');
      expect(coverage.coverage.project).toHaveProperty('0');
      expect(coverage.coverage.project[0]).toHaveProperty('metrics');
      expect(coverage.coverage.project[0].metrics).toHaveProperty('0');

      const metric = parser.readMetric(coverage);

      ['statements', 'lines', 'methods', 'branches'].forEach((type) => {
        expect(metric).toHaveProperty(type);
        expect(metric[type]).toHaveProperty('available');
        expect(metric[type]).toHaveProperty('total');
        expect(metric[type]).toHaveProperty('covered');
        expect(metric[type]).toHaveProperty('rate');
      });

      expect(metric.lines).toStrictEqual(lines);
      expect(metric.statements).toStrictEqual(statements);
      expect(metric.methods).toStrictEqual(methods);
      expect(metric.branches).toStrictEqual(branches);

      expect(metric).toHaveProperty('level');
      expect(metric.level).toStrictEqual(level);
    },
  );

  it('calculates level', async () => {
    expect.hasAssertions();

    [
      [49, 50, 90, 'red'],
      [89, 50, 90, 'yellow'],
      [90, 50, 90, 'green'],
    ].forEach(
      ([linesRate, thresholdAlert, thresholdWarning, level]) => {
        const metric = { lines: { rate: linesRate } };
        const options = { thresholdAlert, thresholdWarning };
        expect(parser.calculateLevel(metric, options)).toStrictEqual(level);
      },
    );
  });

  it('generates status', async () => {
    expect.hasAssertions();
    const targetUrl = 'https://example.com';
    const statusContext = 'coverage';
    const rate = 50;

    expect(parser.generateStatus({
      targetUrl,
      statusContext,
      metric: { lines: { rate }, level: 'red' },
    })).toStrictEqual({
      state: 'failure',
      description: `Error: Too low coverage - ${rate}%`,
      target_url: targetUrl,
      context: statusContext,
    });

    expect(parser.generateStatus({
      targetUrl,
      statusContext,
      metric: { lines: { rate }, level: 'yellow' },
    })).toStrictEqual({
      state: 'success',
      description: `Warning: low coverage - ${rate}%`,
      target_url: targetUrl,
      context: statusContext,
    });

    expect(parser.generateStatus({
      targetUrl,
      statusContext,
      metric: { lines: { rate }, level: 'green' },
    })).toStrictEqual({
      state: 'success',
      description: `Success: Coverage - ${rate}%`,
      target_url: targetUrl,
      context: statusContext,
    });
  });

  it('generates badge URL', async () => {
    expect.hasAssertions();

    const metric = {
      lines: { rate: 9.4 },
      level: 'green',
    };

    expect(parser.generateBadgeUrl(metric)).toStrictEqual('https://img.shields.io/static/v1?label=coverage&message=9%&color=green');
  });

  it('generates emoji', async () => {
    expect.hasAssertions();
    expect(parser.generateEmoji({ lines: { rate: 100 } })).toStrictEqual(' 🎉');
    expect(parser.generateEmoji({ lines: { rate: 99.99 } })).toStrictEqual('');
  });

  it('generates header', async () => {
    expect.hasAssertions();

    expect(parser.generateCommentHeader({ commentContext: 'foobar' })).toStrictEqual(`<!-- coverage-monitor-action: foobar -->`);
  });

  it('generates table', async () => {
    expect.hasAssertions();

    const metric = {
      statements: {
        available: true,
        total: 10,
        covered: 1,
        rate: 10,
      },
      lines: {
        available: true,
        total: 10,
        covered: 2,
        rate: 20,
      },
      methods: {
        available: true,
        total: 10,
        covered: 3,
        rate: 30,
      },
      branches: {
        available: true,
        total: 10,
        covered: 4,
        rate: 40,
      },
      level: 'yellow',
    };

    const expectedString = `<!-- coverage-monitor-action: Coverage Report -->
## Coverage Report

|  Totals | ![Coverage](https://img.shields.io/static/v1?label=coverage&message=20%&color=yellow) |
| :-- | --: |
| Statements: | 20% ( 2 / 10 ) |
| Methods: | 30% ( 3 / 10 ) |
`;

    expect(parser.generateTable({ metric, commentContext: 'Coverage Report' })).toStrictEqual(expectedString);
  });

  it('adds N/A when metric not available when generates table', async () => {
    expect.hasAssertions();

    const metric = {
      lines: {
        available: true,
        total: 10,
        covered: 2,
        rate: 20,
      },
      methods: {
        available: false,
        total: 0,
        covered: 0,
        rate: 0,
      },
      level: 'yellow',
    };

    const expectedString = `<!-- coverage-monitor-action: Coverage Report -->
## Coverage Report

|  Totals | ![Coverage](https://img.shields.io/static/v1?label=coverage&message=20%&color=yellow) |
| :-- | --: |
| Statements: | 20% ( 2 / 10 ) |
| Methods: | N/A |
`;

    expect(parser.generateTable({ metric, commentContext: 'Coverage Report' })).toStrictEqual(expectedString);
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

    expect(prNumber).toStrictEqual(1234);
    expect(prUrl).toStrictEqual('https://example.com');
    expect(sha).toStrictEqual('foo');
  });
});
