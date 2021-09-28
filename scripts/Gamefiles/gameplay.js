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
var puck;
var ground;
var walls;
var pegs = [];
var movingPegsLeft = [];
var movingPegsRight = [];
//var discs = [];

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
  //create the runner
  runner = Runner.create();
  //run the engine
  Runner.run(runner, engine);
}

function draw() {
  background(172);
  if (puck && !puck.isOffScreen()) {
    puck.show();
  }
  //ground.show();
  walls.show();

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

  //console.log(movingPegsLeft[0].body.position.x);
  //console.log(Composite.allBodies(engine.world));
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
  console.log(Body);
}

//check to see if the game is in progress
function startDrop(x, y) {
  //check if the mouse is in the window we allow for dropping
  if (checkBounds(x, y)) {
    puck = new Puck(x, y, 30);
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
  Composite.add(engine.world, this.body);

  this.show = function () {
    var pos = this.body.position;

    push();
    translate(pos.x, pos.y);
    circle(0, 0, this.diameter);
    pop();
  }

  this.isOffScreen = function () {
    var pos = this.body.position;
    if (pos.y > 600) {
      Composite.remove(engine.world, this.body);
      inProgress = false;
      return true;
    } else {
      return false;
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
  Composite.add(engine.world, this.wall1);
  Composite.add(engine.world, this.wall2);

  this.show = function () {
    var pos1 = this.wall1.position;
    var pos2 = this.wall2.position;
    push();
    noStroke();
    fill(80, 20, 100);
    rectMode(CENTER);
    rect(0 - (this.w / 2) + 5, h / 2, w, this.h);
    rect(width + (this.w / 2) - 5, h / 2, w, h);
    pop();
  }
}
// ---The Pegs---
function createPegs(n) {
  var spacing = (454 - (n * 10)) / (n - 1);
  //var spacing2 = (479 - (n * 8)) / (n - 1);
  // var topRowX = 32;
  // var lowRowX = 16.5;
  // for (var i = 0; i < n; i++) {
  //   var peg = new Peg(topRowX + (spacing * i), 125, 6);
  //   pegs.push(peg);
  // }

  //FIRST ROW
  for (var i = 0; i < n; i++) {
    var peg = new Peg(13 + (spacing * i), 125, 10);
    pegs.push(peg);
  }
  // SECOND ROW
  for (var i = 0; i < n - 1; i++) {
    var peg = new Peg(13 + (spacing / 2) + (spacing * i), 165, 10);
    pegs.push(peg);
  }
  // THIRD ROW
  for (var i = 0; i < n; i++) {
    var peg = new Peg(13 + (spacing * i), 205, 10);
    pegs.push(peg);
  }
  // FOURTH ROW
  for (var i = 0; i < n - 1; i++) {
    var peg = new Peg(13 + (spacing / 2) + (spacing * i), 245, 10, true);
    movingPegsLeft.push(peg);
  }
  // FIFTH ROW
  for (var i = 0; i < n; i++) {
    var peg = new Peg(13 + (spacing * i), 285, 10);
    pegs.push(peg);
  }
  // SIXTH ROW
  for (var i = 0; i < n - 1; i++) {
    var peg = new Peg(13 + (spacing / 2) + (spacing * i), 325, 10);
    pegs.push(peg);
  }
  // SEVENTH ROW
  for (var i = 0; i < n; i++) {
    var peg = new Peg(13 + (spacing * i), 365, 10);
    pegs.push(peg);
  }
  // EIGHTH ROW
  for (var i = 0; i < n - 1; i++) {
    var peg = new Peg(13 + (spacing / 2) + (spacing * i), 405, 10, true);
    movingPegsRight.push(peg);
  }
  // NINETH ROW
  for (var i = 0; i < n; i++) {
    var peg = new Peg(13 + (spacing * i), 445, 10);
    pegs.push(peg);
  }
  // TENTH ROW
  for (var i = 0; i < n - 1; i++) {
    if (i === 1 || i === 5) {
      var boostPeg = new BoostPeg(13 + (spacing / 2) + (spacing * i), 485, 25);
      pegs.push(boostPeg);
    } else {
      var peg = new Peg(13 + (spacing / 2) + (spacing * i), 485, 10);
      pegs.push(peg);
    }

  }
  // ELEVENTH ROW
  for (var i = 0; i < n; i++) {
    var peg = new Peg(13 + (spacing * i), 525, 10);
    pegs.push(peg);
  }
}

function Peg(x, y, d, isMoving) {
  var options = { isStatic: true, restitution: 0.3, friction: 0.4 }
  this.body = Bodies.circle(x, y, d / 2, options);
  Composite.add(engine.world, this.body);
  this.x = x;
  this.y = y;
  this.d = d;
  console.log(this.body.position);
  this.show = function () {
    var pos = this.body.position;
    push();
    fill(50, 80, 160);
    if (isMoving) {
      translate(pos.x, pos.y);
      circle(0, 0, this.d);
    } else {
      circle(this.x, this.y, this.d);
    }
    pop();
  }
}

function BoostPeg(x, y, d) {
  var options = { isStatic: true, restitution: 0.9, friction: 0.4 }
  this.body = Bodies.circle(x, y, d / 2, options);
  Composite.add(engine.world, this.body);
  this.x = x;
  this.y = y;
  this.d = d;

  this.show = function () {
    var pos = this.body.position;
    push();
    fill(200, 80, 30);
    circle(this.x, this.y, this.d);
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
