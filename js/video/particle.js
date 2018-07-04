function Particle(_whiteID){

    this.vel = createVector(0, 0);
    this.posTarget = createVector(width/2, height/2);
    this.pos = createVector(this.posTarget.x, this.posTarget.y);
    this.life = random(0, maxLife);
    this.flip = int(random(0,2)) * 2 - 1;
    this.whiteID = _whiteID;
    this.whitePosX = myPixels[this.whiteID].x*4;
    this.whitePosY = myPixels[this.whiteID].y*4;
    this.escape = int(random(3));
    this.taille = int(random(2,10));
    this.escapeConfig = round(random(3));

    switch (this.escapeConfig) {
        case 0 :
            this.escapePosX = -10;
            this.escapePosY = int(random(height));
            break;
        case 1 :
            this.escapePosX = int(random(width));
            this.escapePosY = -10;
            break;
        case 2 :
            this.escapePosX = width+10;
            this.escapePosY = int(random(height));
            break;
        case 3 :
            this.escapePosX = int(random(width));
            this.escapePosY = height+10;
            break;
        default :
            this.escapePosX = int(random(width));
            this.escapePosY = height+10;
            break;
    }

    this.move = function(iterations){

        if (!isWord && !isEscape) {
            if((this.life -= 0.01666) < 0)
            this.respawn();
            while(iterations > 0){
                var angle = noise(this.posTarget.x/noiseScale, this.posTarget.y/noiseScale)*TWO_PI*noiseScale*this.flip;
                var minAngle = map(mouseX, width/10, width*9/10, -angle, angle, true);
                this.vel.x = cos( random(minAngle,angle) );
                this.vel.y = sin( random(minAngle,angle) );
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
            this.posTarget.x = this.escapePosX;
            this.posTarget.y = this.escapePosY;
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