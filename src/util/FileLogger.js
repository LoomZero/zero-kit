const FS = require('fs');
const LoggerChannel = require('./LoggerChannel');

module.exports = class FileLogger {

  /**
   * @param {string} path
   */
  constructor(path) {
    this.path = path; 
    this._stream = null;
  }

  get stream() {
    if (this._stream === null) {
      this._stream = FS.createWriteStream(this.path);
    }
    return this._stream;
  }

  /**
   * @param {string} channel 
   */
  channel(channel) {
    return new LoggerChannel(this, channel);
  }

  /**
   * @param {string} type
   * @param {string} channel 
   * @param {string} message
   */
  write(type, channel, message) {
    this.stream.write(this.format(this.getTimeLog(), type, channel, message) + "\n");
  }

  /**
   * @param {string} title 
   * @param {string} char
   */
  writeSection(title, char = '#') {
    this.stream.write(char.repeat(title.length + 4) + "\n");
    this.stream.write(char + ' ' + title + ' ' + char + "\n");
    this.stream.write(char.repeat(title.length + 4) + "\n");
  }

  /**
   * @param {string} time 
   * @param {string} type 
   * @param {string} channel 
   * @param {string} message 
   * @returns {string}
   */
  format(time, type, channel, message) {
    return time + ' [' + type.toUpperCase() + '~' + channel + '] ' + message;
  }

  getTimeLog(dateSep = '.', timeSep = ':', logSep = ' ') {
    const now = new Date();
    return now.getFullYear() + dateSep + now.getMonth() + dateSep + now.getDay() + logSep + now.getHours() + timeSep + now.getMinutes() + timeSep + now.getSeconds();
  }

  close() {
    if (this._stream !== null) {
      this._stream.close();
      this._stream = null;
    }
  }

}