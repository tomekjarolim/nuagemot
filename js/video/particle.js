var vangogh = 0.2;

function Particle(_whiteID, _depthTarget, _depth, _originX, _originY){

    this.vel = createVector(0, 0);

    if (int(random(20)) == 0) this.superParticle = true;
    else this.superParticle = false;

    this.posTarget = createVector(_originX+random(-10,10),_originY);
    this.pos = createVector(_originX, _originY);

    this.transX = 0;
    this.transY = 0;

    this.life = random(10, maxLife);
    this.flip = int(random(0,2)) * 2 - 1;

    this.torusSizeTarget = 30;
    this.torusSize = 1;
    this.torusStart = millis();
    this.torusEasing = false;

    this.vangoghStart = millis();
    this.vangoghReposition = false;

    this.lineSize = int(random(2,6));

    // position in word
    this.whiteID = _whiteID;
    this.whitePosX = random(myPixels[this.whiteID].x*scaleVal-5,myPixels[this.whiteID].x*scaleVal+5);
    this.whitePosY = random(myPixels[this.whiteID].y*scaleVal-5,myPixels[this.whiteID].y*scaleVal+5);

    // position in escape
    let angleB = random(TWO_PI);
    this.posEscape = createVector(width/2 + cos(angleB) * width*1.1, height/2 + sin(angleB) * width*1.1);

    this.escape = int(random(3));
    this.taille = random(minRadus);

    this.angleParticle = random(-3.14,3.14);
    this.titlParticle = random(-3.14,3.14);
    this.titleSpeed = floor(random(50,1000));

    this.factorParticle = random(1,6);

    this.zoomTailleTarget = 10;
    this.zoomTaille = 5;
    this.zoomTailleWord = random(1,7);

    this.alphaTarget = map(this.zoomTailleTarget,0,30,255,3);
    this.refAlpha = this.alphaTarget;
    this.alpha = 0;

    this.velo = createVector(random(-1, 1), random(-1, 1));
    this.velo.normalize();
    this.speedo = random(1,3);

    this.timerStart = millis();
    this.timerDuration = int(random(1000));

    this.depth = _depth;
    this.depthTarget = _depthTarget;

    this.alphaLuciole = random(15,255);

    this.shaking = 0;
    this.cornerRadius = 0;

    this.alphaSpeed = random(1,3);

    this.scaleValue = 0;

    //alpha Luciole
    //if (changeToLuciole) {
        let l = int(random(40));
        this.zoomTailleTarget = l;
        this.alphaTarget = map(l,0,40,105,3);
    //}

    //zoomTailleTarget = 0;

    // movement 1
    this.move = function(iterations){

        if (!isWord) {

            if (this.scaleValue < 3) this.scaleValue += .005;

            if((this.life -= 0.01666) < 0)
            this.respawn();
            while(iterations > 0){

                var angle = noise(this.posTarget.x/noiseScale, this.posTarget.y/noiseScale)*TWO_PI*noiseScale*this.flip;
                if (isBacteria) {
                    var minAngle = map(amp, width/10, width, -angle, angle, true);
                    this.vel.x = cos( /*(minAngle,angle)*/ random(angle-2,angle+2) );
                    this.vel.y = sin( /*(minAngle,angle)*/ angle );
                    this.vel.mult(simulationSpeed);
                } else {
                    this.vel.x = cos(angle);
                    this.vel.y = sin(angle);
                    this.vel.mult(0.2);
                }

                if (millis()-this.timerStart > this.timerDuration) {
                    this.posTarget.add(this.vel);
                }
                --iterations;

            }

        } else {

            if (millis()-this.timerStart > this.timerDuration) {
                this.posTarget.x = this.whitePosX+random(-this.shaking,this.shaking);
                this.posTarget.y = this.whitePosY+random(-this.shaking,this.shaking);
            }

        }

    }

    // movement 2
    this.setVelo = function(posX, posY, stength) {

        let angle, fAngle;
        let dis;
        let mm = map (posX, 0, width, -6.2, 6.2);

        if (mm == 0) mm = 0.0001;
        let maxDis = mm*dist (0, 0, width/2, height/2);

        dis = dist (this.posTarget.x, this.posTarget.y, width/2, height/2);
        fAngle = map(dis, 0, maxDis, posY, 0);
        angle = map(dis, 0, maxDis, PI, 0) +  random(-PI/4*fAngle, PI/4*fAngle);

        this.velo.x += cos (angle)*stength;
        this.velo.y += sin (angle)*stength;
        this.velo.normalize();

        this.posTarget.add(this.multi (this.velo, this.speedo/2));
        
    }

    // particle movement multiplicator
    this.multi = function(v,  m) {

        return createVector(v.x*m, v.y*m);
    
    }

    // replacement atfer a particle reaches end
    this.checkEdge = function(){

        if (!isWord) {

            if(this.posTarget.x > width+50 || this.posTarget.x < -50 || this.posTarget.y > height+50 || this.posTarget.y < -50){
                this.respawn();
            }
        }

    }

    // new position after end reaching 
    this.respawn = function(){

        if (!isWord) {
            if (isTooLoudFinish) { 
                this.posTarget.x = random(width);
                this.posTarget.y = random(height);
                this.pos.x = this.posTarget.x;
                this.pos.y = this.posTarget.y;
            } else {
                this.posTarget.x = width/2 + cos(random(TWO_PI)) * 100;
                this.posTarget.y = height/2 + sin(random(TWO_PI)) * 100;
            }
            this.life = maxLife;
            //if (!isBacteria) this.alphaTarget = 255;
            //else {
                this.alpha = 0;
                var l = int(random(40));
                this.zoomTailleTarget = l;
                this.alphaTarget = map(l,0,40,255,50);
            //}
        }

    }

    // particle displaying
    this.display = function(r) {

        push();
        translate(0,0,this.depth);

        if (transpBGTarget < 50) this.alphaTarget == this.refAlpha/3;

        if (!isBacteria) {
            if (millis()-this.vangoghStart > 2000 && !this.vangoghReposition) {
                this.posTarget.x = width/2 + cos(random(TWO_PI)) * 300;
                this.posTarget.y = height/2 + sin(random(TWO_PI)) * 300;
                this.vangoghReposition = true;
            }
        } 

        if (isWord) {
            this.zoomTailleTarget = this.zoomTailleWord;
            this.depthTarget = 0;
            this.factorParticle = random(1,6);
            this.scaleValue = 1;
            this.torusSizeTarget = 3;
            this.alphaTarget = random(150,255);
        } else this.torusSizeTarget = 30;

        if (isWordOver) {
            if (this.alphaTarget >= 0) this.alphaTarget-=this.alphaSpeed;
            if (round(this.alpha) == 0) this.die = true;
        }

        if (particleShape == 0) { // ellipses
            if (millis()-this.torusStart > 1000) this.torusSize += (this.torusSizeTarget - this.torusSize) * 0.1;
            fill(255,this.alpha/4);
            noStroke();
            translate(this.pos.x, this.pos.y);
            torus(this.torusSize, 1);
        }

        else if (particleShape == 1) { // ronds
            noStroke();
            if (transpBGTarget < 100) fill(255,this.alpha/10);
            else fill(255,this.alpha/4);
            ellipse(this.pos.x, this.pos.y, (r+this.zoomTaille), (r+this.zoomTaille));
        }

        else if (particleShape == 2) { // lignes
            noStroke();
            fill(255,this.alpha);
            translate(this.pos.x, this.pos.y);
            rotate(this.angleParticle/4);
            plane((r+this.zoomTaille)*this.lineSize, 2);
        }
        else if (particleShape == 3) { // carrés
            noStroke();
            fill(255,this.alpha);
            translate(this.pos.x, this.pos.y);
            rotate(this.angleParticle/4);
            plane((r+this.zoomTaille), (r+this.zoomTaille));
        }

        else if (particleShape == 4) { // confettis
            noStroke();
            fill(255,this.alpha);
            translate(this.pos.x, this.pos.y);
            rotateX(this.angleParticle/2);
            rotateY((millis()/this.titleSpeed)+this.titlParticle);
            plane(r+this.zoomTaille,r+this.zoomTaille);
        }

        else { // metastases
            noFill();
            if (!isFlocking) stroke(255,this.alpha/4);
            else stroke(255,this.alpha/4);
            ellipse(this.pos.x, this.pos.y, (r+this.zoomTaille)*this.scaleValue, (r+this.zoomTaille)*this.scaleValue);
        }

        pop();

    }

}