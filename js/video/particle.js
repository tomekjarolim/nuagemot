var vangogh = 0.2;

function Particle(_whiteID){

    this.vel = createVector(0, 0);
    //this.posTarget = createVector(width/2, height/2);
    this.posTarget = createVector(random(width/2-5,width/2+5), height-1);
    this.pos = createVector(this.posTarget.x, this.posTarget.y);
    this.life = random(50, maxLife);
    this.flip = int(random(0,2)) * 2 - 1;
    this.whiteID = _whiteID;
    this.whitePosX = random(myPixels[this.whiteID].x*scaleVal-5,myPixels[this.whiteID].x*scaleVal+5);
    this.whitePosY = random(myPixels[this.whiteID].y*scaleVal-5,myPixels[this.whiteID].y*scaleVal+5);
    this.escape = int(random(3));
    this.taille = random(4);

    //
    this.isSpawning = true;
    this.mass = random(0.1, 2);
    this.die = false;
    this.acc = createVector(0,0);
    this.speed = 0.1;
    this.state1 = false;
    this.state2 = false;
    this.fallRate = 0;
    this.speedLimit = 1.0;

    this.mass = random(0.5, 2);
    this.speed = random(0.075, 0.1);
    this.speedLimit = this.speed * 20.0;
    this.fallRate = random(-0.06, 0.06);
    //

    this.alpha = 255;
    this.alphaTarget = 255;

    this.zoomTaille = 0;
    this.zoomTailleTarget = 0;

    this.velo = createVector(random(-1, 1), random(-1, 1));
    this.velo.normalize();
    this.speedo = random(1,3);

    this.timerStart = millis();
    this.timerEnd;
    this.timerDuration = int(random(1000));

    this.depth = 0;
    this.depthTarget = 0;

    this.alphaLuciole = random(5,255);

    this.shaking = 0;
    this.cornerRadius = 0;

    this.alphaSpeed = random(1,3);

    //
    if (changeToLuciole) {
        var l = int(random(40));
        this.zoomTailleTarget = l;
        this.alphaTarget = map(l,0,40,255,3);
    }

    /*if (this.posTarget.x <= width/2) {
        if (this.posTarget.y <= width/2) {
            this.escapePosX = int(random(-10,width/2));
            this.escapePosY = int(random(-10,height/2));
        } else {
            this.escapePosX = int(random(width)/2);
            this.escapePosY = int(random(height/2,height+10));
        }
    } else {
        if (this.posTarget.y <= height/2) {
            this.escapePosX = int(random(width/2,width+10));
            this.escapePosY = int(random(-10,height/2));
        } else {
            this.escapePosX = int(random(width/2,width+10));
            this.escapePosY = int(random(height/2,height+10));
        } 
    }*/

    ////////////////////////////////////////////////// initiation

    this.getColumnIndex = function() {
        var index = this.pos.y/columnSize;
        return index;
    }

    //////////////////////////////////////////////////

    this.move = function(iterations){

        if (!isWord && !isEscape) {

            if((this.life -= 0.01666) < 0)
            this.respawn();
            while(iterations > 0){

                var angle = noise(this.posTarget.x/noiseScale, this.posTarget.y/noiseScale)*TWO_PI*noiseScale*this.flip;
                if (isBacteria) {
                    var minAngle = map(mouseX, width/10, width, -angle, angle, true);
                    this.vel.x = cos( random(minAngle,angle) );
                    this.vel.y = sin( random(minAngle,angle) );
                    this.vel.mult(simulationSpeed);
                } else {
                    this.vel.x = cos(angle);
                    this.vel.y = sin(angle);
                    this.vel.mult(vangogh);
                }
                if (millis()-this.timerStart > this.timerDuration) this.posTarget.add(this.vel);
                --iterations;
            }
        }

        if (isWord) {
            if (millis()-this.timerStart > this.timerDuration) {
                this.posTarget.x = this.whitePosX+random(-this.shaking,this.shaking);
                this.posTarget.y = this.whitePosY+random(-this.shaking,this.shaking);
            }
        }

        if (isEscape) {
            this.posTarget.x = this.escapePosX;
            this.posTarget.y = this.escapePosY;
        }

    }

    this.setVelo = function(posX, posY, stength) {

        var angle, fAngle;
        var dis;
        var mm = map (posX, 0, width, -6.2, 6.2);
        if (mm == 0) mm = 0.0001;
        var maxDis = mm*dist (0, 0, width/2, height/2);

        dis = dist (this.posTarget.x, this.posTarget.y, width/2, height/2);
        fAngle = map(dis, 0, maxDis, posY, 0);
        angle = map(dis, 0, maxDis, PI, 0) +  random(-PI/4*fAngle, PI/4*fAngle);

        this.velo.x += cos (angle)*stength;
        this.velo.y += sin (angle)*stength;
        this.velo.normalize();
        
        this.posTarget.add(this.multi (this.velo, this.speedo));
        
    }

    this.multi = function(v,  m) {
    
        return createVector(v.x*m, v.y*m);
    
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
            this.alphaTarget = 0;
            this.alpha= 0;
        }

    }

    this.display = function(r) {

        push();
        translate(0,0,zoom+this.depth);
        if (!isLuciole && !isWordOver) {
            if (this.alphaTarget <= 255) this.alphaTarget+=1;
        } else if (isLuciole && !isWordOver) {
            if (this.alphaTarget <= this.alphaLuciole) this.alphaTarget+=1;
        }
        if (isWordOver) {
            if (this.alphaTarget >= 0) this.alphaTarget-=this.alphaSpeed;
            if (round(this.alpha) == 0) this.die = true;
        }
        stroke(255,transpBorder);
        fill(255,this.alpha);
        if (!isSquare) ellipse(this.pos.x, this.pos.y, r+this.zoomTaille, r+this.zoomTaille);
        else rect(this.pos.x, this.pos.y, r+this.zoomTaille+this.taille, r+this.zoomTaille+this.taille);
        pop();

    }

}