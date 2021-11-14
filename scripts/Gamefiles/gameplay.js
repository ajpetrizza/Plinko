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
// Game board pieces
var hog;
var puck;
var trail;
var trailArray = [];
var ground;
var walls;
var pegs = [];
let pegColors = ['RoyalBlue', 'DarkTurquoise', 'HotPink', 'Red', 'Orange', 'Gold', 'LimeGreen'];
var movingPegsLeft = [];
var movingPegsRight = [];
var buckets = [];
//var discs = [];

/////////////// --- SETTING UP FILE --- ///////////////
function preload() {
  hog = loadImage('hedgehog-round-30.png');
}

// P5 initial setup
function setup() {
  var canvas = createCanvas(400, 600);
  canvas.parent('Plinko');
  // create the engine
  //engine = Engine.create();
  //create objects/bodies
  //puck = new Puck(200, 100, 20);
  //ground = new Ground(width / 2, height, width, 50);
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
    puck.isOffScreen();
  }
  //ground.show();
  walls.show();
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
    puck = new Puck(x, y, 30);
    trail = new Trail(x, y, 28);
    trailArray.push(trail);
    inProgress = true;
  }
}

//function to check if click was in our bounds
function checkBounds(clickX, clickY) {
  console.log(bounds);
  console.log('X & Y: ', clickX, clickY);
  return ((clickX > bounds.left && clickX < bounds.right) && (clickY > bounds.top && clickY < bounds.bottom - 500));
}





/////////////// --- ENVIRONMENT --- ///////////////

// ---The disc itself---
function Puck(x, y, diameter) {
  var options = { restitution: .8, friction: 0 }
  this.body = Bodies.circle(x, y, diameter / 2, options);
  this.diameter = diameter;

  this.body.label = 'hog';
  Composite.add(engine.world, this.body);

  //this.trailArray = [];

  this.show = function () {
    var pos = this.body.position;
    push();
    angleMode(RADIANS);
    imageMode(CENTER);
    //translate(pos.x - 15, pos.y - 15);
    translate(pos.x, pos.y);
    rotate(this.body.angle);
    //circle(0, 0, this.diameter);
    image(hog, 0, 0)
    pop();
    this.addTrail();
    //show the trail
    // for (var i = 0; i < this.trailArray.length; i++) {
    //   this.trailArray[i].show();
    // }
  }

  this.isOffScreen = function () {
    var pos = this.body.position;
    if (pos.y > 620) {
      Composite.remove(engine.world, this.body);
      inProgress = false;
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
    noFill();
    //if (this.shouldShow) {
    stroke(30, 200, 10, 50);
    strokeWeight(3);
    circle(x, y, this.startSize);
    //}
    pop();
    this.shrink();
  }

  this.shrink = function () {
    this.startSize -= 1;
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
  Composite.add(engine.world, this.body);

  this.show = function () {
    var pos = this.body.position;
    push();
    noStroke();
    fill(80, 20, 100);
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
    var peg = new Peg(13 + (spacing * i), 420, 10);
    pegs.push(peg);
  }
  // TENTH ROW
  for (var i = 0; i < n - 1; i++) {
    if (i === 1 || i === 5) {
      var boostPeg = new BoostPeg(13 + (spacing / 2) + (spacing * i), 460, 25);
      pegs.push(boostPeg);
    } else {
      var peg = new Peg(13 + (spacing / 2) + (spacing * i), 460, 10);
      pegs.push(peg);
    }
  }
  // ELEVENTH ROW
  for (var i = 0; i < n; i++) {
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
  this.transparency = 80;
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
function BoostPeg(x, y, d) {
  var options = { isStatic: true, restitution: 0.9, friction: 0.4 };
  this.body = Bodies.circle(x, y, d / 2, options);
  this.body.label = 'boostPeg';
  Composite.add(engine.world, this.body);
  this.x = x;
  this.y = y;
  this.d = d;

  //see how many pulses are out at one time
  this.count = 0;
  var isPulsing = false;
  //createPulses(this.x, this.y, this.d - 2);
  var pulse1 = new boostPegLights(x, y, d - 5, 30);
  var pulse2 = new boostPegLights(x, y, d - 20, 30);

  this.show = function () {
    var pos = this.body.position;
    push();
    fill(255, 255, 0);
    circle(this.x, this.y, this.d);
    pop();
    // now animate the radiating colors
    pulse1.show();
    pulse2.show();
  }

  this.startPulses = function () {
    isPulsing = true;

  }
}
// waves effect for BoostPegs
function boostPegLights(x, y, d, parentSize) {
  // Variables for animations
  this.max = parentSize * 2.2;
  this.starter = d;
  this.transparency = 120;

  this.show = function () {
    push();
    noFill();
    strokeWeight(3);
    stroke(255, 255, 0, this.transparency);
    circle(x, y, this.starter);
    pop();
    this.update();
  }

  this.update = function () {
    this.transparency -= 2;
    this.starter += 0.5
    if (this.starter > this.max) {
      this.transparency = 120;
      this.starter = 25;
    }
  }
}

function createBuckets() {
  // bucket one
  var bucket1 = new Bucket(65, 620, 10, 75);
  buckets.push(bucket1);
  // bucket two
  var bucket2 = new Bucket(120, 620, 10, 75);
  buckets.push(bucket2);

  // goal buckets
  var goal1 = new Bucket(176, 620, 10, 75);
  buckets.push(goal1);
  var goal2 = new Bucket(224, 620, 10, 75);
  buckets.push(goal2);
  ///////////////

  // bucket 3
  var bucket3 = new Bucket(280, 620, 10, 75);
  buckets.push(bucket3);
  // bucket 4
  var bucket3 = new Bucket(335, 620, 10, 75);
  buckets.push(bucket3);
}

function Bucket(x, y, width, height) {
  var chamfer = { radius: 10 }
  var options = { isStatic: true, restitution: 0.7, friction: 0.8, chamfer: chamfer };
  this.body = Bodies.rectangle(x, y, width, height, options);
  Composite.add(engine.world, this.body);
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;

  this.show = function () {
    var pos = this.body.position;
    push();
    fill(50, 120, 30);
    rectMode(CENTER);
    rect(this.x, this.y, this.width, this.height, 10);
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

// Collisions
Events.on(engine, 'collisionEnd', function (event) {
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
    console.log(event.pairs[0]);
    Body.setVelocity(hog, { x: 0, y: -10 });
  }
  if (event.pairs[0].bodyB.label === 'boostPeg') {
    boost = event.pairs[0].bodyB;
    hog = event.pairs[0].bodyA;
    Body.setVelocity(hog, { x: 0, y: -10 });
  }
});
