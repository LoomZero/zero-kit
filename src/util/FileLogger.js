const FS = require('fs');
const LoggerChannel = require('./LoggerChannel');
const Handler = require('events');

module.exports = class FileLogger {

  /**
   * @param {string} path
   */
  constructor(path) {
    this.path = path; 
    this._stream = null;
    this.channels = {};
    this.handler = new Handler();
  }

  /** @returns {FS.WriteStream} */
  get stream() {
    if (this._stream === null) {
      this._stream = FS.createWriteStream(this.path, { flags: 'a' });
    }
    return this._stream;
  }

  /**
   * @param {string} channel 
   * @returns {LoggerChannel}
   */
  channel(channel) {
    if (this.channels[channel] === undefined) {
      this.channels[channel] = new LoggerChannel(this, channel);
    }
    return this.channels[channel];
  }

  /**
   * @param {string} type
   * @param {string} channel 
   * @param {string} message
   * @returns {this}
   */
  write(type, channel, message) {
    this.stream.write(this.format(this.getTimeLog(), type, channel, message) + "\n");
    this.handler.emit('write', type, channel, message);
    this.handler.emit('write:' + type, channel, message);
    return this;
  }

  /**
   * @param {string} title 
   * @param {string} char
   * @returns {this}
   */
  writeSection(title, char = '#') {
    this.stream.write(char.repeat(title.length + 4) + "\n");
    this.stream.write(char + ' ' + title + ' ' + char + "\n");
    this.stream.write(char.repeat(title.length + 4) + "\n");
    this.handler.emit('section', title, char);
    return this;
  }

  /**
   * @param {string} time 
   * @param {string} type 
   * @param {string} channel 
   * @param {string} message 
   * @returns {string}
   */
  format(time, type, channel, message) {
    return time + ' [' + type.toUpperCase() + ' ~ ' + channel + '] ' + message;
  }

  /**
   * @param {string} dateSep 
   * @param {string} timeSep 
   * @param {string} logSep 
   * @returns {string}
   */
  getTimeLog(dateSep = '.', timeSep = ':', logSep = ' ') {
    const now = new Date();
    return ('0' + now.getDay()).slice(-2) + dateSep + ('0' + now.getMonth()).slice(-2) + dateSep + now.getFullYear() + logSep + ('0' + now.getHours()).slice(-2) + timeSep + ('0' + now.getMinutes()).slice(-2) + timeSep + ('0' + now.getSeconds()).slice(-2);
  }

  /**
   * @returns {this}
   */
  close() {
    if (this._stream !== null) {
      this._stream.close();
      this._stream = null;
    }
    return this;
  }

  /**
   * @param {FileLogger} logger 
   * @param {(string[]|null)} filters 
   * @returns {this}
   */
  pipe(logger, filters = null) {
    if (filters === null) {
      if (filters === null || filters.includes('section') && filters.length > 1 || !filters.includes('section')) {
        this.handler.on('write', (type, ...args) => {
          if (filters.includes(type)) {
            logger.write(type, ...args);
          }
        });
      }
      if (filters === null || filters.includes('section')) {
        this.handler.on('section', (...args) => logger.writeSection(...args));
      }
    }
    return this;
  }

}