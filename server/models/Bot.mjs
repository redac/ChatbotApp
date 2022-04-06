import RiveScript from 'rivescript';

class Bot {
  static id;
  static port;
  static rive;
  constructor(data) {
    if (undefined != data.id) {
      if (!isInt(data.id)) {
        throw new Error('Bot Creation : passed id is not an integer');
      }
      this.id = data.id;
    } else {
      this.id = parseInt(Math.floor(Math.random() * Math.floor(100000)));
    }

    if (undefined != data.port) {
      if (!isInt(data.port)) {
        throw new Error('Bot Creation : passed port is not an integer');
      }
      this.port = data.port;
    } else {
      this.port = parseInt(Math.floor(Math.random() * 4000) + 3000);
    }
    this.rive = new RiveScript();
  }
}
function isInt(value) {
  let x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}

export { Bot };
