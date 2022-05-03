const ZeroError = require('../error/ZeroError');
const Reflection = require('./Reflection');

module.exports = class LoggerChannel {

  /**
   * @param {import('./FileLogger')} logger 
   * @param {string} channel
   */
  constructor(logger, channel) {
    this.logger = logger;
    this.channel = channel;
  }

  /**
   * @param {string} title 
   * @param {string} char 
   */
  section(title, char = '#') {
    this.logger.writeSection(title, char);
  }

  /**
   * @param {string} type 
   * @param {string} message
   * @param {(string[]|Object<string, string>)} placeholders
   */
  log(type, message, placeholders) {
    this.logger.write(type, this.channel, Reflection.replaceMessage(message, placeholders));
  }

  /**
   * @param {string} message
   * @param {(string[]|Object<string, string>)} placeholders
   */
  info(message, placeholders) {
    this.log('info', message, placeholders);
  }

  /**
   * @param {string} message
   * @param {(string[]|Object<string, string>)} placeholders
   */
  warn(message, placeholders) {
    this.log('warn', message, placeholders);
  }

  /**
   * @param {(string|Error)} message 
   * @param {(string[]|Object<string, string>)} placeholders 
   * @param {Error} error
   */
  error(message, placeholders, error = null) {
    if (message instanceof Error) {
      error = message;
      if (message instanceof ZeroError) { 
        message = message.info();
      } else {
        message = '';
      }
    }
    if (error !== null) {
      message += "\nMore:\n" + error;
    }
    this.log('error', message, placeholders);
  }

}