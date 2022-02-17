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
 * @param {T_InputOptions} options
 * @returns {(string|boolean|Array)}
 */

/**
 * @callback C_InputEvent
 * @param {T_InputOptions} options
 */

/**
 * @callback C_InputTransform
 * @param {string} answer
 * @param {T_InputOptions} options
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
 * @typedef {Object} T_InputOptions
 * @property {string} [type] Default: 'input'. Options: 'input', 'read'.
 * @property {(string[]|Object<string, string>)} [placeholders]
 * @property {(string|C_InputEvent)} [before]
 * @property {(C_InputTransform|C_InputTransform[])} [transform]
 * @property {(C_InputValidate|C_InputValidate[])} [validate]
 * @property {(string|C_InputEvent)} [after]
 * @property {any} [fallback]
 * @property {boolean} [blind] Only supported for type 'read'.
 * @property {RegExp} [mask] Only supported for type 'read'.
 */

/**
 * @typedef {object} T_InputArraySplitOptions
 * @property {string} seperator
 * @property {boolean} [trimItems] 
 * @property {import('../../types').C_InputTransform} [itemTransform] 
 * @property {(string|boolean)} [notEmpty]
 */

/**
 * @typedef {object} T_CacheQuery
 * @property {string} [name]
 * @property {string[]} [tags]
 * @property {number} [date]
 * @property {number} [days]
 * @property {number} [years]
 */

module.exports = {};