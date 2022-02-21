const path = require('path');
const { loadConfig } = require('../src/config');

describe(`${loadConfig.name}`, () => {
  const workingDir = path.join(__dirname, '..');

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
      workingDir: 'foo',
      thresholdAlert: 10,
      thresholdWarning: 20,
      thresholdMetric: 'branches',
      statusContext: 'Coverage',
      commentContext: 'Coverage Report',
      commentMode: 'replace',
    };

    const reader = createConfigReader(inputs);
    const config = loadConfig(reader);

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
      workingDir,
      thresholdAlert: 90,
      thresholdWarning: 50,
      thresholdMetric: 'lines',
      statusContext: 'Coverage Report',
      commentContext: 'Coverage Report',
      commentMode: 'replace',
    };

    const reader = createConfigReader(inputs);
    const config = loadConfig(reader);

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
      workingDir,
      thresholdAlert: 10,
      thresholdWarning: 20,
      thresholdMetric: 'branches',
      statusContext: 'Coverage',
      commentContext: 'Coverage Report',
      commentMode: 'replace',
    };

    const reader = createConfigReader(inputs);
    const config = loadConfig(reader);

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
      workingDir,
      thresholdAlert: 90,
      thresholdWarning: 50,
      thresholdMetric: 'lines',
      statusContext: 'Coverage Report',
      commentContext: 'Coverage Report',
      commentMode: 'replace',
    };

    const reader = createConfigReader(inputs);
    const config = loadConfig(reader);

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
      workingDir,
      thresholdAlert: 90,
      thresholdWarning: 50,
      thresholdMetric: 'lines',
      statusContext: 'Coverage Report',
      commentContext: 'Coverage Report',
      commentMode: 'replace',
    };

    const reader = createConfigReader(inputs);
    const config = loadConfig(reader);

    expect(config).toStrictEqual(expected);
  });
});
