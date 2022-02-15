const JSONFile = require('./JSONFile');

module.exports = class CacheFile {

  /**
   * @param {import('../ZKit')} kit  
   * @param {string} name 
   * @param {string[]} tags
   * @param {string} path 
   * @param {Function} builder 
   */
  constructor(kit, name, tags, path, builder) {
    this.kit = kit;
    this.builder = builder;
    this.file = new JSONFile(path, false);

    this.file.set('name', name);
    this.file.set('tags', tags);
    this.file.save();
  }

  /** @returns {string} */
  get name() {
    return this.file.get('name');
  }

  /** @returns {string[]} */
  get tags() {
    return this.file.get('tags');
  }

  /**
   * @param {import('../../types').T_CacheQuery} query 
   */
  doClear(query) {
    this.file.data = null;
    return true;
  }

  clear() {
    this.kit.handler.emit('cache:clear', {name: this.name});
    return this;
  }

  async get() {
    const date = this.file.get('date');
    if (date === null) {
      this.file.set('data', await this.builder());
      this.file.set('date', Date.now());
      this.kit.handler.emit('cache:build', this);
      this.file.save();
    }
    return this.file.get('data');
  }

}