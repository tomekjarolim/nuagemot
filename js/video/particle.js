function Particle(_whiteID){

    this.vel = createVector(0, 0);
    this.posTarget = createVector(width/2, height/2);
    this.pos = createVector(this.posTarget.x, this.posTarget.y);
    this.life = random(50, maxLife);
    this.flip = int(random(0,2)) * 2 - 1;
    this.whiteID = _whiteID;
    this.whitePosX = random(myPixels[this.whiteID].x*scaleVal-5,myPixels[this.whiteID].x*scaleVal+5);
    this.whitePosY = random(myPixels[this.whiteID].y*scaleVal-5,myPixels[this.whiteID].y*scaleVal+5);
    this.escape = int(random(3));
    this.taille = int(random(1,5));

    this.alpha = 255;
    this.alphaTarget = 255;

    this.zoomTaille = 0;
    this.zoomTailleTarget = 0;

    if (this.posTarget.x <= width/2) {
        if (this.posTarget.y <= width/2) {
            this.escapePosX = int(random(-10,width/2));
            this.escapePosY = int(random(-10,height/2));
        } else {
            this.escapePosX = int(random(width)/2);
            this.escapePosY = int(random(height/2,height+10));
        }
    } else {
        if (this.posTarget.y <= width/2) {
            this.escapePosX = int(random(width/2,width+10));
            this.escapePosY = int(random(-10,height/2));
        } else {
            this.escapePosX = int(random(width/2,width+10));
            this.escapePosY = int(random(height/2,height+10));
        } 
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

        if (!isWord && !isEscape) {
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

        push();
        translate(0,0,int(random(zoom-2,zoom+2)));
        stroke(255,transpBorder);
        //noFill();
        fill(255,this.alpha);
        ellipse(this.pos.x, this.pos.y, r+this.taille/r+this.zoomTaille, r+this.taille/r+this.zoomTaille);
        pop();

    }

}