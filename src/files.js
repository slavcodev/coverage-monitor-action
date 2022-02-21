const fs = require('fs/promises');
const path = require('path');
const { parseCloverXml } = require('./xml');
const { parseJsonSummary } = require('./json');
const { formats } = require('./consts');

async function readFile(workingDir, filename) {
  // TODO: `.replace('\ufeff', ''))`
  return fs.readFile(path.join(workingDir, filename), { encoding: 'utf-8' });
}

function guessFormat(filename) {
  switch (filename.substring(filename.lastIndexOf('.') + 1)) {
    case 'xml':
      return formats.FORMAT_CLOVER;
    case 'json':
      return formats.FORMAT_JSON_SUMMARY;
    default:
      throw new Error(`Cannot guess format of "${filename}"`);
  }
}

async function parseFile(workingDir, filename, format) {
  switch (format) {
    case formats.FORMAT_AUTO:
      return parseFile(workingDir, filename, guessFormat(filename));
    case formats.FORMAT_CLOVER:
      return parseCloverXml(await readFile(workingDir, filename));
    case formats.FORMAT_JSON_SUMMARY:
      return parseJsonSummary(await readFile(workingDir, filename));
    default:
      throw new Error(
        `Invalid option \`coverage_format\` - supported ${Object.values(formats).join(', ')}`,
      );
  }
}

module.exports = {
  parseFile,
};
