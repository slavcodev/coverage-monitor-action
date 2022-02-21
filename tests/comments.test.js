const {
  generateBadgeUrl,
  generateEmoji,
  generateCommentHeader,
  generateTable,
} = require('../src/comments');

describe(`${generateBadgeUrl.name}`, () => {
  it('generates badge URL', async () => {
    expect.hasAssertions();

    expect(generateBadgeUrl({ rate: 940, level: 'green' })).toBe(
      'https://img.shields.io/static/v1?label=coverage&message=9%&color=green',
    );
  });
});

describe(`${generateEmoji.name}`, () => {
  it.each([
    { expected: ' 🎉', metric: { rate: 10000 } },
    { expected: '', metric: { rate: 9999 } },
  ])('generates emoji $expected', async ({ expected, metric }) => {
    expect.hasAssertions();
    expect(generateEmoji(metric)).toBe(expected);
  });
});

describe(`${generateCommentHeader.name}`, () => {
  it('generates header', async () => {
    expect.hasAssertions();
    expect(generateCommentHeader({ commentContext: 'foobar' })).toBe(`<!-- coverage-monitor-action: foobar -->`);
  });
});

describe(`${generateTable.name}`, () => {
  it('generates table', async () => {
    expect.hasAssertions();

    const report = {
      threshold: { alert: 0, warning: 50, metric: 'lines' },
      metrics: {
        statements: {
          total: 10,
          covered: 1,
          rate: 1000,
          level: 'yellow',
        },
        lines: {
          total: 10,
          covered: 2,
          rate: 2000,
          level: 'yellow',
        },
        methods: {
          total: 10,
          covered: 3,
          rate: 3000,
          level: 'yellow',
        },
        branches: {
          total: 10,
          covered: 4,
          rate: 4000,
          level: 'yellow',
        },
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

    expect(generateTable({ report, commentContext: 'Coverage Report' })).toBe(expectedString);
  });

  it('hides metric rows in table when metric is not available (total is zero)', async () => {
    expect.hasAssertions();

    const report = {
      threshold: { alert: 30, warning: 50, metric: 'branches' },
      metrics: {
        statements: {
          total: 10,
          covered: 1,
          rate: 1000,
          level: 'red',
        },
        lines: {
          total: 10,
          covered: 2,
          rate: 2000,
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
          rate: 4000,
          level: 'yellow',
        },
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

    expect(generateTable({ report, commentContext: 'Coverage Report' })).toBe(expectedString);
  });
});
