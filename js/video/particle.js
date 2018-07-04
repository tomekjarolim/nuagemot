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
  this.angleT;
  this.angleMinT;

  this.move = function(iterations){

    if (!isWord && !isEscape) {

      if((this.life -= 0.01666) < 0)
        this.respawn();

      while(iterations > 0){
        /*var angle = noise(this.posTarget.x/noiseScale, this.posTarget.y/noiseScale)*TWO_PI*noiseScale*this.flip;
        this.vel.x = cos(angle);
        this.vel.y = sin(angle);
        this.vel.mult(simulationSpeed);
        this.posTarget.add(this.vel);*/
        var angle = noise(this.posTarget.x/noiseScale, this.posTarget.y/noiseScale)*TWO_PI*noiseScale*this.flip;
        //this.angleT = angle;
        var minAngle = /*map(mouseY, 0, height, -angle, angle);*/angle;
        //this.angleMinT = minAngle;
        this.vel.x = cos((/*random(minAngle, angle)*/int(random(0,angle))));
        this.vel.y = sin((/*random(minAngle, angle)*/int(random(0,angle))));
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