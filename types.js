/**
 * @callback C_String
 * @param {string} value
 * @returns {string}
 */

/**
 * @callback C_Color
 * @param {string} message
 * @param {(Object<string, string>|string[])} [placeholders]
 * @returns {string}
 */

/**
 * @typedef {Object} T_Color
 * @property {string} message
 * @property {string} placeholder
 */

/**
 * @callback C_InputValidate
 * @param {string} answer
 * @param {C_InputOptions} options
 * @returns {(string|boolean)}
 */

/**
 * @callback C_InputTransform
 * @param {string} answer
 * @param {C_InputOptions} options
 * @returns {*}
 */

/**
 * @callback C_FileWalker
 * @param {string} file
 * @param {string} path
 * @param {string} relative
 * @param {Object} [info]
 */

/**
 * @typedef {Object} C_InputOptions
 * @property {(string[]|Object<string, string>)} [placeholders]
 * @property {C_InputTransform} [transform]
 * @property {C_InputValidate} [validate]
 */

module.exports = {};