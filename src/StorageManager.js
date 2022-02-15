const OS = require('os');
const FS = require('fs');
const Path = require('path');

const FileUtil = require('./util/FileUtil');
const JSONFile = require('./util/JSONFile');
const ZeroError = require('./error/ZeroError');
const CacheFile = require('./util/CacheFile');

module.exports = class StorageManager {

  /**
   * @param {import('./ZKit')} kit 
   */
  constructor(kit) {
    this.kit = kit;
    this._cache = {};

    this.kit.handler.on('uninstall:app', (name) => {
      if (FS.existsSync(this.path())) {
        FileUtil.removePath(this.path(), (file, path, relative) => {
          console.log('Remove: ' + relative);
        });
        FS.rmdirSync(this.path());
      }
    });
    this.kit.handler.on('uninstall', () => {
      if (FS.existsSync(this.root)) {
        FileUtil.removePath(this.root, (file, path, relative) => {
          console.log('Remove: ' + relative);
        });
        FS.rmdirSync(this.root);
      }
    });
    this.kit.handler.on('setup', () => {
      this.ensure(this.path(), false);
    });
    this.kit.handler.on('cache:clear', (/** @type {import('../types').T_CacheQuery} */query) => {
      if (query.years) query.date = Date.now() - query.years * 365 * 24 * 60 * 60 * 1000;
      if (query.days) query.date = Date.now() - query.days * 24 * 60 * 60 * 1000;

      for (const file of FS.readdirSync(this.path('cache'))) {
        const json = new JSONFile(this.path('cache', file), false);
        
        if (json.get('date') === null) continue;
        if (query.name === 'all' || query.name === json.get('name') || query.tags && query.tags.find(v => json.get('tags').find(i => i.startsWith(v))) || !query.name && !query.tags) {
          if (!query.date || query.date > json.get('date')) {
            if (!this._cache[json.get('name')] || this._cache[json.get('name')].doClear(query)) {
              json
                .set('date', null)
                .set('data', null)
                .save();
            }
          }
        }
      }
    });
  }

  /**
   * The root of all storage files
   * 
   * @returns {string}
   */
  get root() {
    return Path.join(OS.homedir(), '.zero');
  }

  /**
   * Get a path relative to storage root
   * 
   * @param  {...string} path 
   * @returns {string}
   */
  path(...path) {
    return Path.join(this.root, this.kit.name, ...path);
  }

  /**
   * Ensure the storage directories
   * 
   * @param {string} path
   * @param {boolean} isFile
   * @returns {this}
   */
  ensure(path = null, isFile = true) {
    this.checkApp();
    if (!FS.existsSync(this.root)) {
      FS.mkdirSync(this.root);
    }
    if (!FS.existsSync(this.path())) {
      FS.mkdirSync(this.path());
    }
    if (path) {
      FileUtil.prepareDir(this.path(), path, isFile);
    }
    return this;
  }

  /**
   * Get the config file
   * 
   * @param {string} file
   * @returns {JSONFile}
   */
  config(file) {
    return new JSONFile(this.path(file));
  }

  /**
   * @param {string} name 
   * @param {string[]} tags 
   * @param {Function} builder 
   * @returns {CacheFile}
   */
  setCache(name, tags, builder) {
    if (this._cache[name] === undefined) {
      this._cache[name] = new CacheFile(this.kit, name, tags, this.path('cache', name + '.json'), builder);
    }
    return this._cache[name];
  }

  /**
   * @param {string} name 
   * @returns {CacheFile}
   */
  cache(name) {
    if (this._cache[name] === undefined) throw new ZeroError('No cache with name "' + name + '" defined.');
    return this._cache[name];
  }

  /**
   * @param {(string|import('../types').T_CacheQuery)} query
   */
  clearCache(query = 'all') {
    if (typeof query === 'string') query = {name: query};
    this.kit.handler.emit('cache:clear', query);
  }

  checkApp() {
    if (this.kit.name === null) {
      throw new ZeroError('App must be defined.');
    }
  }

}