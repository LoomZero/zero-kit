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
    this.name = name;
    this.tags = tags;
    this.builder = builder;
    this.file = new JSONFile(path, false);
  }

  /**
   * @param {import('../../types').T_CacheQuery} query 
   */
  doClear(query) {
    if (this.file.get('date') === null) return;
    if (query.name === 'all' || query.name === this.name || query.tags && query.tags.find(v => this.tags.find(i => i.startsWith(v))) || !query.name && !query.tags) {
      if (!query.date || query.date > this.file.get('date')) {
        this.file.set('date', null).save();
      }
    }
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