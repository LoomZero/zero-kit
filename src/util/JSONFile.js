const FS = require('fs');
const JSONError = require('../error/JSONError');
const Reflection = require('./Reflection');
const ZKit = require('../../index');

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
    if (FS.existsSync(this.path)) {
      let src = null;
      try {
        src = FS.readFileSync(this.path);
        this.data = JSON.parse(src); 
      } catch (e) {
        throw new JSONError('JSON file not in format or don`t exist.', {file: this.path}, src);
      }
    } else {
      this.data = {};
    }
    return this;
  }

  /**
   * @returns {this}
   */
  save() {
    ZKit.storage.ensure(this.path);
    if (this.format) {
      FS.writeFileSync(this.path, JSON.stringify(this.data, null, '  '));
    } else {
      FS.writeFileSync(this.path, JSON.stringify(this.data));
    }
    return this;
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