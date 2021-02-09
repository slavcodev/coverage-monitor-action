const path = require('path');
const parser = require('../src/functions');

describe('functions', () => {
  it('fails on invalid file', async () => {
    expect.hasAssertions();

    const filename = path.join(__dirname, 'unknown.xml');

    await expect(parser.readFile(filename)).rejects.toThrow('no such file or directory');
  });

  it('parses XML to JS', async () => {
    expect.hasAssertions();

    const filename = path.join(__dirname, '/clover.xml');
    const coverage = await parser.readFile(filename);

    expect(coverage).toHaveProperty('coverage');
    expect(coverage.coverage).toHaveProperty('project');
    expect(coverage.coverage.project).toHaveProperty('0');
    expect(coverage.coverage.project[0]).toHaveProperty('metrics');
    expect(coverage.coverage.project[0].metrics).toHaveProperty('0');

    const metric = parser.readMetric(coverage);

    ['statements', 'lines', 'methods', 'branches'].forEach((type) => {
      expect(metric).toHaveProperty(type);
      expect(metric[type]).toHaveProperty('total');
      expect(metric[type]).toHaveProperty('covered');
      expect(metric[type]).toHaveProperty('rate');
    });

    expect(metric.lines.rate).toStrictEqual(70.59); // 24 / 34
    expect(metric.statements.rate).toStrictEqual(68.18); // 45 / 66
    expect(metric.methods.rate).toStrictEqual(83.33); // 10 / 12
    expect(metric.branches.rate).toStrictEqual(55); // 11 / 20

    expect(metric).toHaveProperty('level');
    expect(metric.level).toStrictEqual('yellow'); // 79.59 < 90
  });

  it('calculates level', async () => {
    expect.hasAssertions();

    [
      [49, 50, 90, 'red', 'branches'],
      [50, 50, 90, 'yellow', 'lines'],
      [51, 50, 90, 'yellow', 'statements'],
      [89, 50, 90, 'yellow', 'branches'],
      [90, 50, 90, 'green', 'methods'],
      [91, 50, 90, 'green', 'lines'],
    ].forEach(
      ([linesRate, thresholdAlert, thresholdWarning, level, thresholdMetric]) => {
        const metric = { [thresholdMetric]: { rate: linesRate } };
        const options = { thresholdAlert, thresholdWarning, thresholdMetric };
        expect(parser.calculateLevel(metric, options)).toStrictEqual(level);
      },
    );
  });

  it('calculates default level', async () => {
    const metric = { lines: { rate: 61 }};
    expect(parser.calculateLevel(metric)).toStrictEqual('yellow');
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
      description: `Error: Too low lines coverage - ${rate}%`,
      target_url: targetUrl,
      context: statusContext,
    });

    expect(parser.generateStatus({
      targetUrl,
      statusContext,
      metric: { statements: { rate }, level: 'yellow' },
      thresholdMetric: 'statements',
    })).toStrictEqual({
      state: 'success',
      description: `Warning: low statements coverage - ${rate}%`,
      target_url: targetUrl,
      context: statusContext,
    });

    expect(parser.generateStatus({
      targetUrl,
      statusContext,
      metric: { branches: { rate }, level: 'green' },
      thresholdMetric: 'branches',
    })).toStrictEqual({
      state: 'success',
      description: `Success: branches coverage - ${rate}%`,
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
        total: 10,
        covered: 1,
        rate: 10,
      },
      lines: {
        total: 10,
        covered: 2,
        rate: 20,
      },
      methods: {
        total: 10,
        covered: 3,
        rate: 30,
      },
      branches: {
        total: 10,
        covered: 4,
        rate: 40,
      },
      level: 'yellow',
    };

    const expectedString = `<!-- coverage-monitor-action: Coverage Report -->
## Coverage Report

|  Totals | ![Coverage](https://img.shields.io/static/v1?label=coverage&message=20%&color=yellow) |
| :-- | :-- |
| Statements: | 10% ( 1 / 10 ) |
| Lines: | 20% ( 2 / 10 ) |
| Methods: | 30% ( 3 / 10 ) |
| Branches: | 40% ( 4 / 10 ) |
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

    expect(prNumber).toStrictEqual(1234);
    expect(prUrl).toStrictEqual('https://example.com');
    expect(sha).toStrictEqual('foo');
  });
});
