const ZKit = require('../../index');
const Color = require('./Color');
const Input = require('./Input');

module.exports = class Screen {

  constructor(options = {}) {
    this.options = options;
    this.handler = ZKit.createHandler('screen');
    this.data = [];
    this.status = '';

    if (!this.options.defaultControl) {
      this.handler.on('control', (event) => {
        if (event.control === '^C') {
          console.log('^C' + Color.theme.reset);
          ZKit.handler.emit('exit', {reason: 'read.abort', screen: this, event});
          process.exit();
        } else if (event.control === '^E') {
          event.consume = true;
          event.screen.state = 'end';
        }
      });
    }
  }

  write(index, text, options = {}) {
    let found = this.data.findIndex(v => v.index === index);
    if (found === -1) {
      this.data.push({ index, text, options });
    } else {
      this.data[found] = { index, text, options };
    } 
  }

  getBuffer() {
    const lines = [];
    const size = this.getSize();

    for (let index = 0; index < size.height; index++) {
      let text = '';

      const write = this.data.find(v => v.index === index);
      if (write) {
        if (write.options.color) {
          text = Color.out(write.options.color, write.text.padEnd(size.width), write.options.placeholders);
        } else {
          text = write.text;
        }
      }
      lines.push(text);
    }
    return lines;
  }

  getSize() {
    return {
      width: process.stdout.columns,
      height: process.stdout.rows - 1,
    };
  }

  async print() {
    this.handler.emit('print', this);

    const buffer = this.getBuffer();
    for (const line of buffer) {
      console.log(line);
    }
  }

  async show() {
    this.state = 'show';
    do {
      await this.print();
      let control = await Input.readInput();
      control = Input.toKeyString(control);
      this.handler.emit('control', { screen: this, control, consume: false });
    } while (this.state === 'show');
  }

}