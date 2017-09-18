"use strict";

// Setup the canvas element
var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");
var cWidth = c.width = window.innerWidth;
var cHeight = c.height = window.innerHeight;

// Add the event listener for page resize
window.addEventListener("resize", function() {
  cWidth = c.width = window.innerWidth;
  cHeight = c.height = window.innerHeight;
}, false);

var particles = [];
var i;

// Game loop variables
var state = "playing";
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



function Particle() {
  this.x = 0;
  this.y = 0;
  this.vx = 0;
  this.vy = 0;
  this.size = 5;
  this.maxSpeed = 8;

  this.randomPos = function() {
    this.x = cWidth * Math.random();
    this.y = cHeight * Math.random();
  };

  this.randomVel = function() {
    this.vx = (Math.random() * this.maxSpeed) * (Math.round(Math.random())*2-1);
    this.vy = (Math.random() * this.maxSpeed) * (Math.round(Math.random())*2-1);
  };

  this.draw = function() {
    ctx.fillStyle = "#abc";
    ctx.fillRect(this.x, this.y, this.size, this.size);
  };

  this.checkCollision = function() {
    if (this.x < 0 || this.x > cWidth) { this.vx *= -1; }
    if (this.y < 0 || this.y > cHeight) { this.vy *= -1; }
  };
}



for (i = 0; i < 5; i++) {
  var p = new Particle();
  p.randomPos();
  p.randomVel();
  particles.push(p);
}



// The main game loop
function main() {

  var now = Date.now();
  var delta = now - then;

  var p;

  if (state === "playing") {

    ctx.clearRect(0, 0, cWidth, cHeight);

    // If mouse is down, spawn a particle
    if (mouse.down) {
      p = new Particle();
      p.randomVel();
      p.x = mouse.x;
      p.y = mouse.y;
      particles.push(p);
    }

    for (i = 0; i < particles.length; i++) {
      p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      p.checkCollision();

      p.draw();

    }

  window.requestAnimationFrame(main);
  }

  then = now;
}

// Start the main loop
main();
