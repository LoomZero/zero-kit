const Reflection = require('../util/Reflection');

module.exports = class Color {

  static get codes() {
    return {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      underscore: '\x1b[4m',
      blink: '\x1b[5m',
      reverse: '\x1b[7m',
      hidden: '\x1b[8m',

      black: '\x1b[30m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',

      bgBlack: '\x1b[40m',
      bgRed: '\x1b[41m',
      bgGreen: '\x1b[42m',
      bgYellow: '\x1b[43m',
      bgBlue: '\x1b[44m',
      bgMagenta: '\x1b[45m',
      bgCyan: '\x1b[46m',
      bgWhite: '\x1b[47m',
    };
  }

  /** @returns {Color} */
  static get theme() {
    if (this._theme === undefined) {
      this._theme = new Color({});
    }
    return this._theme;
  }

  /**
   * @param {Color} theme
   */
  static setTheme(theme) {
    this._theme = theme;
  }

  /**
   * @param {string} type 
   * @returns {import('../../types').C_Color}
   */
  static get(type) {
    return this.theme.get(type);
  }

  /**
   * @param {string} type 
   * @param {string} message
   * @param {(Object<string, string>|string[])} [placeholders]
   * @returns {string}
   */
  static out(type, message, placeholders = {}) {
    return this.get(type)(message, placeholders);
  }

  /**
   * @param {Object<string, string[][]>} colors 
   */
  constructor(colors) {
    this.colors = colors;
  }

  /** @returns {string} */
  get reset() {
    return Color.codes.reset;
  }

  get fallback() {
    return {
      info: [['white'], ['green']],
      note: [['magenta', 'underscore'], ['green', 'underscore']],
      abort: [['bgRed'], ['bgRed', 'underscore']],
      success: [['bgGreen'], ['bgMagenta']],
      warning: [['yellow'], ['green']],
      error: [['red'], ['magenta']],
      question: [['green'], ['magenta']],
      input: [['cyan']],
    };
  }

  /**
   * @param {string} name 
   * @returns {string[][]}
   */
  getColor(name) {
    return this.colors[name] || null;
  }

  /**
   * @param {string} name 
   * @param {string[]} message 
   * @param {string[]} placeholder 
   * @returns {this}
   */
  setColor(name, message, placeholder) {
    this.colors[name] = [message, placeholder];
    return this;
  }

  /**
   * @param {string} type 
   * @returns {import('../../types').T_Color}
   */
  getColorString(type) {
    const definition = this.colors[type] || this.fallback[type] || [[], []];
    if (!definition[1]) definition.push(definition[0]);
    if (definition) {
      return {
        message: definition[0].reduce(s, c => s + c, ''),
        placeholder: definition[1].reduce(s, c => s + c, ''),
      };
    } else {
      return {
        message: '',
        placeholder: '',
      };
    }
  }

  /**
   * @param {string} type 
   * @returns {import('../../types').C_Color}
   */
  get(type) {
    return this.create(this.getColorString(type));
  }

  /**
   * @param {import('../../types').T_Color} color 
   * @returns {import('../../types').C_Color}
   */
  create(color) {
    return (message, placeholders) => {
      return color.message + Reflection.replaceMessage(message, placeholders || {}, (placeholder) => {
        return this.reset + color.placeholder + placeholder + color.message;
      }) + this.reset;
    };
  }

}