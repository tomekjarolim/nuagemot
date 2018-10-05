var vangogh = 0.2;

function Particle(_whiteID, _depthTarget, _depth, _originX, _originY){

    this.vel = createVector(0, 0);

    if (int(Math.random()*20) == 0) this.superParticle = true;
    else this.superParticle = false;

    if (round(Math.random()*1) == 0) this.pitchShape = 0;
    else this.pitchShape = 1;

    //this.posTarget = createVector(_originX+random(-100,100),_originY+random(-100,100));
    this.posTarget = createVector(_originX+Math.random()*200-100,_originY+Math.random()*200-100);
    this.pos = createVector(_originX, _originY);

    this.life = Math.random() * (maxLife-10) + 10;
    //this.flip = int(random(0,2)) * 2 - 1;
    this.flip = int(Math.random()*2) * 2 - 1;

    this.torusSizeTarget = 30;
    this.torusSize = 1;
    this.torusStart = millis();
    this.torusEasing = false;

    this.vangoghStart = millis();
    this.vangoghReposition = false;

    //this.lineSize = int(random(2,6));
    this.lineSize = int(Math.random()*6-2);

    // position in word
    this.whiteID = _whiteID;
    //this.whitePosX = random(myPixels[this.whiteID].x*scaleVal-5,myPixels[this.whiteID].x*scaleVal+5);
    //this.whitePosY = random(myPixels[this.whiteID].y*scaleVal-5,myPixels[this.whiteID].y*scaleVal+5);
    this.whitePosX = (Math.random() * (myPixels[this.whiteID].x*scaleVal+5 - myPixels[this.whiteID].x*scaleVal-5)) - myPixels[this.whiteID].x*scaleVal-5;
    this.whitePosY = (Math.random() * (myPixels[this.whiteID].y*scaleVal+5 - myPixels[this.whiteID].y*scaleVal-5)) - myPixels[this.whiteID].y*scaleVal-5;

    // position in escape
    let angleB = Math.random()*TWO_PI;
    this.posEscape = createVector(width/2 + Math.cos(angleB) * width*1.1, height/2 + Math.sin(angleB) * width*1.1);

    this.escape = int(Math.random()*3);
    this.taille = Math.random()*minRadus;

    this.angleParticle = Math.random() * 6.28 - 3.14;
    this.titlParticle = Math.random() * 6.28 - 3.14;
    //this.titleSpeed = floor(random(50,1000));
    this.titleSpeed = Math.floor(Math.random() * 950 + 50);

    this.factorParticle = Math.random() * 5 + 1;

    this.zoomTailleTarget = 10;
    this.zoomTaille = 5;
    this.zoomTailleWord = Math.random() * 6 + 1;

    this.alphaTarget = map(this.zoomTailleTarget,0,30,255,3);
    this.refAlpha = this.alphaTarget;
    this.alpha = 0;

    //this.velo = createVector(random(-1, 1), random(-1, 1));
    this.velo = createVector(Math.random() * 2 -1);
    this.velo.normalize();
    this.speedo = Math.random() * 2 +1;

    this.timerStart = millis();
    this.timerDuration = int(random(1000));

    this.depth = _depth;
    this.depthTarget = _depthTarget;

    this.alphaLuciole = Math.random() * 240 + 15;
    this.shaking = 0;
    this.alphaSpeed = Math.random() * 2 + 1;
    this.scaleValue = 0;

    let l = int(Math.random() * 40);
    this.zoomTailleTarget = l;
    this.alphaTarget = map(l,0,40,105,50);

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
                    this.vel.x = Math.cos( Math.random() * ( (angle+2) - (angle-2) ) - (angle-2) );
                    this.vel.y = Math.sin( angle );
                    this.vel.mult(simulationSpeed);
                } else {
                    this.vel.x = Math.cos(angle);
                    this.vel.y = Math.sin(angle);
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
                this.posTarget.x = width/2 + Math.cos(Math.random() * TWO_PI) * 300;
                this.posTarget.y = height/2 + Math.sin(Math.random() * TWO_PI) * 600;
                this.vangoghReposition = true;
            }
        } 

        if (isWord) {
            this.zoomTailleTarget = this.zoomTailleWord;
            this.depthTarget = 0;
            this.factorParticle = Math.random() * 5 + 1;
            this.scaleValue = 1;
            this.torusSizeTarget = 3;
            this.alphaTarget = Math.random() * 155 + 150;
        } else this.torusSizeTarget = 30;

        if (isWordOver) {
            if (this.alphaTarget >= 0) this.alphaTarget-=this.alphaSpeed;
            if (round(this.alpha) == 0) this.die = true;
        }

        if (particleShape == 0) { // ellipses
            if (millis()-this.torusStart > 1000) this.torusSize += (this.torusSizeTarget - this.torusSize) * 0.1;
            if (transpBGTarget < 100) fill(255,this.alpha/4);
            else fill(255,this.alpha/2);
            noStroke();
            translate(this.pos.x, this.pos.y);
            torus(this.torusSize, 1);
        }

        else if (particleShape == 1) { // ronds
            noStroke();
            if (transpBGTarget < 50) fill(255,this.alpha/5);
            else fill(255,this.alpha/2);
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

        else if (particleShape == 5) { // metastases
            noFill();
            if (!isFlocking) stroke(255,this.alpha/4);
            else stroke(255,this.alpha/4);
            ellipse(this.pos.x, this.pos.y, (r+this.zoomTaille)*this.scaleValue, (r+this.zoomTaille)*this.scaleValue);
        }

        else if (particleShape == 6) { // lignes + carrés
            if (this.pitchShape == 0) { // ligne
                noStroke();
                fill(255,this.alpha);
                translate(this.pos.x, this.pos.y);
                rotate(this.angleParticle/4);
                plane((r+this.zoomTaille)*this.lineSize, 2);
            } else { // carré
                noStroke();
                fill(255,this.alpha);
                translate(this.pos.x, this.pos.y);
                rotate(this.angleParticle/4);
                plane((r+this.zoomTaille), (r+this.zoomTaille)); 
            }
        }

        else if (particleShape == 7) { // lignes + cercle
            if (this.pitchShape == 0) { // ligne
                noStroke();
                fill(255,this.alpha);
                translate(this.pos.x, this.pos.y);
                rotate(this.angleParticle/4);
                plane((r+this.zoomTaille)*this.lineSize, 2);
            } else { // cercle
                if (millis()-this.torusStart > 1000) this.torusSize += (this.torusSizeTarget - this.torusSize) * 0.1;
                if (transpBGTarget < 100) fill(255,this.alpha/4);
                else fill(255,this.alpha/2);
                noStroke();
                translate(this.pos.x, this.pos.y);
                torus(this.torusSize, 1);
            }
        }

        pop();

    }

}