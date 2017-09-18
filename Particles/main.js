/* global Stats, dat */
"use strict";

var i, j;
var PI = Math.PI;

// Setup the canvas element
var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");
var cWidth = canvas.width = window.innerWidth;
var cHeight = canvas.height = window.innerHeight;

// Add the event listener for page resize
window.addEventListener("resize", function() {
  cWidth = canvas.width = window.innerWidth;
  cHeight = canvas.height = window.innerHeight;
}, false);

// Add the event listener for page resize
window.addEventListener("resize", function() {
  cWidth = c.width = window.innerWidth;
  cHeight = c.height = window.innerHeight;
}, false);

// Setup the stats.js widgit
var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = "absolute";
stats.domElement.style.left = "0px";
stats.domElement.style.top = "0px";
document.body.appendChild(stats.domElement);

// Setup the dat.gui control widgit
function Controls() {
  this.maxParticles = 5000;
  this.emissionRate = 4;
  this.particleSize = 1.5;
  this.currentParticles = 0;
  this.pauseEmission = false;
  this.gravityStrength = 0.05;
  this.gravityDirection = 90;
}

var cont = new Controls();
var gui = new dat.GUI();

var particles = [];
var i, j;

gui.add(cont, "maxParticles").step(1);
gui.add(cont, "currentParticles").listen();
gui.add(cont, "emissionRate", 1, 20).step(1);
gui.add(cont, "particleSize", 0, 5);
gui.add(cont, "pauseEmission");
gui.add(cont, "gravityStrength", -0.5, 0.5).step(0.01);
gui.add(cont, "gravityDirection", 0, 360).step(5);

// Game loop variables
var then = 0;



// Mouse event listening
var mouse = {
  x: cWidth / 2 || 0,
  y: cHeight / 2 || 0,
  down: false
};
window.addEventListener("mousemove", function(e) {
  mouse.x = e.x;
  mouse.y = e.y;
});
window.addEventListener("mousedown", function(e) {
  mouse.x = e.x;
  mouse.y = e.y;
  mouse.down = true;
});
window.addEventListener("mouseup", function(e) {
  mouse.x = e.x;
  mouse.y = e.y;
  mouse.down = false;
});



function Vector(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}
// Add vector2 to Vector
Vector.prototype.add = function(vector2) {
  this.x += vector2.x;
  this.y += vector2.y;
};
// Get length of Vector
Vector.prototype.getMagnitude = function () {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
// Get the angle of Vector
Vector.prototype.getAngle = function() {
  return Math.atan2(this.y, this.x);
};
// Make a new vector based on angle and magnitude
Vector.fromAngle = function(angle, magnitude) {
  return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};



function Particle(pos, vel, acc) {
  this.pos = pos || new Vector(0, 0);
  this.vel = vel || new Vector(0, 0);
  this.acc = acc || new Vector(0, 0);
}

Particle.prototype.move = function() {
  // Add acceleration to velocity vector
  this.vel.add(this.acc);
  // Add velocity to position vector
  this.pos.add(this.vel);
};



function Emitter(pos, emitDir, spread) {
  this.pos = pos;
  this.emitDir = emitDir || new Vector(0, 0); // Vector of emission
  this.spread = spread || 0.1; // The arc where particles are emitted
  this.moving = false; // Used when click dragging the emitter
}

Emitter.prototype.emit = function() {
  // Angle of the particle is where the emitter is moving +/- spread
  var angle = this.emitDir.getAngle() + this.spread - (Math.random() * this.spread * 2);

  // Magnitude of the particle is same as the emitter's
  var magnitude = this.emitDir.getMagnitude();

  // Spawn position is at emitter's current position
  var position = new Vector(this.pos.x, this.pos.y);

  // Get the particles velocity vector
  var velocity = Vector.fromAngle(angle, magnitude);

  // Return the particle object
  return new Particle(position, velocity);
};



function update() {

  for (i = 0; i < emitters.length; i++) {

    var m = mouse, e = emitters[i].pos;

    // If the mouse is clicking over the emitter
    if (m.x > e.x - 10 && m.x < e.x + 10 && m.y > e.y - 10 && m.y < e.y + 10 && m.down) {
      e.moving = true;
    }

    if (m.down && e.moving) {
      e.x = m.x;
      e.y = m.y;
    } else {
      e.moving = false;
    }



    if (particles.length < cont.maxParticles && !cont.pauseEmission) {

      for (j = 0; j < cont.emissionRate; j++) {

        particles.push(emitters[i].emit());

      }
    }
  }

  // Loop (backwards) through particles
  for (i = particles.length; i > 0; i--) {

    var p = particles[i - 1].pos;
    var v = particles[i - 1].vel;

    // Remove from world
    if (p.x < 0 || p.x > cWidth || p.y < 0 || p.y > cHeight) {

      particles.splice(i - 1, 1);

    } else {

      // Add some gravity
      particles[i - 1].acc = Vector.fromAngle((cont.gravityDirection*PI)/180, cont.gravityStrength);
      // Then run move on each particle
      particles[i - 1].move();

    }
  }

  cont.currentParticles = particles.length;
}



function draw() {

  ctx.clearRect(0, 0, cWidth, cHeight);

  // Loop through particles and draw a square
  for (i = 0; i < particles.length; i++) {

    var pos = particles[i].pos;
    ctx.fillStyle = "#00F";
    ctx.fillRect(pos.x, pos.y, cont.particleSize, cont.particleSize);
  }

  // Loop through emitters and draw a circle
  for (i = 0; i < emitters.length; i++) {

    var emit = emitters[i];
    var radius = 10;

    // Draw the main circle
    ctx.beginPath();
    ctx.arc(emit.pos.x, emit.pos.y, radius, 0, 2 * PI);
    ctx.closePath();
    ctx.fillStyle = "#F00";
    ctx.fill();

    // Draw the arc of emission
    ctx.beginPath();
    ctx.moveTo(emit.pos.x, emit.pos.y);
    ctx.arc(emit.pos.x, emit.pos.y, radius, emit.emitDir.getAngle() - emit.spread,
            emit.emitDir.getAngle() + emit.spread);
    ctx.lineTo(emit.pos.x, emit.pos.y);
    ctx.closePath();
    ctx.fillStyle = "#0F0";
    ctx.fill();
  }
}



// The main game loop
function main() {

  stats.begin();

  var now = Date.now();
  var delta = now - then;

  update();
  draw();

  then = now;

  window.requestAnimationFrame(main);

  stats.end();

}

//
var particles = [];
var emitters = [
  new Emitter(new Vector(100, cHeight * 0.25), Vector.fromAngle(0, 3), PI / 4)
];

console.log(emitters);

// Start the main loop
main();
