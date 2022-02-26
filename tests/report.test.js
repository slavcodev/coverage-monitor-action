const { generateReport, calculateLevel } = require('../src/report');

describe(`${generateReport.name}`, () => {
  const coverageCases = [
    {
      threshold: { alert: 6000, warning: 8000 },
      coverage: {
        lines: { total: 34, covered: 24 },
        statements: { total: 66, covered: 45 },
        methods: { total: 12, covered: 10 },
        branches: { total: 20, covered: 11 },
      },
      expectedReport: {
        threshold: { alert: 6000, warning: 8000 },
        metrics: {
          lines: {
            total: 34,
            covered: 24,
            rate: 7059,
            level: 'yellow',
          },
          statements: {
            total: 66,
            covered: 45,
            rate: 6818,
            level: 'yellow',
          },
          methods: {
            total: 12,
            covered: 10,
            rate: 8333,
            level: 'green',
          },
          branches: {
            total: 20,
            covered: 11,
            rate: 5500,
            level: 'red',
          },
        },
      },
    },
    {
      threshold: { alert: 1, warning: 8000 },
      coverage: {
        lines: { total: 10, covered: 9 },
        statements: { total: 12, covered: 11 },
        methods: { total: 4, covered: 3 },
        branches: { total: 0, covered: 0 },
      },
      expectedReport: {
        threshold: { alert: 1, warning: 8000 },
        metrics: {
          lines: {
            total: 10,
            covered: 9,
            rate: 9000,
            level: 'green',
          },
          statements: {
            total: 12,
            covered: 11,
            rate: 9167,
            level: 'green',
          },
          methods: {
            total: 4,
            covered: 3,
            rate: 7500,
            level: 'yellow',
          },
          branches: {
            total: 0,
            covered: 0,
            rate: 0,
            level: 'red',
          },
        },
      },
    },
  ];

  it.each(coverageCases)('parses clover xml: $threshold', async ({ threshold, coverage, expectedReport }) => {
    expect.hasAssertions();
    expect(generateReport(threshold, coverage)).toStrictEqual(expectedReport);
  });
});

describe(`${calculateLevel.name}`, () => {
  const defaultThreshold = { alert: 50, warning: 90 };

  it.each([
    { rate: 49, threshold: defaultThreshold, level: 'red' },
    { rate: 50, threshold: defaultThreshold, level: 'yellow' },
    { rate: 51, threshold: defaultThreshold, level: 'yellow' },
    { rate: 89, threshold: defaultThreshold, level: 'yellow' },
    { rate: 90, threshold: defaultThreshold, level: 'green' },
    { rate: 91, threshold: defaultThreshold, level: 'green' },
    { rate: 100, threshold: defaultThreshold, level: 'green' },
    { rate: 95, threshold: { ...defaultThreshold, alert: 0 }, level: 'green' },
  ])('calculates level $rate with $threshold is $level', async ({ rate, threshold, level }) => {
    expect.hasAssertions();
    expect(calculateLevel(rate, threshold)).toBe(level);
  });
});
