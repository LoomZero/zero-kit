const DependencyError = require('../error/DependencyError');

module.exports = class CLITable {

  static get Table() {
    if (this._PackageCLITable !== undefined) return this._PackageCLITable;
    try {
      this._PackageCLITable = require('cli-table');
    } catch (error) {
      throw new DependencyError('zero-kit/src/cli/CLITable', 'cli-table', null, { error }).logError();
    }
    return this._PackageCLITable;
  }

  /**
   * @param {Object<string, string>} header 
   */
  constructor(header) {
    this.header = header;

    const head = [];
    for (const id in this.header) {
      head.push(this.header[id]);
    }

    this.table = new CLITable.Table({
      head: head,
    });
  }

  /**
   * @param  {...Object<string, string>} items 
   * @returns {this}
   */
  add(...items) {
    for (const item of items) {
      if (Array.isArray(item)) {
        if (item.length === 0) {
          this.table.push(['']);
        } else {
          this.table.push(item.map(v => v + ''));
        }
      } else {
        const value = [];
        for (const id in this.header) {
          value.push((item[id] || '') + '');
        }
        this.table.push(value);
      }
    }
    return this;
  }

  /**
   * @returns {this}
   */
  log() {
    console.log(this.table.toString());
    return this;
  }

}