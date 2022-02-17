const Color = require('./Color');
const Readline = require('readline');
const ZeroError = require('../error/ZeroError');

module.exports = class Input {

  /**
   * @param {string} message 
   * @param {import('../../types').T_InputOptions} options
   * @returns {*}
   */
  static async input(message, options = {}) {
    let valid = true;
    let answer = '';
    let readFunc = null;

    options = this.optionsMerge(options);
    if (!options.type || options.type === 'input') {
      readFunc = 'doInput';
    } else if (options.type === 'read') {
      readFunc = 'doRead';
    } else {
      throw new ZeroError('kit.input.type.unknown', 'Unknown input type "' + options.type + '"', {
        type: options.type,
        message,
        options,
      });
    }

    do {
      if (typeof options.before === 'string') {
        Color.log('info', options.before);
      } else if (typeof options.before === 'function') {
        options.before(options);
      }
      

      answer = await this[readFunc](message, options.placeholders || {}, options);
      for (const func of options.validate) {
        valid = true;
        const error = await func(answer, options);

        if (typeof error === 'string') {
          Color.log('error', error);
          valid = false;
          break;
        } else if (Array.isArray(error)) {
          Color.log('error', error[0], error[1] || {});
          valid = false;
          break;
        } else if (error === false) {
          Color.log('error', 'Your input is not valid.');
          valid = false;
          break;
        }
      }

      if (typeof options.after === 'string') {
        Color.log('info', options.after);
      } else if (typeof options.after === 'function') {
        options.after(options);
      }
    } while (!valid);
    for (const func of options.transform) {
      answer = await func(answer, options);
    }
    return answer;
  }

  /**
   * @param {string} message 
   * @param {(string[]|Object<string, string>)} placeholders
   * @param {import('../../types').T_InputOptions} options
   * @returns {Promise<string>}
   */
  static doInput(message, placeholders, options) {
    const readline = Readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((res) => {
      readline.question(Color.out('question', message, placeholders) + Color.theme.getColorString('input').message, (answer) => {
        process.stdout.write(Color.theme.reset);
        readline.close();
        res(answer);
      });
    });
  }

  /**
   * @param {string} message 
   * @param {(string[]|Object<string, string>)} placeholders
   * @param {import('../../types').T_InputOptions} options
   * @returns {Promise<string>}
   */
  static doRead(message, placeholders, options) {
    process.stdout.write(Color.out('question', message, placeholders) + Color.theme.getColorString('input').message);
    process.stdin.resume().setRawMode(true);
    return new Promise(resolve => {
      process.stdin.once('data', (input) => {
        if (!options.blind) {
          console.log(input + Color.theme.reset);
        } else {
          process.stdout.write(Color.theme.reset);
        }
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve(input + '');
      });
    });
  }

  /**
   * @param {import('../../types').T_InputOptions} options 
   * @param  {...import('../../types').T_InputOptions} merge
   */
  static optionsMerge(options, ...merge) {
    if (typeof options.validate === 'function') {
      options.validate = [options.validate];
    } else if (!Array.isArray(options.validate)) {
      options.validate = [];
    }

    if (typeof options.transform === 'function') {
      options.transform = [options.transform];
    } else if (!Array.isArray(options.transform)) {
      options.transform = [];
    }

    for (const item of merge) {
      if (typeof item.validate === 'function') {
        options.validate.push(item.validate);
      } else if (Array.isArray(item.validate)) {
        options.validate = options.validate.concat(item.validate);
      }

      if (typeof item.transform === 'function') {
        options.transform.push(item.transform);
      } else if (Arrray.isArray(item.transform)) {
        options.transform = options.transform.concat(item.transform);
      }

      for (const index in item) {
        if (index === 'transform' || index === 'validate') continue;
        options[index] = item[index];
      }
    }

    return options;
  }

  /**
   * @param {import('../../types').T_InputOptions} options
   * @param {string} error
   * @returns {import('../../types').T_InputOptions}
   */
  static optionsNotEmpty(options = {}, error = 'Required') {
    options.validate = (answer) => {
      if (answer.length === 0) return error;
    };
    return options;
  }
  
  /**
   * @param {import('../../types').T_InputOptions} options
   * @param {string[]} yes 
   * @param {string[]} no 
   * @param {(string|null)} error 
   * @returns {import('../../types').T_InputOptions}
   */
  static optionsBoolean(options = {}, yes = ['y'], no = ['n'], error = null) {
    options.validate = (answer) => {
      if (!yes.includes(answer) && !no.includes(answer)) return error || 'Please answer only with [' + yes.join(', ') + '] for yes or [' + no.join(', ') + '] for no.';
    };
    options.transform = (answer) => {
      if (yes.includes(answer)) return true;
      if (no.includes(answer)) return false;
      return null;
    };
    return options;
  }

  /**
   * @param {import('../../types').T_InputOptions} options
   * @param {string[]} items 
   * @param {(string|null)} error 
   * @returns {import('../../types').T_InputOptions}
   */
  static optionsSelect(options = {}, items = [], error = null) {
    items = items.map(v => v + '');
    options.validate = (answer) => {
      if (!items.includes(answer)) return error || 'Please use on of this options [' + items.join(', ') + ']';
    };
    return options;
  }

  /**
   * @param {import('../../types').T_InputOptions} options 
   * @param {string} seperator
   * @param {import('../../types').T_InputArraySplitOptions} arrayOptions
   * @returns {import('../../types').T_InputOptions}
   */
  static optionsTermArray(options, seperator = ',', arrayOptions = {}) {
    arrayOptions.seperator = seperator;
    if (arrayOptions.notEmpty) {
      this.optionsNotEmpty(options, (typeof arrayOptions.notEmpty === 'string' ? arrayOptions.notEmpty : 'Required'));
    }
    options.transform = (answer, inneroptions) => {
      let array = answer.split(arrayOptions.seperator);
      if (arrayOptions.trimItems) array = array.map(v => v.trim());
      if (arrayOptions.itemTransform) array = array.map(v => arrayOptions.itemTransform(v, inneroptions));
      return array.filter(v => v);
    };
    return options;
  }

  /**
   * @param {import('../../types').T_InputOptions} options 
   * @param {string[][]} items
   * @param {string} error
   * @returns {import('../../types').T_InputOptions}
   */
  static optionsSelectAlias(options = {}, items = [], error = null) {
    const validates = items.reduce((v, c) => v.concat(c), []);
    options.validate = (answer) => {
      if (!validates.includes(answer)) return error || Color.out('info', 'Please use on of this options [{options}]', {options: items.map(v => v[0]).join(', ')});
    };
    options.transform = (answer) => {
      const item = items.find(v => v.includes(answer));
      if (item) return item[0];
    };
    return options;
  }

  /**
   * @param {import('../../types').T_InputOptions} options
   * @param {import('./CLITable')} table 
   * @param {string} id 
   * @param  {...string} aliases 
   * @returns {import('../../types').T_InputOptions}
   */
  static optionsTable(options, table, id, ...aliases) {
    const indexes = [];
    let count = 0;
    for (const index in table.header) {
      if (index === id) {
        indexes.unshift(count);
      } else if (aliases.includes(index)) {
        indexes.push(count);
      }
      count++;
    }


    const items = [];
    table.table.map(v => {
      const item = [];
      for (const index of indexes) {
        item.push(v[index]);
      }
      items.push(item);
    });
    return this.optionsSelectAlias(options, items);
  }

}