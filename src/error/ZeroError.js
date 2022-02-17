const Reflection = require('../util/Reflection');

module.exports = class ZeroError extends Error {

  /**
   * @param {string} ident
   * @param {string} message 
   * @param {*} context 
   */
  constructor(ident, message, context = {}) {
    super(message);
    this.ident = ident;
    this.context = context;
  }

  get isZero() {return true}

  /**
   * @param {string} ident 
   * @returns {boolean}
   */
  is(ident) {
    return this.ident.startsWith(ident);
  }

  /**
   * @returns {string}
   */
  info() {
    return '[' + this.ident + '] ' + this.message + ' ' + JSON.stringify(this.context);
  }

  toDebug() {
    return JSON.stringify(Reflection.debugContext(this.context));
  }

}