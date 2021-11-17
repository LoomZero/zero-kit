const OS = require('os');
const FS = require('fs');
const Path = require('path');

const FileUtil = require('./util/FileUtil');
const JSONFile = require('./util/JSONFile');
const ZeroError = require('./error/ZeroError');

module.exports = class StorageManager {

  /**
   * @param {import('./ZKit')} kit 
   */
  constructor(kit) {
    this.kit = kit;

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

  checkApp() {
    if (this.kit.name === null) {
      throw new ZeroError('App must be defined.');
    }
  }

}