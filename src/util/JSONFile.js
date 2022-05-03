const FS = require('fs');

const JSONError = require('../error/JSONError');
const Reflection = require('./Reflection');

module.exports = class JSONFile {

  /**
   * @param {string} path 
   * @param {boolean} format
   */
  constructor(path, format = true) {
    this.path = path;
    this.format = format;
    this.data = null;
  }

  /**
   * @returns {this}
   */
  load() {
    if (FS.existsSync(this.path) && FS.statSync(this.path).size > 0) {
      let src = null;
      try {
        src = FS.readFileSync(this.path);
        this.data = JSON.parse(src);
      } catch (error) {
        throw new JSONError('kit.jsonfile.load.exist', 'JSON file not in format or don`t exist.', {file: this.path, error}, src);
      }
    } else {
      this.data = null;
    }
    return this;
  }

  /**
   * @returns {this}
   */
  save() {
    if (this.isEmpty()) {
      FS.writeFileSync(this.path, '');
    } else if (this.format) {
      FS.writeFileSync(this.path, JSON.stringify(this.data, null, '  '));
    } else {
      FS.writeFileSync(this.path, JSON.stringify(this.data));
    }
    return this;
  }

  isEmpty() {
    if (this.data === null) this.load();
    return this.data === null;
  }

  /**
   * @param {string} name 
   * @param {*} fallback 
   */
  get(name, fallback = null) {
    if (this.data === null) this.load();
    return Reflection.getDeep(this.data, name, fallback);
  }

  /**
   * @param {string} name 
   * @param {*} value
   * @returns {this}
   */
  set(name, value) {
    if (this.data === null) this.load();
    if (this.data === null) this.data = {};
    Reflection.setDeep(this.data, name, value);
    return this;
  }

  /**
   * @param {string} name 
   * @returns {this}
   */
  remove(name) {
    Reflection.removeDeepRecursive(this.data, name);
    return this;
  }
  
}