var particles = [];
var nums;
var particleDensity = 4000;
var noiseScale = 800;
var maxLife = 10;
var simulationSpeed = 0.2;
var fadeFrame = 0;
var backgroundColor;
var numModes = 4;
var invertColors = false;
var radius = 2;
var radiusTarget = 2;
var transpBG = 255;
var transpBGTarget = 255;
var transp = 255;
var transpTarget = 255;
var easing = .1;
var easing2 = .01;
var img;
var myPixels = []; 
var startTimer;


// position booleans
var isBacteria = true;
var isWord = false;
var isCloud = false;
var isVanGogh = false;
var isEscape = false;


function preload() {

  img = loadImage('assets/hello.png');

}





function setup() {

  noStroke();

  nums = 150;

  backgroundColor = color(0);

  createCanvas(windowWidth, windowHeight);

  background(backgroundColor);


  for (var i=0; i<img.width; i++) {
    for (var j=0; j<img.height; j++) {
      var c = img.get(i, j);
      if (red(c) == 255) {
        //console.log(c);
        myPixels.push(new WhitePixels(i, j));
      }
    }
  }

  // for (var i=0; i<myPixels.length; i++) console.log(myPixels[i].x);

  for(var i = 0; i < nums; i++){
    particles[i] = new Particle(int(random(myPixels.length)));
  }

}





function draw() {  

  if (keyIsPressed) {

    if (key == ' ') {

      for(var i = 0; i < nums; i++) {

        particles[i].posTarget.x = width/2;
        particles[i].posTarget.y = height/2;

        particles[i].pos.x = width/2;
        particles[i].pos.y = height/2;

        background(0);

      }

    }

    if (key == 'z') {
      isEscape = true;
      startTimer = millis();
    }

    if (key == 'a') {
      isWord = true;
      startTimer = millis();
    }

    if (key == 'e') {
      isCloud = true;
    }

    if (key == 'E') {
      isCloud = false;
    }

  }

  if (isWord) {

    if (millis()-startTimer > 5000) isWord = false;

  }

  if (isEscape) {

    if (millis()-startTimer > 5000) isEscape = false;

  }
  

  fill(0,transpBG);
  rect(0,0,width,height);
  //smooth();

  for(var i = 0; i < nums; i++) {

    var iterations = map(i,0,nums,5,1);
    //radius = map(i,0,nums,2,6);
    
    particles[i].move(iterations);
    particles[i].checkEdge();
    
    //var alpha = 255;
    var particleColor;
    var fadeRatio;
    fadeRatio = min(particles[i].life * 5 / maxLife, 1);
    fadeRatio = min((maxLife - particles[i].life) * 5 / maxLife, fadeRatio);

    var lifeRatioGrayscale = min(255, (255 * particles[i].life / maxLife) + red(backgroundColor));
    particleColor = color(255, alpha * fadeRatio);
        
    fill(red(particleColor), green(particleColor), blue(particleColor), transp * fadeRatio);
    particles[i].display(radius);

    particles[i].pos.x = particles[i].pos.x + ((particles[i].posTarget.x - particles[i].pos.x) * 0.1);
    particles[i].pos.y = particles[i].pos.y + ((particles[i].posTarget.y - particles[i].pos.y) * 0.1);

  } 

  radius += (radiusTarget-radius) * easing2;
  transp += (transpTarget-transp) * easing2;
  transpBG += (transpBGTarget-transpBG) * easing2;

}





function WhitePixels(_x, _y) {
  
  this.x = _x;
  this.y = _y;
  
}





function Particle(_whiteID){

  this.vel = createVector(0, 0);
  this.posTarget = createVector(random(0, width), random(0, height));
  this.pos = createVector(random(0, width), random(0, height));
  this.life = random(0, maxLife);
  this.flip = int(random(0,2)) * 2 - 1;
  this.whiteID = _whiteID;
  this.whitePosX = myPixels[this.whiteID].x*4;
  this.whitePosY = myPixels[this.whiteID].y*4;
  this.escape = int(random(3));
  this.taille = int(random(2,10));

  this.move = function(iterations){

    if (!isWord && !isEscape) {

      if((this.life -= 0.01666) < 0)
        this.respawn();
      while(iterations > 0){
        var angle = noise(this.posTarget.x/noiseScale, this.posTarget.y/noiseScale)*TWO_PI*noiseScale*this.flip;
        this.vel.x = cos(angle);
        this.vel.y = sin(angle);
        this.vel.mult(simulationSpeed);
        this.posTarget.add(this.vel);
        --iterations;

      }

    }

    if (isWord) {

      this.posTarget.x = this.whitePosX+random(-10,10);
      this.posTarget.y = this.whitePosY+random(-10,10);

    }

    if (isEscape) {

      this.posTarget.y-=15;
      this.pos.y = this.posTarget.y;

    }



  }

  this.checkEdge = function(){

    if (!isWord) {
      if(this.posTarget.x > width || this.posTarget.x < 0 || this.posTarget.y > height || this.posTarget.y < 0){
        this.respawn();
      }
    }

  }
  
  this.respawn = function(){

    if (!isWord) {
      this.posTarget.x = random(0, width);
      this.posTarget.y = random(0, height);
      this.pos.x = this.posTarget.x;
      this.pos.y = this.posTarget.y;
      this.life = maxLife;
    }

  }

  this.display = function(r) {

    ellipse(this.pos.x, this.pos.y, r+this.taille/r, r+this.taille/r);

  }

}




function mousePressed() {

}




function mouseReleased() {

}




function keyPressed() {
}



function mouseMoved() {
  /*for(var i = 0; i < nums; i++) {
    particles[i].posTarget.x -=4;
  }*/
  transpBGTarget = map(mouseX, 0, width, 255, 5);
  radiusTarget = map(mouseY, 0, height, 2, 15);

}