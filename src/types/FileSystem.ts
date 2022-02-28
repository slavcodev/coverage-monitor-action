import CoverageSummary from './CoverageSummary';
import Format from './Format';
import JsonParser from './JsonParser';
import XmlParser from './XmlParser';
import fs from 'fs/promises';
import path from 'path';

export default class FileSystem {
  #xmlParser: XmlParser;
  #jsonParser: JsonParser;

  constructor(readonly workingDir: string) {
    this.#xmlParser = new XmlParser();
    this.#jsonParser = new JsonParser();
  }

  async readFile(filename: string): Promise<string> {
    return (await fs.readFile(path.join(this.workingDir, filename), {encoding: 'utf-8'})).replace('\ufeff', '');
  }

  guessFormat(filename: string): Format {
    switch (filename.substring(filename.lastIndexOf('.') + 1)) {
      case 'xml':
        return Format.Clover;
      case 'json':
        return Format.JsonSummary;
      default:
        throw new Error(`Cannot guess format of "${filename}"`);
    }
  }

  async parseFile(filename: string, format: string): Promise<CoverageSummary> {
    switch (format) {
      case Format.Auto:
        return this.parseFile(filename, this.guessFormat(filename));
      case Format.Clover:
        return new CoverageSummary(await this.#xmlParser.parseCloverXml(await this.readFile(filename)));
      case Format.JsonSummary:
        return new CoverageSummary(await this.#jsonParser.parseJsonSummary(await this.readFile(filename)));
      default:
        throw new Error(`Invalid option "coverage_format" - supported ${Object.values(Format).join(', ')}`);
    }
  }
}
