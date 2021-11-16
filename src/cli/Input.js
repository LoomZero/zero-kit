const Color = require('./Color');

module.exports = class Input {

  /**
   * @param {string} message 
   * @param {(string[]|Object<string, string>)} placeholders
   * @param {import('../../types').C_InputOptions} options
   * @returns {*}
   */
  static async input(message, placeholders = {}, options = {}) {
    let valid = true;
    let answer = '';
    do {
      answer = await this.doInput(message, placeholders);
      if (typeof options.validate === 'function') {
        const error = await options.validate(answer, options);
        if (typeof error === 'string') {
          console.log(Color.out('error', error));
          valid = false;
        } else if (error === false) {
          console.log(Color.out('error', 'Your input is not valid.'));
        } else {
          valid = true;
        }
      }
    } while (!valid);
    if (typeof options.transform === 'function') {
      return await options.transform(answer, options);
    }
    return answer;
  }

  /**
   * @param {string} message 
   * @param {(string[]|Object<string, string>)} placeholders
   * @returns {Promise<string>}
   */
  static doInput(message, placeholders) {
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
   * @param {string[]} yes 
   * @param {string[]} no 
   * @param {string} error
   * @returns {import('../../types').C_InputOptions}
   */
  static optionsBoolean(yes = ['y'], no = ['n'], error = null) {
    return {
      validate: (answer) => {
        if (!yes.includes(answer) && !no.includes(answer)) return error || 'Please answer only with [' + yes.join(', ') + '] for yes or [' + no.join(', ') + '] for no.';
      },
      transform: (answer) => {
        if (yes.includes(answer)) return true;
        if (no.includes(answer)) return false;
        return null;
      }
    };
  }

}