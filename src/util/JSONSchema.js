const Color = require('../cli/Color');
const DependencyError = require('../error/DependencyError');

module.exports = class JSONSchema {

  /** @returns {import('jsonschema')} */
  static get Schema() {
    if (this._PackageSchema !== undefined) return this._PackageSchema;
    try {
      this._PackageSchema = require('jsonschema');
    } catch (error) {
      throw new DependencyError('zero-kit/src/util/JSONSchema', 'jsonschema').logError();
    }
    return this._PackageSchema;
  }

  /** @returns {import('string-similarity')} */
  static get Similarity() {
    if (this._PackageSimilarity !== undefined) return this._PackageSimilarity;
    try {
      if (this._PackageSimilarity !== null) {
        this._PackageSimilarity = require('string-similarity');
      }
    } catch (error) {
      new DependencyError('zero-kit/src/util/JSONSchema', 'string-similarity').logNote();
      console.log();
      this._PackageSimilarity = null;
    }
    return this._PackageSimilarity;
  }

  /**
   * @param {Object} schema 
   */
  constructor(schema) {
    this.schema = schema;
  }

  get defs() {
    return this.schema.$defs || {};
  }

  get(schema) {
    if (schema && schema.$ref) {
      return this.defs[schema.$ref.split('/').pop()];
    }
    return schema;
  }

  /**
   * @param {*} object 
   * @param {import('jsonschema').Options} options
   * @returns {import('jsonschema').ValidatorResult}
   */
  validate(object, options = {}) {
    return JSONSchema.Schema.validate(object, this.schema, options);
  }

  /**
   * @param {*} object 
   * @param {import('jsonschema').Options} options
   * @param {*} onError
   * @returns {import('jsonschema').ValidatorResult}
   */
  logResults(object, options = {}, onError = null) {
    const results = this.validate(object, options);

    if (results.valid) return results;
    Color.log('error', 'ERRORS:');
    for (const error of results.errors) {
      if (typeof onError === 'function') {
        onError(error);
      } else {
        const guess = this.getSchemaBestMatch(error.argument, error.path);
        let message = error.message;
        if (typeof error.argument === 'string') {
          message = error.message.replace('"' + error.argument + '"', '{argument}');
        }
        if (guess) {
          Color.log('error', '- "{point}" ' + message + ' - did you mean {guess}', {point: error.path.join('.'), guess: guess, argument: error.argument});
        } else {
          Color.log('error', '- "{point}" ' + message, {point: error.path.join('.'), argument: error.argument});
        }
      }
    }
    return results;
  }

  /**
   * @param {string} argument 
   * @param {string[]} path 
   * @param {(string|null)}
   */
  getSchemaBestMatch(argument, path) {
    if (JSONSchema.Similarity === null || typeof argument !== 'string' || !path) return null;
    return JSONSchema.Similarity.findBestMatch(argument, this.getSchemaOptions(path)).bestMatch.target;
  }

  /**
   * @param {string[]} path 
   * @returns {string[]}
   */
  getSchemaOptions(path) {
    let schema = this.schema;
    for (const prop of path) {
      if (schema.properties && schema.properties[prop]) {
        schema = this.get(schema.properties[prop]);
      } else if (schema.additionalProperties) {
        schema = this.get(schema.additionalProperties);
      } else {
        return [];
      }
    }
    const options = [];

    if (schema.properties) {
      for (const field in schema.properties) {
        options.push(field);
      }
    }
    return options;
  }

}