const Color = require('../cli/Color');
const ZeroError = require('./ZeroError');

module.exports = class DependencyError extends ZeroError {

  /**
   * @param {string} subject
   * @param {string} dependency
   * @param {string} message 
   * @param {*} context 
   */
  constructor(subject, dependency, message = null, context = {}) {
    if (message === null) message = 'The class "' + subject + '" need the dependency "' + dependency + '" please install it with "npm install --save ' + dependency + '"';
    super(message, context);
    this.subject = subject;
    this.dependency = dependency;
  }

  /**
   * @param {(string|null)} message
   * @returns {this}
   */
  logError(message = null) {
    if (message === null) message = 'Install package {dependency} to use the class {subject}.';
    Color.log('section.abort', message, {subject: this.subject, dependency: this.dependency});
    Color.log('note', 'NOTE: Install package via "{command}"', {command: 'npm install ' + this.dependency});
    return this;
  }

  /**
   * @param {(string|null)} message
   * @returns {this}
   */
  logNote(message = null) {
    if (message === null) message = 'NOTE: Install package {dependency} to improve {subject}.';
    Color.log('note', message, {subject: this.subject, dependency: this.dependency});
    return this;
  }

}