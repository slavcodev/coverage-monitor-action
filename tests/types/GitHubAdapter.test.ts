import Configuration from '../../src/types/Configuration';
import GitHub from '../../src/types/github/GitHub';
import GitHubAdapter from '../../src/types/github/GitHubAdapter';

describe(`${GitHubAdapter.name}`, () => {
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
    workingDir: process.cwd(),
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

  const core = (input: Record<string, string> = {}): GitHub => ({
    isDebug(): boolean {
      return true;
    },
    debug(message: string): void {
      console.debug(message);
    },
    getInput(name: string, {required}: {required?: boolean} = {}): string {
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
      input: {github_token: '***', coverage_path: 'clover.xml'},
      expected: {...defaultOutput, githubToken: '***', coveragePath: 'clover.xml'},
    },
    {
      scenario: 'defaults',
      input: {...defaultInput, github_token: '***', coverage_path: 'clover.xml'},
      expected: {...defaultOutput, githubToken: '***', coveragePath: 'clover.xml'},
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
      scenario: 'default metric when not set',
      input: {
        ...defaultInput,
        github_token: '***',
        coverage_path: 'clover.xml',
        threshold_metric: undefined,
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
        check: 'true',
        comment: 'false',
      },
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'clover.xml',
        comment: undefined,
      },
    },
    {
      scenario: 'values required coercing (on/off)',
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
      scenario: 'values required coercing (yes/no)',
      input: {
        ...defaultInput,
        github_token: '***',
        coverage_path: 'clover.xml',
        check: 'yes',
        comment: 'no',
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
      scenario: 'default comment mode when not set',
      input: {
        ...defaultInput,
        github_token: '***',
        coverage_path: 'clover.xml',
        comment_mode: undefined,
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
      input: {github_token: '***', clover_file: 'clover.xml'},
      expected: {...defaultOutput, githubToken: '***', coveragePath: 'clover.xml'},
    },
    {
      scenario: 'coverage `auto` format',
      input: {github_token: '***', coverage_path: 'coverage-summary.json', coverage_format: 'auto'},
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'coverage-summary.json',
        coverageFormat: 'auto',
      },
    },
    {
      scenario: 'coverage `json-summary` format',
      input: {github_token: '***', coverage_path: 'coverage-summary.json', coverage_format: 'json-summary'},
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'coverage-summary.json',
        coverageFormat: 'json-summary',
      },
    },
    {
      scenario: 'coverage `clover` format',
      input: {github_token: '***', coverage_path: 'clover.xml', coverage_format: 'clover'},
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'clover.xml',
        coverageFormat: 'clover',
      },
    },
    {
      scenario: 'no alerts',
      input: {github_token: '***', coverage_path: 'clover.xml', threshold_alert: 0},
      expected: {
        ...defaultOutput,
        githubToken: '***',
        coveragePath: 'clover.xml',
        threshold: {...defaultOutput.threshold, alert: 0},
      },
    },
  ] as {
    scenario: string;
    input: Record<string, string>;
    expected: Configuration;
  }[])('loads config with $scenario', async ({scenario, input, expected}) => {
    expect.hasAssertions();
    const github = new GitHubAdapter(core(input));
    try {
      expect({...github.loadConfig()}).toStrictEqual(expected);
    } catch (e) {
      throw new Error(scenario);
    }
  });

  it.each([
    {
      error: 'The `clover_file` option is deprecated and cannot be set along with `coverage_path`',
      input: {github_token: '***', coverage_path: 'coverage-summary.json', clover_file: 'clover.xml'},
    },
    {
      error: 'Missing or invalid option `coverage_path`',
      input: {github_token: '***'},
    },
    {
      error: 'Invalid option "coverage_format" - supported auto, clover, json-summary',
      input: {github_token: '***', coverage_path: 'coverage-summary.json', coverage_format: 'foo'},
    },
    {
      error: 'Invalid option "threshold_metric" - supported lines, statements, branches, methods',
      input: {github_token: '***', coverage_path: 'clover.xml', threshold_metric: 'foo'},
    },
    {
      error: 'Invalid option "comment_mode" - supported replace, insert, update',
      input: {github_token: '***', coverage_path: 'clover.xml', comment_mode: 'foo'},
    },
  ] as {
    error: string;
    input: Record<string, string>;
  }[])('fails on error: "$error"', async ({error, input}) => {
    expect.hasAssertions();
    const github = new GitHubAdapter(core(input));
    expect(() => github.loadConfig()).toThrow(error);
  });

  it.each([
    {scenario: 'not a pull request event', request: {payload: {}}, expected: undefined},
    {
      scenario: 'not a pull request event (explicit)',
      request: {payload: {pull_request: undefined}},
      expected: undefined,
    },
    {
      scenario: 'pull request event',
      request: {payload: {pull_request: {number: 1234, html_url: 'https://example.com', head: {sha: 'foo'}}}},
      expected: {number: 1234, url: 'https://example.com', sha: 'foo'},
    },
  ] as {
    scenario: string;
    request: {};
    expected: {};
  }[])('parses webhook request on $scenario', async ({scenario, request, expected}) => {
    expect.hasAssertions();
    const github = new GitHubAdapter(core());
    try {
      expect(github.parseWebhook(request)).toStrictEqual(expected);
    } catch (e) {
      throw new Error(scenario);
    }
  });

  it.each([
    {scenario: 'undefined request', request: undefined, error: 'Invalid github event'},
    {scenario: 'empty request', request: {}, error: 'Invalid github event'},
    {scenario: 'missing payload', request: {payload: undefined}, error: 'Invalid github event'},
    {
      scenario: 'invalid pull request',
      request: {payload: {pull_request: {}}},
      error: 'Invalid pull_request event',
    },
    {
      scenario: 'missing number',
      request: {payload: {pull_request: {html_url: 'https://example.com', head: {sha: 'foo'}}}},
      error: 'Invalid pull_request event',
    },
    {
      scenario: 'missing pull request URL',
      request: {payload: {pull_request: {number: 1234, head: {sha: 'foo'}}}},
      error: 'Invalid pull_request event',
    },
    {
      scenario: 'missing head info',
      request: {payload: {pull_request: {number: 1234, html_url: 'https://example.com'}}},
      error: 'Invalid pull_request event',
    },
    {
      scenario: 'invalid head sha',
      request: {payload: {pull_request: {number: 1234, html_url: 'https://example.com', head: {}}}},
      error: 'Invalid pull_request event',
    },
  ] as {
    scenario: string;
    request: {};
    error: string;
  }[])('fails on parse webhook request on $scenario', async ({scenario, request, error}) => {
    expect.hasAssertions();
    const github = new GitHubAdapter(core());
    try {
      expect(() => github.parseWebhook(request)).toThrow(new Error(error));
    } catch (e) {
      throw new Error(scenario);
    }
  });
});
