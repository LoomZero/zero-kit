const ZeroError = require('./ZeroError');

module.exports = class JSONError extends ZeroError {

  /**
   * @param {string} ident
   * @param {string} message 
   * @param {*} context 
   * @param {string} src 
   */
  constructor(ident, message, context = {}, src = null) {
    super(ident, message, context);
    this.src = src;
  }

}