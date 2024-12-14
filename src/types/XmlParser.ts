import CoverageItem from './CoverageItem';
import MetricCollection from './MetricCollection';
import xml2js from 'xml2js';

interface XmlNode {
  attributes: Record<string, string | number | boolean>;
  children: Record<string, XmlNode[]>;
  content: string;
}

export default class XmlParser {
  #parser: xml2js.Parser;

  constructor() {
    // noinspection SpellCheckingInspection
    this.#parser = new xml2js.Parser({
      // Normalize all tag names to lowercase.
      normalizeTags: true,
      // Always put child nodes in an array if true; otherwise an array is created only if there is more than one.
      explicitArray: true,
      attrkey: 'attributes',
      charkey: 'content',
      childkey: 'children',
      // Put child elements to separate property (see `childkey`).
      explicitChildren: true,
      // Set this if you want to get the root node in the resulting object.
      explicitRoot: false,
    });
  }

  async #parseXmlFile(buffer: string): Promise<XmlNode> {
    return (await this.#parser.parseStringPromise(buffer)) as XmlNode;
  }

  async parseCloverXml(buffer: string): Promise<MetricCollection<CoverageItem>> {
    const xml = await this.#parseXmlFile(buffer);

    const {
      elements,
      coveredelements,
      statements,
      coveredstatements,
      methods,
      coveredmethods,
      conditionals,
      coveredconditionals,
    } = xml.children.project[0].children.metrics[0].attributes;

    return {
      statements: {total: Number(elements), covered: Number(coveredelements)},
      lines: {total: Number(statements), covered: Number(coveredstatements)},
      methods: {total: Number(methods), covered: Number(coveredmethods)},
      branches: {total: Number(conditionals), covered: Number(coveredconditionals)},
    };
  }
}
