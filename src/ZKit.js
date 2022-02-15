const Handler = require('events');
const FS = require('fs');

const Input = require('./cli/Input');
const ZeroError = require('./error/ZeroError');
const Color = require('./cli/Color');

module.exports = class ZKit {

  constructor() {
    this.handler = new Handler();
    this.name = null;
    this.title = null;
    this.app = null;
    this.storage = null;
  }

  /**
   * Patch the event handler to emit always a 'debug:event' event before execution
   * 
   * @param {Function}
   */
  setDebugHandler(listener = null) {
    const old = this.handler.emit;
    const handler = this.handler;
    this.handler.emit = function() {
      old.call(handler, 'debug:event', ...arguments);
      old.apply(handler, arguments);
    };
    if (listener) this.handler.on('debug:event', listener);
  }

  /**
   * @param {string} name 
   * @param {string} title
   * @param {*} app
   * @returns {this} 
   */
  setApp(name, title, app) {
    this.name = name;
    this.title = title;
    this.app = app;
    return this;
  }

  async setup() {
    const StorageManager = require('./StorageManager');
    this.storage = new StorageManager(this);
    this.handler.emit('setup');
    this.handler.emit('setup:cache');
  }

  async uninstall() {
    if (this.name === null) {
      throw new ZeroError('App must be defined.');
    }
    const answer = await Input.input('Are you sure to delete all configs regarding the {title}? (y/n): ', Input.optionsBoolean({placeholders: {title: this.title}}));
    if (!answer) {
      console.log(Color.out('abort', 'Abort uninstall of {title}', {title: this.title}));
      return;
    }
    this.handler.emit('uninstall:app:' + this.name, this.name);
    this.handler.emit('uninstall:app', this.name);
    if (FS.existsSync(this.storage.root)) {
      if (FS.readdirSync(this.storage.root).length === 0) {
        console.log(Color.out('note', 'There are no configs from zero packages.'))
        const answer = await Input.input('Do you want to clean up all zero config files? (y/n): ', Input.optionsBoolean());
        if (!answer) {
          console.log(Color.out('abort', 'Abort cleanup', {title: this.title}));
          return;
        }
        this.handler.emit('uninstall');
      }
    }
  }

}