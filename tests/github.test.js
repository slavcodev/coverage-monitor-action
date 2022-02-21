const { parseWebhook } = require('../src/github');

describe(`${parseWebhook.name}`, () => {
  const validEvents = [
    { scenario: 'not a pull request event', request: { payload: {} }, expected: { pr: undefined } },
    {
      scenario: 'not a pull request event (explicit)',
      request: { payload: { pull_request: undefined } },
      expected: { pr: undefined },
    },
    {
      scenario: 'pull request event',
      request: { payload: { pull_request: { number: 1234, html_url: 'https://example.com', head: { sha: 'foo' } } } },
      expected: { pr: { number: 1234, url: 'https://example.com', sha: 'foo' } },
    },
  ];

  it.each(validEvents)('succeed on $scenario', async ({ scenario, request, expected }) => {
    expect.hasAssertions();
    expect(parseWebhook(request)).toStrictEqual(expected, scenario);
  });

  const invalidEvents = [
    { scenario: 'undefined request', request: undefined, error: 'Invalid github event' },
    { scenario: 'empty request', request: {}, error: 'Invalid github event' },
    { scenario: 'missing payload', request: { payload: undefined }, error: 'Invalid github event' },
    {
      scenario: 'invalid pull request',
      request: { payload: { pull_request: {} } },
      error: 'Invalid pull_request event',
    },
    {
      scenario: 'missing number',
      request: { payload: { pull_request: { html_url: 'https://example.com', head: { sha: 'foo' } } } },
      error: 'Invalid pull_request event',
    },
    {
      scenario: 'missing pull request URL',
      request: { payload: { pull_request: { number: 1234, head: { sha: 'foo' } } } },
      error: 'Invalid pull_request event',
    },
    {
      scenario: 'missing head info',
      request: { payload: { pull_request: { number: 1234, html_url: 'https://example.com' } } },
      error: 'Invalid pull_request event',
    },
    {
      scenario: 'invalid head sha',
      request: { payload: { pull_request: { number: 1234, html_url: 'https://example.com', head: {} } } },
      error: 'Invalid pull_request event',
    },
  ];

  it.each(invalidEvents)('fails on $scenario', async ({ scenario, request, error }) => {
    expect.hasAssertions();
    expect(() => { parseWebhook(request); }).toThrow(new Error(error), scenario);
  });
});
