const JSONFile = require('./JSONFile');

module.exports = class CacheFile {

  /**
   * @param {import('../ZKit')} kit  
   * @param {string} name 
   * @param {string[]} tags
   * @param {string} path 
   * @param {Function} builder 
   * @param {(string|Function)} contextBuilder
   */
  constructor(kit, name, tags, path, builder, contextBuilder = 'default') {
    this.kit = kit;
    this.builder = builder;
    this.contextBuilder = typeof contextBuilder === 'string' ? () => {return contextBuilder} : contextBuilder;
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

  async get(...args) {
    const date = this.file.get('date');
    const key = this.contextBuilder(...args);

    if (date === null || this.file.get('data.' + key) === null) {
      if (this.file.get('data') === null) this.file.set('data', {});
      this.file.set('data.' + key, await this.builder(...args));
      if (date === null) this.file.set('date', Date.now());
      this.kit.handler.emit('cache:build', this.name, key, this);
      this.file.save();
    } else {
      this.kit.handler.emit('cache:use', this.name, key, this);
    }
    return this.file.get('data.' + key);
  }

}