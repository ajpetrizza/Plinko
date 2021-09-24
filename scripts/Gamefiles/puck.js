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
}