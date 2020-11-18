"use strict";

const maxParticles = 10000,
  particleSize = 2,
  emissionRate = 10,
  objectSize = 4;


const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function Particle(point, velocity, acceleration) {
  this.position = point || new Vector(0, 0);
  this.velocity = velocity || new Vector(0, 0);
  this.acceleration = acceleration || new Vector(0, 0);
}

Particle.prototype.submitToFields = function (fields) {
  let totalAccelerationX = 0;
  let totalAccelerationY = 0;

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];

    const vectorX = field.position.x - this.position.x;
    const vectorY = field.position.y - this.position.y;


    const force = field.mass / Math.pow(vectorX*vectorX+vectorY*vectorY,1.5);

    totalAccelerationX += vectorX * force;
    totalAccelerationY += vectorY * force;
  }

  this.acceleration = new Vector(totalAccelerationX, totalAccelerationY);
};

Particle.prototype.move = function () {
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
};

function Field(point, mass) {
  this.position = point;
  this.setMass(mass);
}

Field.prototype.setMass = function(mass) {
  this.mass = mass;
  this.drawColor = mass < 0 ? "#f00" : "#0f0";
  if(mass === 0) {
    this.drawColor = '#fff';
  }
}

function Vector(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

Vector.prototype.add = function(vector) {
  this.x += vector.x;
  this.y += vector.y;
}

Vector.prototype.getMagnitude = function () {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.getAngle = function () {
  return Math.atan2(this.y,this.x);
};

Vector.fromAngle = function (angle, magnitude) {
  return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};

function Emitter(point, velocity, spread) {
  this.position = point;
  this.velocity = velocity;
  this.spread = spread || Math.PI / 32;
  this.drawColor = "#999";
}

Emitter.prototype.emitParticle = function() {
  const angle = this.velocity.getAngle() + this.spread - (Math.random() * this.spread * 2);

  const magnitude = this.velocity.getMagnitude();

  const position = new Vector(this.position.x, this.position.y);

  const velocity = Vector.fromAngle(angle, magnitude);

  return new Particle(position,velocity);
};

function addNewParticles() {
  if (particles.length > maxParticles) return;

  for (let i = 0; i < emitters.length; i++) {
    for (let j = 0; j < emissionRate; j++) {
      particles.push(emitters[i].emitParticle());
    }
  }
}

function plotParticles(boundsX, boundsY) {
  const currentParticles = [];

  for (let i = 0; i < particles.length; i++) {
    let particle = particles[i];
    let pos = particle.position;
    if (pos.x < 0 || pos.x > boundsX || pos.y < 0 || pos.y > boundsY) continue;

    particle.submitToFields(fields);

    particle.move();

    currentParticles.push(particle);
  }

  particles = currentParticles;
}

function drawParticles() {
  ctx.fillStyle = 'rgb(255,0,255)';
  for (let i = 0; i < particles.length; i++) {
    let position = particles[i].position;
    ctx.fillRect(position.x, position.y, particleSize, particleSize);
  }
}

function drawCircle(object) {
  ctx.fillStyle = object.drawColor;
  ctx.beginPath();
  ctx.arc(object.position.x, object.position.y, objectSize, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

let particles = [];

const midX = canvas.width / 2;
const midY = canvas.height / 2;

const emitters = [new Emitter(new Vector(midX - 150, midY), Vector.fromAngle(0, 2))];

let fields = [];

function loop() {
  clear();
  update();
  draw();
  queue();
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
  addNewParticles();
  plotParticles(canvas.width, canvas.height);
}

function draw() {
  drawParticles();
  fields.forEach(drawCircle);
  emitters.forEach(drawCircle);
}

function queue() {
  window.requestAnimationFrame(loop);
}

loop();

let mass = 200;
const mass_indicator = document.querySelector('.mass-value');
mass_indicator.textContent = mass;


document.addEventListener('click', (e) => {
    if(e.target.className !== 'plus' && e.target.className !== 'minus' && e.target.className !== 'refresh'){
      fields.push(new Field(new Vector(e.clientX, e.clientY), mass))
    }
    if(e.target.className === 'plus') {
      mass += 100;
      mass_indicator.textContent = mass;
    }
    if(e.target.className === 'minus') {
      mass -= 100;
      mass_indicator.textContent = mass;
    }
    if(e.target.className === 'refresh'){
      fields = [];
      mass = 200;
      mass_indicator.textContent = mass;
    }
})


