// Aliases
var Engine = Matter.Engine,
  Bodies = Matter.Bodies,
  Runner = Matter.Runner,
  Composite = Matter.Composite;

// Possible globals for the need of references
const screen = document.getElementById('Plinko');
const bounds = screen.getBoundingClientRect();
var engine;
var runner;
var puck;
var ground;
var walls;
//var discs = [];

// P5 initial setup
function setup() {
  var canvas = createCanvas(400, 600);
  canvas.parent('Plinko');
  // create the engine
  engine = Engine.create();
  //create objects/bodies
  //puck = new Puck(200, 100, 20);
  //ground = new Ground(width / 2, height, width, 50);
  walls = new createWalls(50, height);
  //create the runner
  runner = Runner.create();
  //run the engine
  Runner.run(runner, engine);
  console.log(puck);
}

function draw() {
  background(172);
  if (puck && !puck.isOffScreen()) {
    puck.show();
  }
  //ground.show();
  walls.show();
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
}

//check to see if the game is in progress
function startDrop(x, y) {
  //check if the mouse is in the window we allow for dropping
  if (checkBounds(x, y)) {
    puck = new Puck(x, y, 28);
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
  this.body = Bodies.circle(x, y, diameter / 2);
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
    //var pos2 = this.wall2.position;
    push();
    noStroke();
    fill(80, 20, 100);
    rectMode(CENTER);
    rect(0 - (this.w / 2) + 5, h / 2, w, this.h);
    rect(width + (this.w / 2) - 5, h / 2, w, h);
    pop();
  }
}
