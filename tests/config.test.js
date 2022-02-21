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
      input: { github_token: '***', clover_file: 'clover.xml' },
      expected: { ...defaultOutput, githubToken: '***', cloverFile: 'clover.xml' },
    },
    {
      scenario: 'defaults',
      input: { ...defaultInput, github_token: '***', clover_file: 'clover.xml' },
      expected: { ...defaultOutput, githubToken: '***', cloverFile: 'clover.xml' },
    },
    {
      scenario: 'neither check nor comment',
      input: {
        ...defaultInput,
        github_token: '***',
        clover_file: 'clover.xml',
        check: false,
        comment: false,
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        cloverFile: 'clover.xml',
        check: undefined,
        comment: undefined,
      },
    },
    {
      scenario: 'specific threshold values',
      input: {
        ...defaultInput,
        github_token: '***',
        clover_file: 'clover.xml',
        threshold_alert: 10,
        threshold_warning: 20,
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        cloverFile: 'clover.xml',
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
        clover_file: 'clover.xml',
        threshold_metric: 'branches',
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        cloverFile: 'clover.xml',
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
        clover_file: 'clover.xml',
        threshold_metric: 'foo',
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        cloverFile: 'clover.xml',
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
        clover_file: 'clover.xml',
        working_dir: 'foo',
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        cloverFile: 'clover.xml',
        workingDir: 'foo',
      },
    },
    {
      scenario: 'values required coercing',
      input: {
        ...defaultInput,
        github_token: '***',
        clover_file: 'clover.xml',
        check: 'on',
        comment: 'off',
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        cloverFile: 'clover.xml',
        comment: undefined,
      },
    },
    {
      scenario: 'specific comment',
      input: {
        ...defaultInput,
        github_token: '***',
        clover_file: 'clover.xml',
        comment_context: 'Foobar',
        comment_mode: 'insert',
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        cloverFile: 'clover.xml',
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
        clover_file: 'clover.xml',
        comment_mode: 'foo',
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        cloverFile: 'clover.xml',
        comment: {
          context: 'Coverage Report',
          mode: 'replace',
        },
      },
    },
  ])('loads config with $scenario', async ({ scenario, input, expected }) => {
    expect.hasAssertions();
    expect(loadConfig(core(input))).toStrictEqual(expected, scenario);
  });
});
