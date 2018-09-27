var vangogh = 0.2;

function Particle(_whiteID, _depthTarget, _depth, _originX, _originY){

    this.vel = createVector(0, 0);

    if (int(random(20)) == 0) this.superParticle = true;
    else this.superParticle = false;

    this.posTarget = createVector(_originX+random(-35,35),_originY+random(-35,35));
    this.pos = createVector(_originX, _originY);

    this.life = random(50, maxLife);
    this.flip = int(random(0,2)) * 2 - 1;
    this.whiteID = _whiteID;
    this.whitePosX = random(myPixels[this.whiteID].x*scaleVal-5,myPixels[this.whiteID].x*scaleVal+5);
    this.whitePosY = random(myPixels[this.whiteID].y*scaleVal-5,myPixels[this.whiteID].y*scaleVal+5);
    this.escape = int(random(3));
    this.taille = random(minRadus);

    this.color = color(255);

    this.angleParticle = random(-3.14,3.14);
    this.factorParticle = random(1,6);

    this.easingZoom = 0.01;

    this.zoomTailleTarget = random(30);
    this.zoomTaille = 0;

    this.alphaTarget = map(this.zoomTailleTarget,0,30,255,3);
    this.alpha = 0;

    this.velo = createVector(random(-1, 1), random(-1, 1));
    this.velo.normalize();
    this.speedo = random(1,3);

    this.timerStart = millis();
    this.timerEnd;
    this.timerDuration = int(random(1000));

    this.depth = _depth;
    this.depthTarget = _depthTarget;

    this.alphaLuciole = random(5,255);

    this.shaking = 0;
    this.cornerRadius = 0;

    this.alphaSpeed = random(1,3);

    this.scaleValue = 1;

    // escape
    var angleB = random(TWO_PI);
    this.posEscape = createVector(width/2 + cos(angleB) * width*1.1, height/2 + sin(angleB) * width*1.1);


    //
    if (changeToLuciole) {
        var l = int(random(40));
        this.zoomTailleTarget = l;
        this.alphaTarget = map(l,0,40,255,3);
    }

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
                    var minAngle = map(amp, width/10, width, -angle, angle, true);
                    this.vel.x = cos( random(minAngle,angle) );
                    this.vel.y = sin( random(minAngle,angle) );
                    this.vel.mult(simulationSpeed);
                } else {
                    this.vel.x = cos(angle);
                    this.vel.y = sin(angle);
                    this.vel.mult(0.2);
                }
                if (millis()-this.timerStart > this.timerDuration) this.posTarget.add(this.vel);
                --iterations;
            }
        }

        if (isWord) {
            if (millis()-this.timerStart > this.timerDuration) {
                this.posTarget.x = this.whitePosX+random(-this.shaking,this.shaking*3);
                this.posTarget.y = this.whitePosY+random(-this.shaking,this.shaking*3);
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

        if (!isWord) {
            if(this.posTarget.x > width+50 || this.posTarget.x < -50 || this.posTarget.y > height+50 || this.posTarget.y < -50){
                this.respawn();
            }
        }

    }

    this.checkSize = function(){

        let distVal = dist(width/2,height/2-100, this.pos.x, this.pos.y)
        if (distVal > 300) {
            this.color = color(252,0,0);
            this.scaleValue = map(distVal, 300, 1000, 3, 0.5);
        } else {
            this.color = color(252);
            this.scaleValue = 2;
        }

    }

  
    this.respawn = function(){

        if (!isWord) {

            this.posTarget.x = random(0, width);
            this.posTarget.y = random(0, height);
            /*this.pos.x = this.posTarget.x;
            this.pos.y = this.posTarget.y;*/
            this.life = maxLife;
            if (!isBacteria) this.alphaTarget = 255;
            else {
                var l = int(random(40));
                this.zoomTailleTarget = l;
                this.alphaTarget = map(l,0,40,255,3);
            }
            //this.alpha= 0;
        }

    }

    this.display = function(r) {

        push();
        translate(0,0,zoom+this.depth);

        if (isWord) {
            this.zoomTailleTarget = 2;
            this.depthTarget = 0;
        }

        if (isWordOver) {
            if (this.alphaTarget >= 0) this.alphaTarget-=this.alphaSpeed;
            if (round(this.alpha) == 0) this.die = true;
        }

        if (particleShape == 0) {

            fill(255,this.alpha);
            texture(img);
            translate(this.pos.x, this.pos.y);
            plane((r+this.zoomTaille)*this.scaleValue, (r+this.zoomTaille)*this.scaleValue);

        }

        else if (particleShape == 1) {

            noStroke();
            fill(255,this.alpha);
            //fill(this.color,this.alpha);
            ellipse(this.pos.x, this.pos.y, (r+this.zoomTaille)*this.scaleValue, (r+this.zoomTaille)*this.scaleValue);

        }

        else if (particleShape == 2) {

            noStroke();
            fill(255,this.alpha);
            translate(this.pos.x, this.pos.y);
            plane((r+this.zoomTaille)*this.scaleValue, (r+this.zoomTaille)*this.scaleValue);
        }

        else {

            noStroke();
            fill(255,this.alpha);
            translate(this.pos.x, this.pos.y);
            rotate(this.angleParticle);
            plane(((r+this.zoomTaille)*this.factorParticle)*this.scaleValue, 2);
        }

        pop();

    }

}