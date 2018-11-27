const cache = {};

export default class Symbol {
  constructor(name = Symbol.random()) {
    this.name = name;

    if (cache[name]) {
      this.img = cache[name].cloneNode();
    } else {
      this.img = new Image();
      this.img.src = require(`../assets/symbols/yelp_symbols/${name}.png`);
      cache[name] = this.img;
    }
  }

  static preload() {
    Symbol.symbols.forEach(symbol => new Symbol(symbol));
  }

  static get symbols() {
    //return ['at_at', 'c3po', 'darth_vader', 'death_star', 'falcon', 'r2d2', 'stormtrooper', 'tie_ln', 'yoda', 'test'];
    return ['carmen_chef', 'carmen_space', 'carmen', 'darwin_hardhat', 'darwin', 'hammy_chef', 'hammy_sheriff', 'hammy_sherlock', 'hammy', 'yelp_burst'];
  }

  static random() {
    return this.symbols[Math.floor(Math.random()*this.symbols.length)];
  }

  static randomNoWild() {
    return this.symbols[Math.floor(Math.random()*(this.symbols.length-1))];
  }

  static get basePayouts() {
    return {
      'hammy': [10, 20, 100],
      'hammy_chef': [10, 40, 100],
      'hammy_sherlock': [10, 40, 100],
      'hammy_sheriff': [15, 60, 120],
      'carmen': [20, 80, 150],
      'carmen_chef': [20, 100, 250],
      'carmen_space': [50, 100, 250],
      'darwin': [50, 150, 300],
      'darwin_hardhat': [100, 300, 500],
    };
  }
}
