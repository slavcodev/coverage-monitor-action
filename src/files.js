const fs = require('fs/promises');
const path = require('path');
const { parseCloverXml } = require('./xml');

async function readFile(workingDir, filename) {
  // TODO: `.replace('\ufeff', ''))`
  return fs.readFile(path.join(workingDir, filename), { encoding: 'utf-8' });
}

async function parseFile(workingDir, filename) {
  return parseCloverXml(await readFile(workingDir, filename));
}

module.exports = {
  parseFile,
};
