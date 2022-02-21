const { generateStatus } = require('../src/checks');

describe(`${generateStatus.name}`, () => {
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

    expect(generateStatus({
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
});
