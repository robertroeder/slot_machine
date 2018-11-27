import Reel from './Reel.js';
import Symbol from './Symbol.js';

export default class Slot {
  constructor(domElement, config = {}) {
    Symbol.preload();

    this.spinAudio = new Audio(require(`../assets/sounds/spin.m4a`));
    this.spinAudio.loop = true;
    this.winAudio = new Audio(require(`../assets/sounds/win.m4a`));
    this.winAudio.loop = true;
    //this.winAudioFile = require(`../assets/sounds/sound_effects.mp3`);

    this.currentSymbols = [
      ['darwin_hardhat', 'darwin_hardhat', 'darwin_hardhat'],
      ['darwin_hardhat', 'darwin_hardhat', 'darwin_hardhat'],
      ['darwin_hardhat', 'darwin_hardhat', 'darwin_hardhat'],
      ['darwin_hardhat', 'darwin_hardhat', 'darwin_hardhat'],
      ['darwin_hardhat', 'darwin_hardhat', 'darwin_hardhat'],
    ];

    this.nextSymbols = [
      ['darwin_hardhat', 'darwin_hardhat', 'darwin_hardhat'],
      ['darwin_hardhat', 'darwin_hardhat', 'darwin_hardhat'],
      ['darwin_hardhat', 'darwin_hardhat', 'darwin_hardhat'],
      ['darwin_hardhat', 'darwin_hardhat', 'darwin_hardhat'],
      ['darwin_hardhat', 'darwin_hardhat', 'darwin_hardhat'],
    ]

    this.rollupConfig = [
      {'win': 0, 'seconds': 1, 'win_label': "Win"},
      {'win': 250, 'seconds': 5, 'win_label': "Nice Win"},
      {'win': 500, 'seconds': 8, 'win_label': "Great Win"},
      {'win': 1000, 'seconds': 15, 'win_label': "Amazing Win!"}
    ]

    this.container = domElement;

    this.reels = Array.from(this.container.getElementsByClassName('reel')).map((reelContainer, idx) => new Reel(reelContainer, idx, this.currentSymbols[idx]));
    this.betElement = document.getElementById("bet");
    this.winContainerElement = document.getElementById("win-counter");
    this.winLabelElement = document.getElementById("win-label");
    this.winAmountElement = document.getElementById("win");
    this.creditElement = document.getElementById("credit");
    this.payoutElement = document.getElementById("payouts");

    this.spinning = false;
    this.rollingUp = false;
    this.won = false;
    this.bet = 50;
    this.credits = 10000;
    this.lastWin = 0;
    //this.spinButton = document.getElementById('spin');
    //this.spinButton.addEventListener('click', () => this.spin());
    document.addEventListener('keydown', this.handleKeypress.bind(this));

    //this.autoPlayCheckbox = document.getElementById('autoplay');

    this.blinkInterval = null;
    this.rollupInterval = null;

    if (config.inverted) {
      this.container.classList.add('inverted');
    } 
  }

  spin() {
    this.onSpinStart();

    this.currentSymbols = this.nextSymbols;
    this.nextSymbols = [
      [Symbol.randomNoWild(), Symbol.randomNoWild(), Symbol.randomNoWild()],
      [Symbol.random(), Symbol.random(), Symbol.random()],
      [Symbol.random(), Symbol.random(), Symbol.random()],
      [Symbol.random(), Symbol.random(), Symbol.random()],
      [Symbol.random(), Symbol.random(), Symbol.random()],
    ];
    console.log(this.currentSymbols);
    console.log(this.nextSymbols);

    return Promise.all(this.reels.map(reel => {
      reel.renderSymbols(this.currentSymbols[reel.idx], this.nextSymbols[reel.idx]);
      return reel.spin();
    })).then(() => this.onSpinEnd());
  }

  onSpinStart() {
    //this.spinButton.disabled = true;
    this.spinAudio.play();
    this.spinning = true;
    if (this.bet > this.credits){
      this.credits = 10000;
    }
    this.credits = this.credits - this.bet;
    this.creditElement.innerHTML = this.credits;
    this.winContainerElement.hidden = "hidden";
    this.stopBlinking();

    console.log('SPIN START');
  }

  onSpinEnd() {
    //this.spinButton.disabled = false;
    this.spinAudio.pause();
    this.spinAudio.currentTime = 0;
    this.spinning = false;
    console.log('SPIN END');
    let wins=this.determineWins();
    let payouts=this.calculatePayouts(wins);

    //this.reels[0].blink();
    this.blinkPayouts(wins, payouts);
    this.rollupWin(payouts);

    //if (this.autoPlayCheckbox.checked) return window.setTimeout(() => this.spin(), 200);
  }

  determineWins() {
    var wins = {};
    for (const symbol of Symbol.symbols) {
      if (symbol == 'yelp_burst') {
        continue;
      }
      var winningSymbols = [];
      for (var i=0; i<5; i++) {
        let matches = this.matchingSymbolPositions(this.nextSymbols[i], symbol);
        if (matches.length === 0) {
          break;
        }
        winningSymbols.push(matches);
      }
      if (winningSymbols.length >= 3) {
        wins[symbol] = winningSymbols;
      }
    }
    console.log(wins);
    return wins;
  }

  matchingSymbolPositions(reel, symbol) {
    var matchingPositions = []
    for (var i=0; i<3; i++){
      if (reel[i] == symbol || reel[i] == 'yelp_burst') {
        matchingPositions.push(i);
      }
    }
    return matchingPositions;
  }

  rollupWin(payouts) {
    let totalWin = payouts.reduce(function(total, payout){
      return total + payout["totalWin"];
    }, 0);
    if (totalWin == 0) {return;}

    this.winAudio.play();
    var currentCreditDisplay = this.credits;
    var currentWinDisplay = 0;
    this.credits = this.credits + totalWin;
    this.lastWin = totalWin;
    this.rollingUp = true;

    let betMultiplier = this.bet / 50;
    var rollupConfig = this.rollupConfig.reduce(function(maxConfig, config){
      if(totalWin >= (config["win"] * betMultiplier)) {
        return config;
      }
      return maxConfig;
    },1);

    this.winLabelElement.innerHTML = rollupConfig["win_label"];
    this.winAmountElement.innerHTML = "0";
    this.winContainerElement.hidden = "";

    //TODO remove
    var rollupTime = rollupConfig["seconds"];
    //rollupTime = 5;

    let rollupSpeed = Math.max(Math.floor(totalWin / (rollupTime * 100)), 1);

    function performRollup(self){
      console.log(currentCreditDisplay);
      currentCreditDisplay = Math.min(currentCreditDisplay + rollupSpeed, self.credits);
      currentWinDisplay = Math.min(currentWinDisplay + rollupSpeed, self.lastWin);
      self.creditElement.innerHTML = currentCreditDisplay;
      self.winAmountElement.innerHTML = currentWinDisplay;
      if (currentCreditDisplay == self.credits && currentWinDisplay == self.lastWin){
        clearInterval(self.rollupInterval);
        self.rollingUp = false;
        self.winAudio.pause();
        self.winAudio.currentTime = 0;
      }
    }
    this.rollupInterval = setInterval(performRollup, 10, this);
  }

  blinkPayouts(wins, payouts) {
    var payingSymbols = Object.keys(wins);
    if (payouts.length == 0){
      return;
    }
    var currentIndex = 0;
    function cycleBlink(self){
      console.log(currentIndex);
      //Blink the symbols
      self.reels.map(reel => reel.clearBlink());
      let currentPayout = payouts[currentIndex];
      let symbol = currentPayout["symbol"];
      let winningPositions = wins[symbol];
      for (let i=0; i<winningPositions.length; i++){
        self.reels[i].blink(winningPositions[i]);
      }
      //Show the payout
      let reelsWon = currentPayout["reelsWon"];
      let prettySymbol = self.titleCase(symbol);
      let baseWin = currentPayout["baseWin"];
      let maybeMultiplier = ""
      let multiplier = currentPayout["multiplier"];
      if (multiplier > 1){
        maybeMultiplier = ` (x${multiplier})`
      }
      let payoutString = `${reelsWon} ${prettySymbol} wins ${baseWin}${maybeMultiplier}`;
      self.payoutElement.innerHTML = payoutString;
      currentIndex+=1;
      if(currentIndex >= payingSymbols.length){
        currentIndex=0;
      }
    }

    cycleBlink(this);
    this.blinkInterval = setInterval(cycleBlink, 3000, this);
  }

  calculatePayouts(wins) {
    var payouts = [];
    var payingSymbols = Object.keys(wins);
    if (payingSymbols.length == 0){
      return payouts;
    }
    for (var i=0; i<payingSymbols.length; i++){
      let symbol = payingSymbols[i];
      let reelsWon = wins[symbol].length;
      let baseWin = Symbol.basePayouts[symbol][reelsWon-3] * (this.bet / 50);
      //let baseWin = reelsWon * 50; //Number of reels won (3-5)
      let multiplier = wins[symbol].reduce(function(mult, reel){
        return mult * reel.length;
      }, 1)
      let totalWin = baseWin * multiplier;
      payouts.push({symbol, reelsWon, baseWin, multiplier, totalWin});
    }
    console.log(payouts);
    return payouts;
  }

  stopBlinking() {
    clearInterval(this.blinkInterval);
    this.reels.map(reel => reel.clearBlink());
    this.payoutElement.innerHTML = "";
  }

  handleKeypress(event) {
    const keyName = event.key;
    console.log(keyName);
    if ((keyName >= 0 && keyName <= 9) || keyName == " ") {
      if (this.rollingUp) {
        clearInterval(this.rollupInterval);
        this.creditElement.innerHTML = this.credits;
        this.winAmountElement.innerHTML = this.lastWin;
        this.winAudio.pause();
        this.winAudio.currentTime = 0;
        this.rollingUp = false;
      } else if (!this.spinning) {
        this.spin();
      }
    }
    else if (keyName == "a"){
      if (!this.spinning) {
        this.updateBet(50);
      }
    }
    else if (keyName == "d"){
      if (!this.spinning) {
        this.updateBet(100);
      }
    }
    else if (keyName == "g"){
      if (!this.spinning) {
        this.updateBet(150);
      }
    }
    else if (keyName == "j"){
      if (!this.spinning) {
        this.updateBet(200);
      }
    }
    else if (keyName == "l"){
      if (!this.spinning) {
        this.updateBet(250);
      }
    }
    else if (keyName == "+" || keyName == "=") {
      if (!this.spinning) {
        this.updateBet(this.bet + 50);
      }
    }
    else if (keyName == "-" || keyName == "_") {
      if (!this.spinning) {
        this.updateBet(this.bet - 50);
      }
    }

  }

  updateBet(amount) {
    if(amount > 250){
      this.bet = 250;
    } else if(amount < 50){
      this.bet = 50;
    } else {
      this.bet = amount;
    }

    this.betElement.innerHTML = this.bet;
  }

  titleCase(str) {
   var splitStr = str.toLowerCase().split('_');
   for (var i = 0; i < splitStr.length; i++) {
       // You do not need to check if i is larger than splitStr length, as your for does that for you
       // Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
   }
   // Directly return the joined string
   return splitStr.join(' ');
}


}
