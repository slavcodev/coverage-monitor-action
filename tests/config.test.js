const { loadConfig } = require('../src/config');

describe(`${loadConfig.name}`, () => {
  const workingDir = process.cwd();

  const defaultInput = {
    threshold_alert: 50,
    threshold_warning: 90,
    threshold_metric: 'lines',
    check: true,
    status_context: 'Coverage Report',
    comment: true,
    comment_context: 'Coverage Report',
    comment_mode: 'replace',
  };

  const defaultOutput = {
    workingDir,
    coverageFormat: 'auto',
    threshold: {
      alert: 5000,
      warning: 9000,
      metric: 'lines',
    },
    comment: {
      context: 'Coverage Report',
      mode: 'replace',
    },
    check: {
      context: 'Coverage Report',
    },
  };

  const core = (input) => ({
    getInput(name, { required } = {}) {
      const value = input[name];

      if (required && value === undefined) {
        throw new Error(`Missing options ${name}`);
      }

      return value;
    },
  });

  it.each([
    {
      scenario: 'minimum set',
      input: { github_token: '***', coverage_path: 'clover.xml' },
      expected: { ...defaultOutput, githubToken: '***', coveragePath: 'clover.xml' },
    },
    {
      scenario: 'defaults',
      input: { ...defaultInput, github_token: '***', coverage_path: 'clover.xml' },
      expected: { ...defaultOutput, githubToken: '***', coveragePath: 'clover.xml' },
    },
    {
      scenario: 'neither check nor comment',
      input: {
        ...defaultInput,
        github_token: '***',
        coverage_path: 'clover.xml',
        check: false,
        comment: false,
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'clover.xml',
        check: undefined,
        comment: undefined,
      },
    },
    {
      scenario: 'specific threshold values',
      input: {
        ...defaultInput,
        github_token: '***',
        coverage_path: 'clover.xml',
        threshold_alert: 10,
        threshold_warning: 20,
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'clover.xml',
        threshold: {
          alert: 1000,
          warning: 2000,
          metric: 'lines',
        },
      },
    },
    {
      scenario: 'specific threshold metric',
      input: {
        ...defaultInput,
        github_token: '***',
        coverage_path: 'clover.xml',
        threshold_metric: 'branches',
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'clover.xml',
        threshold: {
          alert: 5000,
          warning: 9000,
          metric: 'branches',
        },
      },
    },
    {
      scenario: 'default metric when unsupported is set',
      input: {
        ...defaultInput,
        github_token: '***',
        coverage_path: 'clover.xml',
        threshold_metric: 'foo',
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'clover.xml',
        threshold: {
          alert: 5000,
          warning: 9000,
          metric: 'lines',
        },
      },
    },
    {
      scenario: 'working dir',
      input: {
        ...defaultInput,
        github_token: '***',
        coverage_path: 'clover.xml',
        working_dir: 'foo',
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'clover.xml',
        workingDir: 'foo',
      },
    },
    {
      scenario: 'values required coercing',
      input: {
        ...defaultInput,
        github_token: '***',
        coverage_path: 'clover.xml',
        check: 'on',
        comment: 'off',
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'clover.xml',
        comment: undefined,
      },
    },
    {
      scenario: 'specific comment',
      input: {
        ...defaultInput,
        github_token: '***',
        coverage_path: 'clover.xml',
        comment_context: 'Foobar',
        comment_mode: 'insert',
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'clover.xml',
        comment: {
          context: 'Foobar',
          mode: 'insert',
        },
      },
    },
    {
      scenario: 'default comment mode when unsupported is set',
      input: {
        ...defaultInput,
        github_token: '***',
        coverage_path: 'clover.xml',
        comment_mode: 'foo',
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'clover.xml',
        comment: {
          context: 'Coverage Report',
          mode: 'replace',
        },
      },
    },
    {
      scenario: 'deprecated clover file',
      input: { github_token: '***', clover_file: 'clover.xml' },
      expected: { ...defaultOutput, githubToken: '***', coveragePath: 'clover.xml' },
    },
    {
      scenario: 'coverage `auto` format',
      input: { github_token: '***', coverage_path: 'coverage-summary.json', coverage_format: 'auto' },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'coverage-summary.json',
        coverageFormat: 'auto',
      },
    },
    {
      scenario: 'coverage `json-summary` format',
      input: { github_token: '***', coverage_path: 'coverage-summary.json', coverage_format: 'json-summary' },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'coverage-summary.json',
        coverageFormat: 'json-summary',
      },
    },
    {
      scenario: 'coverage `clover` format',
      input: { github_token: '***', coverage_path: 'clover.xml', coverage_format: 'clover' },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'clover.xml',
        coverageFormat: 'clover',
      },
    },
  ])('loads config with $scenario', async ({ scenario, input, expected }) => {
    expect.hasAssertions();
    expect(loadConfig(core(input))).toStrictEqual(expected, scenario);
  });

  it.each([
    {
      error: 'The `clover_file` option is deprecated and cannot be set along with `coverage_path`',
      input: { github_token: '***', coverage_path: 'coverage-summary.json', clover_file: 'clover.xml' },
    },
    {
      error: 'Missing or invalid option `coverage_path`',
      input: { github_token: '***' },
    },
    {
      error: 'Invalid option `coverage_format`, supported `clover` and `json-summary`',
      input: { github_token: '***', coverage_path: 'coverage-summary.json', coverage_format: 'foo' },
    },
  ])('fails on error: "$error"', async ({ error, input }) => {
    expect.hasAssertions();
    expect(() => loadConfig(core(input))).toThrow(error);
  });
});
