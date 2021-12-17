module.exports = class ZeroError extends Error {

  /**
   * @param {string} message 
   * @param {*} context 
   */
  constructor(message, context = {}) {
    super(message);
    this.context = context;
  }

  /**
   * @returns {string}
   */
  info() {
    return this.message + ' ' + JSON.stringify(this.context);
  }

}