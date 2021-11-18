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

    Color.log('section.abort', 'Install package {dependency} to use the class {subject}.', {subject, dependency});
    Color.log('note', 'NOTE: Install package via "{command}"', {command: 'npm install ' + dependency});
  }

}