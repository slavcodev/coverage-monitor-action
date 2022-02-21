const { parseWebhook } = require('../src/github');

describe(`${parseWebhook.name}`, () => {
  it('parses webhook request', async () => {
    expect.hasAssertions();

    const {
      prNumber,
      prUrl,
      sha,
    } = parseWebhook({
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

  const invalidEvents = [
    { scenario: 'undefined request', request: undefined },
    { scenario: 'empty request', request: {} },
    { scenario: 'missing payload', request: { payload: undefined } },
    { scenario: 'invalid payload', request: { payload: {} } },
    { scenario: 'missing pull request', request: { payload: { pull_request: undefined } } },
    { scenario: 'invalid pull request', request: { payload: { pull_request: {} } } },
    {
      scenario: 'missing number',
      request: { payload: { pull_request: { html_url: 'https://example.com', head: { sha: 'foo' } } } },
    },
    {
      scenario: 'missing pull request URL',
      request: { payload: { pull_request: { number: 1234, head: { sha: 'foo' } } } },
    },
    {
      scenario: 'missing head info',
      request: { payload: { pull_request: { number: 1234, html_url: 'https://example.com' } } },
    },
    {
      scenario: 'invalid head sha',
      request: { payload: { pull_request: { number: 1234, html_url: 'https://example.com', head: {} } } },
    },
  ];

  it.each(invalidEvents)('fails on $scenario', async ({ scenario, request }) => {
    expect.hasAssertions();
    expect(() => { parseWebhook(request); }).toThrow(new Error('Action supports only pull_request event'), scenario);
  });
});
