// Aliases
var Engine = Matter.Engine,
  Bodies = Matter.Bodies,
  Runner = Matter.Runner,
  Composite = Matter.Composite,
  Events = Matter.Events,
  Body = Matter.Body;

// Possible globals for the need of references
const screen = document.getElementById('Plinko');
const bounds = screen.getBoundingClientRect();
var engine = Engine.create();
var runner;

/////////////// --- USER INFORMATION --- //////////////
var userID;
var userPlaysLeft;
var hasWon = false;
var canPlay = false;
var resetClicked = false;



/////////////// --- Game board pieces --- //////////////

// Images
var hog;
var banner;
var credits;
var loginAds;
var manualPrize;
var premiumSolo;
var squareBanner;
var raffleTicket;
var solo;
var textAds;
//////////////// End of images

// Disc/Puck objects
var puck;
var trail;
var trailArray = [];
//////////////// end of Disc/Puck objects

// Enviornment Objects
var ground;
var walls;
// Array of prizes to show
var prizes = [];
var scoreZones = [];

var pegs = [];
let pegColors = ['RoyalBlue', 'DarkTurquoise', 'HotPink', 'Red', 'Orange', 'Gold', 'LimeGreen'];
var movingPegsLeft = [];
var movingPegsRight = [];

var leftBoostPeg;
var rightBoostPeg;

var buckets = [];
/////////////// End of Environment objects

/////////////// --- END OF GAMEBOARD PIECES --- ////////////

/////////////// --- SETTING UP FILE --- ///////////////
function preload() {
  hog = loadImage('hedgehog-round-30.png');
  cash = loadImage('$.png');
  banner = loadImage('B.png');
  credits = loadImage('C.png');
  loginAds = loadImage('L.png');
  manualPrize = loadImage('M.png');
  premiumSolo = loadImage('PS.png');
  squareBanner = loadImage('Q.png');
  raffleTicket = loadImage('R.png');
  solo = loadImage('S.png');
  textAds = loadImage('T.png');
}

////////////// --- NETWORK CALLS --- ///////////////
// function to clear screen of elements
function clearScreen() {
  removeElements();
}

// function used to give the user a heads up!
function showMessage(text, scoreMessage) {
  let div;
  let button;
  if (scoreMessage) {
    div = createDiv(`${text} ${scoreMessage}`);
    div.position(13, 300);
    button = createButton('Play Again!');
    button.position(175, 320);
    button.mousePressed(resetGame);
  } else {
    div = createDiv(text);
    div.position(13, 300);
    button = createButton('Okay');
    button.position(190, 320);
    button.mousePressed(clearScreen);
  }
  div.style('backgroundColor', 'black');
  div.style('color', 'white');
  div.style('width', '387px');
  div.style('text-align', 'center');
}

// grabs all needed info to start!
async function fetchGameData() {
  // grab user ID to make sure they can play!
  if (!userID) {
    await axios('https://websitetrafficgames.com/members/hedgehog_config.php?uid').then((result) => {
      userID = result.data;
    });
  }
  // now make sure they have plays left
  if (userID !== '' && userID) {
    await axios(`https://websitetrafficgames.com/members/hedgehog_config.php?d=${userID}`).then((result) => {
      userPlaysLeft = result.data;
    });
    // If they have plays left fetch those prizes
    if (userPlaysLeft > 0) {
      var prizeInfoArray = [];
      await axios('https://websitetrafficgames.com/members/hedgehog_config.php?choose').then((result) => {
        var rawArray = result.data.split('<pre>');
        var lastValue = rawArray.pop();
        var lastString = lastValue.split('</pre>')[0];
        rawArray.push(lastString);
        // Loop over this array starting at 1 because of structure;
        for (var i = 1; i < rawArray.length; i++) {
          var rawString = rawArray[i].replace(/^\[([\s\S]*)]$/, '$1');
          var jsonString = rawString.replace(/,(\s*)}$/, '$1}');
          var obj = JSON.parse(jsonString);
          prizeInfoArray.push(obj);
        }
      });

      if (prizeInfoArray.length === 7) {
        createPrizes(prizeInfoArray);
        // now we set canPlay to true
        if (prizes.length === 7) {
          createScores();
          canPlay = true;
        }
      }
    } else {
      showMessage('You are out of plays!');
      canPlay = false;
    }

  } else {
    canPlay = false;
  }


}

// P5 initial setup
function setup() {
  var canvas = createCanvas(400, 600);
  canvas.parent('Plinko');
  fetchGameData();
  // create the engine
  //engine = Engine.create();
  //create objects/bodies
  //puck = new Puck(200, 100, 20);
  ground = new Ground(width / 2, 700, width, 50);
  walls = new createWalls(50, height);
  createPegs(8);
  createBuckets();
  //create the runner
  runner = Runner.create();
  //run the engine
  Runner.run(runner, engine);
}

function draw() {
  background(5);
  if (puck && inProgress) {
    // loop and show TRAIL FIRST
    for (var i = 0; i < trailArray.length; i++) {

      trailArray[i].show();
    }
    //puck on top
    puck.show();
    puck.shouldRemove();
  }
  ground.show();
  walls.show();
  if (prizes.length !== 0) {
    for (var i = 0; i < prizes.length; i++) {
      prizes[i].show();
    }
  }

  for (var i = 0; i < scoreZones.length; i++) {
    scoreZones[i].show();
  }

  //Regular pegs
  for (var i = 0; i < pegs.length; i++) {
    pegs[i].show();
  }
  // moving pegs
  for (var i = 0; i < movingPegsLeft.length; i++) {
    movingPegsLeft[i].show();

  }
  for (var i = 0; i < movingPegsRight.length; i++) {
    movingPegsRight[i].show();
  }
  leftBoostPeg.show();
  rightBoostPeg.show();
  // buckets
  for (var i = 0; i < buckets.length; i++) {
    buckets[i].show();
  }
  //console.log(movingPegsLeft[0].body.position.x);
  //console.log(Composite.allBodies(engine.world).length);
  // for (var i = 0; i < discs.length; i++) {
  //   discs[i].show();
  // }
}

/////////////// --- GAME FUNCTIONALITY --- ///////////////

// variable to see if the game is in progress
var inProgress;

//function for pressing mouse
function mousePressed() {
  // discs.push(new Puck(mouseX, mouseY, 28));
  if (!inProgress) {
    startDrop(mouseX, mouseY);
  }
}

//check to see if the game is in progress
function startDrop(x, y) {
  //check if the mouse is in the window we allow for dropping
  if (checkBounds(x, y)) {
    // check if they can play if they click at the top
    if (canPlay) {
      // subtract from their available games
      axios(`https://websitetrafficgames.com/members/hedgehog_config.php?d2=${userID}`);
      // add to total number of plays today
      axios(`https://websitetrafficgames.com/members/hedgehog_config.php?t2=${userID}`);
      puck = new Puck(x, y, 30);
      trail = new Trail(x, y, 28);
      trailArray.push(trail);
      inProgress = true;
      canPlay = false;
    } else {
      fetchGameData();
    }
  }
}

//function to check if click was in our bounds
function checkBounds(clickX, clickY) {
  return ((clickX > 7 && clickX < 394) && (clickY > 0 && clickY < 90));
}





/////////////// --- ENVIRONMENT --- ///////////////

// ---The disc itself---
function Puck(x, y, diameter) {
  var options = { restitution: .8, friction: 0 }
  this.body = Bodies.circle(x, y, diameter / 2, options);
  this.diameter = diameter;

  this.body.label = 'hog';

  this.body.hitBoostPeg = function (boostPosition) {
    var xVelocity = (this.position.x) - (boostPosition.x);
    var yVelocity = (this.position.y) - (boostPosition.y);
    xVelocity /= 6;
    yVelocity /= 6;
    console.log('CURRENT X Y velocity', xVelocity, yVelocity);
    Body.setVelocity(this, { x: xVelocity, y: yVelocity });

  }

  Composite.add(engine.world, this.body);


  this.show = function () {
    var pos = this.body.position;
    push();
    angleMode(RADIANS);
    imageMode(CENTER);

    translate(pos.x, pos.y);
    rotate(this.body.angle);

    image(hog, 0, 0)
    pop();
    // console.log('POSITiton ', pos);
    // adds a new trail on to the chain
    this.addTrail();
  }

  this.shouldRemove = function () {
    var pos = this.body.position;
    if (resetClicked) {
      Composite.remove(engine.world, this.body);
      inProgress = false;
      trailArray = [];
      resetClicked = false;
    }
  }

  // Function for adding a trail
  this.addTrail = function () {
    var trail = new Trail(this.body.position.x, this.body.position.y, this.diameter - 2);
    trailArray.push(trail);
  }
}
// --- Trail ---
function Trail(x, y, diameter) {
  this.shouldShow = true;
  this.x = x;
  this.y = y;
  this.startSize = diameter;

  this.show = function () {
    if (!this.shouldShow) {
      return;
    }
    push();
    noStroke();

    fill(30, 220, 100, 125);
    //strokeWeight(3);
    circle(x, y, this.startSize);

    pop();
    this.shrink();
  }

  this.shrink = function () {
    this.startSize -= 1.2;
    if (this.startSize <= 0) {
      this.shouldShow = false;
    }
  }
}
//---The floor---
function Ground(x, y, w, h) {
  this.body = Bodies.rectangle(x, y + (h / 2) - 5, w, h, { isStatic: true });
  this.w = w;
  this.h = h;
  this.body.title = 'ground';
  Composite.add(engine.world, this.body);

  this.show = function () {
    var pos = this.body.position;
    push();
    noStroke();
    fill(200, 20, 20);
    rectMode(CENTER);
    rect(x, y + (this.h / 2) - 5, this.w, this.h);
    pop();
  }
}
//---The walls---
function createWalls(w, h) {
  this.wall1 = Bodies.rectangle(0 - (w / 2) + 5, h / 2, w, h, { isStatic: true });
  this.wall2 = Bodies.rectangle(width + (w / 2) - 5, h / 2, w, h, { isStatic: true });
  this.w = w;
  this.h = h;
  // labeling bodies for info
  this.wall1.label = 'leftWall';
  this.wall2.label = 'rightWall';
  // add them to the composite
  Composite.add(engine.world, this.wall1);
  Composite.add(engine.world, this.wall2);

  this.show = function () {
    var pos1 = this.wall1.position;
    var pos2 = this.wall2.position;
    push();
    noStroke();
    fill('IndianRed');
    rectMode(CENTER);
    rect(0 - (this.w / 2) + 5, h / 2, w, this.h);
    rect(width + (this.w / 2) - 5, h / 2, w, h);
    pop();
  }
}
// ---The Pegs---
function createPegs(n) {
  var spacing = (454 - (n * 10)) / (n - 1);

  //FIRST ROW
  for (var i = 0; i < n; i++) {
    var peg = new Peg(13 + (spacing * i), 100, 10);
    pegs.push(peg);
  }
  // SECOND ROW
  for (var i = 0; i < n - 1; i++) {
    var peg = new Peg(13 + (spacing / 2) + (spacing * i), 140, 10);
    pegs.push(peg);
  }
  // THIRD ROW
  for (var i = 0; i < n; i++) {
    var peg = new Peg(13 + (spacing * i), 180, 10);
    pegs.push(peg);
  }
  // FOURTH ROW
  for (var i = 0; i < n - 1; i++) {
    var peg = new Peg(13 + (spacing / 2) + (spacing * i), 220, 10, true);
    movingPegsLeft.push(peg);
  }
  // FIFTH ROW
  for (var i = 0; i < n; i++) {
    var peg = new Peg(13 + (spacing * i), 260, 10);
    pegs.push(peg);
  }
  // SIXTH ROW
  for (var i = 0; i < n - 1; i++) {

    var peg = new Peg(13 + (spacing / 2) + (spacing * i), 300, 10);
    pegs.push(peg);

  }
  // SEVENTH ROW
  for (var i = 0; i < n; i++) {
    var peg = new Peg(13 + (spacing * i), 340, 10);
    pegs.push(peg);
  }
  // EIGHTH ROW
  for (var i = 0; i < n - 1; i++) {
    var peg = new Peg(13 + (spacing / 2) + (spacing * i), 380, 10, true);
    movingPegsRight.push(peg);
  }
  // NINETH ROW
  for (var i = 0; i < n; i++) {
    // Making room for boost pegs
    if (i === 1 || i === 2 || i === 5 || i === 6) {
      continue;
    }
    var peg = new Peg(13 + (spacing * i), 420, 10);
    pegs.push(peg);
  }
  // TENTH ROW
  for (var i = 0; i < n - 1; i++) {
    // Make room for boost pegs
    // if (i === 0 || i === 2 || i === 4 || i === 6) {
    //   continue;
    // }
    if (i === 1 || i === 5) {
      if (leftBoostPeg) {
        rightBoostPeg = new BoostPeg(13 + (spacing / 2) + (spacing * i), 460, 40, true);
      } else {
        leftBoostPeg = new BoostPeg(13 + (spacing / 2) + (spacing * i), 460, 40, true);
      }

      //pegs.push(boostPeg);
    } else {
      var peg = new Peg(13 + (spacing / 2) + (spacing * i), 460, 10);
      pegs.push(peg);
    }
  }
  // ELEVENTH ROW
  for (var i = 0; i < n; i++) {
    // Making room for boost pegs
    if (i === 1 || i === 2 || i === 5 || i === 6) {
      continue;
    }

    var peg = new Peg(13 + (spacing * i), 500, 10);
    pegs.push(peg);
  }
  // TWELVETH ROW
  for (var i = 0; i < n - 1; i++) {
    var peg = new Peg(13 + (spacing / 2) + (spacing * i), 540, 10, true);
    pegs.push(peg);
  }
}

//THE PEG OBJECT
function Peg(x, y, d, isMoving) {
  // options for changing behaviors
  var options = { isStatic: true, restitution: 0.8, friction: 0.1 }
  this.body = Bodies.circle(x, y, d / 2, options);
  // adding properties for interaction
  this.body.label = 'peg';
  this.body.hitCount = 0;
  this.body.splashes = [];
  this.body.addSplash = function () {
    var pos = this.position;
    //splash variable
    var splashObj = new Splash(pos.x, pos.y, 5, this.circleRadius, pegColors[this.hitCount]);
    this.splashes.push(splashObj);
  }
  // add to the world
  Composite.add(engine.world, this.body);
  // personal properties to pass around
  this.x = x;
  this.y = y;
  this.d = d;

  this.show = function () {
    var pos = this.body.position;
    // reseting colors after game is finished
    if (!inProgress) {
      this.body.hitCount = 0;
    }
    push();
    fill(pegColors[this.body.hitCount]);
    if (isMoving) {
      translate(pos.x, pos.y);
      circle(0, 0, this.d);
    } else {
      circle(this.x, this.y, this.d);
    }
    pop();
    // loop through splashes and show them as they happen
    // remove them if transparency is 0
    for (var i = 0; i < this.body.splashes.length; i++) {
      if (this.body.splashes[i].shouldShow) {
        this.body.splashes[i].show();
      } else {
        this.body.splashes.splice(i, 1);
      }
    }
  }


}
// splash animations for pegs being hit
function Splash(x, y, starter, parentSize, colorValue) {
  // Variables for animations
  this.max = parentSize * 2.2;
  this.starter = starter;
  this.transparency = 100;
  this.shouldShow = true;
  // grab the colors and get the values
  let c = color(colorValue);
  let r = red(c);
  let g = green(c);
  let b = blue(c);

  this.show = function () {
    push();
    noFill();
    strokeWeight(3);
    stroke(r, g, b, this.transparency);
    circle(x, y, this.starter);
    pop();
    this.update();
  }

  this.update = function () {
    this.transparency -= 2;
    this.starter += 1
    if (this.transparency <= 0) {
      this.shouldShow = false;
    }
  }
}

// Special velocity changing boost pegs
function BoostPeg(x, y, d, moveUp) {
  var options = { isStatic: true, restitution: 0.9, friction: 0.4 };
  this.body = Bodies.circle(x, y, d / 2, options);
  this.body.label = 'boostPeg';
  Composite.add(engine.world, this.body);
  this.x = x;
  this.y = y;
  this.d = d;
  this.moveUp = moveUp;

  //see how many pulses are out at one time
  this.count = 0;
  var isPulsing = false;
  //createPulses(this.x, this.y, this.d - 2);
  var pulse1 = new boostPegLights(30);
  var pulse2 = new boostPegLights(10);

  this.show = function () {
    var pos = this.body.position;
    push();
    fill(255, 255, 0);
    translate(pos.x, pos.y);
    circle(0, 0, this.d);
    //circle(this.x, this.y, this.d);
    pop();
    // now animate the radiating colors
    pulse1.show(pos.x, pos.y);
    pulse2.show(pos.x, pos.y);
  }

  this.startPulses = function () {
    isPulsing = true;

  }
}
// waves effect for BoostPegs
function boostPegLights(d) {
  // Variables for animations
  this.max = 400;
  this.starter = d;
  this.transparency = 120;

  this.show = function (x, y) {
    push();
    noFill();
    strokeWeight(3);
    stroke(255, 255, 0, this.transparency);
    translate(x, y);
    circle(0, 0, this.starter);
    pop();
    this.update();
  }

  this.update = function () {
    this.transparency -= 1.9;
    this.starter += 1
    if (this.starter > this.max) {
      this.transparency = 120;
      this.starter = 25;
    }
  }
}

function createBuckets() {
  // bucket one
  var bucket1 = new Bucket(65, 635, 10, 115);
  buckets.push(bucket1);
  // bucket two
  var bucket2 = new Bucket(120, 635, 10, 115);
  buckets.push(bucket2);

  // goal buckets
  var goal1 = new Bucket(176, 635, 10, 115);
  buckets.push(goal1);
  var goal2 = new Bucket(224, 635, 10, 115);
  buckets.push(goal2);
  ///////////////

  // bucket 3
  var bucket3 = new Bucket(280, 635, 10, 115);
  buckets.push(bucket3);
  // bucket 4
  var bucket3 = new Bucket(335, 635, 10, 115);
  buckets.push(bucket3);
}

function Bucket(x, y, width, height) {
  var chamfer = { radius: 10 }
  var options = { isStatic: true, restitution: 0.7, friction: 0.5, chamfer: chamfer };
  this.body = Bodies.rectangle(x, y, width, height, options);
  Composite.add(engine.world, this.body);
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;

  this.show = function () {
    var pos = this.body.position;
    push();
    fill(50, 180, 30);
    rectMode(CENTER);
    rect(this.x, this.y, this.width, this.height, 10);
    pop();
  }
}
// Create prize sections
function createPrizes(prizeInfoArray) {
  var xValue = 32;
  var prizeIndex = 0;
  for (var i = 0; i < prizeInfoArray.length; i++) {
    prizeIndex += 1;
    var prize = new Prize(xValue, 575, 30, 30, prizeInfoArray[i][`prizeid${prizeIndex}`], prizeInfoArray[i].Amount, prizeInfoArray[i].Type);
    if (i !== 2 && i !== 3) {
      xValue += 60;
    } else {
      xValue += 48;
    }

    prizes.push(prize);
  }

}

// images above the buckets and data
function Prize(x, y, width, height, id, amount, type) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.amount = amount;
  this.prizeid = id;

  this.show = function () {
    push();
    imageMode(CENTER);
    this.displayImage(this.type);
    pop();
  }

  this.displayImage = function (type) {
    // grab the correct image
    switch (type) {
      case '$':
        image(cash, x, y, width, height);
        break;
      case 'B':
        image(banner, x, y, width, height);
        break;
      case 'C':
        image(credits, x, y, width, height);
        break;
      case 'L':
        image(loginAds, x, y, width, height);
        break;
      case 'M':
        image(manualPrize, x, y, width, height);
        break;
      case 'PS':
        image(premiumSolo, x, y, width, height);
        break;
      case 'Q':
        image(squareBanner, x, y, width, height);
        break;
      case 'R':
        image(raffleTicket, x, y, width, height);
        break;
      case 'S':
        image(solo, x, y, width, height);
        break;
      case 'T':
        image(textAds, x, y, width, height);
        break;
      default:
        image(banner, x, y, width, height);
        break;
    }
  }
}

// Create score zones
function createScores() {
  if (scoreZones.length === 7) {
    for (var i = 0; i < prizes.length; i++) {
      scoreZones[i].body.prizeId = prizes[i].prizeid;
      scoreZones[i].body.type = prizes[i].type;
      scoreZones[i].body.amount = prizes[i].amount;
    }
  } else {
    for (var i = 0; i < prizes.length; i++) {
      var x = prizes[i].x;
      var y = prizes[i].y + 100;
      var id = prizes[i].prizeid;
      var amount = prizes[i].amount;
      var type = prizes[i].type;
      var scoreZone = new Score(x, y, id, amount, type, i + 1);
      scoreZones.push(scoreZone);
    }
  }
}

function Score(x, y, id, amount, type, slot) {
  var options = { isStatic: true, restitution: 0, friction: 1 };
  this.body = Bodies.circle(x, y, 5, options);
  Composite.add(engine.world, this.body);
  this.body.label = 'score';
  this.body.prizeId = id;
  this.body.type = type;
  this.body.slot = slot;
  this.body.amount = amount;

  this.show = function () {
    var pos = this.body.position;
    push();
    fill(200, 30, 80);
    circle(pos.x, pos.y, 10);
    pop();
  }
}
/////////////// --- EVENTS & COLLISIONS --- ///////////////
var moving4thPegsLeft = true;
var moving8thPegsRight = true;

//Moving the pegs before the update frame
Events.on(engine, 'beforeUpdate', function (event) {

  if (moving4thPegsLeft) {
    moveLeft(movingPegsLeft[0].body.position, movingPegsLeft, 4);
  } else {
    moveRight(movingPegsLeft[0].body.position, movingPegsLeft, 4);
  }

  if (moving8thPegsRight) {
    moveRight(movingPegsRight[0].body.position, movingPegsRight, 8);
  } else {
    moveLeft(movingPegsRight[0].body.position, movingPegsRight, 8);
  }

  // move the left boost up and down
  if (leftBoostPeg) {
    if (leftBoostPeg.moveUp) {
      moveUp(leftBoostPeg);
    } else {
      moveDown(leftBoostPeg);
    }
  }
  // move the right boost up and down
  if (rightBoostPeg) {
    if (rightBoostPeg.moveUp) {
      moveUp(rightBoostPeg);
    } else {
      moveDown(rightBoostPeg);
    }
  }
});


function moveRight(peg, pegArray, row) {
  for (var i = 0; i < pegArray.length; i++) {
    Body.translate(pegArray[i].body, { x: 0.5, y: 0 });
  }
  if (peg.x > 48) {
    if (row === 8) {
      moving8thPegsRight = false;
    }
    if (row === 4) {
      moving4thPegsLeft = true;
    }
  }
}

function moveLeft(peg, pegArray, row) {
  for (var i = 0; i < pegArray.length; i++) {
    Body.translate(pegArray[i].body, { x: -0.5, y: 0 });
  }
  if (peg.x < 29) {
    if (row === 8) {
      moving8thPegsRight = true;
    }
    if (row === 4) {
      moving4thPegsLeft = false;
    }
  }
}

function moveUp(peg) {
  Body.translate(peg.body, { x: 0, y: -1.5 });
  if (peg.body.position.y <= 430) {
    peg.moveUp = false;
  }
}

function moveDown(peg) {
  Body.translate(peg.body, { x: 0, y: 1.5 });
  if (peg.body.position.y >= 490) {
    peg.moveUp = true;
  }
}

// Collisions

function formatPrizeMessage(amount, letter) {
  switch (letter) {
    case '$':
      return `$${amount} in cash!`
      break;
    case 'B':
      return `${amount} banner(s)!`
      break;
    case 'C':
      return `${amount} credits!`
      break;
    case 'L':
      return `${amount} login ads!`
      break;
    case 'M':
      return `${amount} manual prize!`
      break;
    case 'PS':
      return `${amount} premium solos!`
      break;
    case 'Q':
      return `${amount} square banners!`
      break;
    case 'R':
      return `${amount} raffle ticket(s)!`
      break;
    case 'S':
      return `${amount}  solos!`
      break;
    case 'T':
      return `${amount} text ads!`
      break;
    default:
      return `${amount} banners!`
      break;
  }
}

function resetGame() {
  resetClicked = true;
  prizes = [];
  removeElements();
  // for (var i = 0; i < scoreZones.length; i++) {
  //   console.log('REMOVING: ', scoreZones[i]);
  //   Composite.remove(engine.world, scoreZones[i]);
  // }
  hasWon = false;
  fetchGameData();
}

Events.on(engine, 'collisionStart', function (event) {
  //console.log(event.pairs[0]);
  // Peg Collision
  var peg;
  var boost;
  var hog;
  if (event.pairs[0].bodyA.label === 'peg') {
    peg = event.pairs[0].bodyA;
    hog = event.pairs[0].bodyB;
  }
  if (event.pairs[0].bodyB.label === 'peg') {
    peg = event.pairs[0].bodyB;
    hog = event.pairs[0].bodyA;
  }
  if (peg) {
    if (peg.hitCount === 6) {
      peg.hitCount = 0;
    } else {
      peg.hitCount += 1;
      peg.addSplash();
    }
  }
  ///////
  // Boost peg collision
  if (event.pairs[0].bodyA.label === 'boostPeg') {
    boost = event.pairs[0].bodyA;
    hog = event.pairs[0].bodyB;
    hog.hitBoostPeg(boost.position);
  }
  if (event.pairs[0].bodyB.label === 'boostPeg') {
    boost = event.pairs[0].bodyB;
    hog = event.pairs[0].bodyA;
    hog.hitBoostPeg(boost.position);
  }

  // SCORE COLLISIONS
  if (event.pairs[0].bodyA.label === 'score') {
    score = event.pairs[0].bodyA;
    hog = event.pairs[0].bodyB;
    // post the prize
    if (!hasWon) {
      hasWon = true;
      axios.post(`https://websitetrafficgames.com/members/hedgehog_config.php?w=${score.prizeId}&uid=${userID}`);
      var message = formatPrizeMessage(score.amount, score.type);
      showMessage('You have won: ', message);
    }
    console.log(score.slot);
  }
  if (event.pairs[0].bodyB.label === 'boostPeg') {
    score = event.pairs[0].bodyB;
    hog = event.pairs[0].bodyA;
    // post the prize
    if (!hasWon) {
      hasWon = true;
      axios.post(`https://websitetrafficgames.com/members/hedgehog_config.php?w=${score.prizeId}&uid=${userID}`);
      var message = formatPrizeMessage(score.amount, score.type);
      showMessage('You have won: ', message);
    }
    console.log(score.slot);
  }
});
