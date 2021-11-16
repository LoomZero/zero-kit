const ZeroError = require('./ZeroError');

module.exports = class JSONError extends ZeroError {

  /**
   * @param {string} message 
   * @param {*} context 
   * @param {string} src 
   */
  constructor(message, context = {}, src = null) {
    super(message, context);
    this.src = src;
  }

}