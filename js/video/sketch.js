// particles variables
var minRadus = 2;
var particles = [];
var nums;
var particleDensity = 4000;
var noiseScale = 800;
var maxLife = 5;
var maxSpeed = 30;
var simulationSpeed = /*0.2*/0;
var fadeFrame = 0;
var backgroundColor;
var numModes = 4;
var invertColors = false;
var radius = minRadus;
var radiusTarget = minRadus;
var transpBG = 255;
var transpBGTarget = 255;
var transpTarget = 155;
var transpBorder = 0;
var transpBorderTarget = 0;
var easing = .1;
var img;
var myPixels = []; 
var startTimer;
var scaleVal = 5;
var posX;
var posY;
var wordDuration = 4000;
var tooLoudDuration = 1000;

// position booleans
var isBacteria = true;
var isWord = false;
var isCloud = false;
var isDepth = true;
var isFlocking = false;
var isLuciole = false;
var isSquare = false;
var isWordOver = false;
var isTooLoud = false;
var isReady = true;
var isTooLoudFinish = true;

var isEmpty = true;

// word container
var pgText;
var myFont;
var txtCanvas = document.createElement("canvas");
var ctx;
var currentWord = "";
var speechDuration = 0;
var highTimer;
var img;

var words = ["tu voyageras loin ?","n’oublie pas le pain","vers où ?","l’espace est un doute","c’est à dire","ici je suis ailleurs","fais-moi signe","paysage","paradis (au 7ème étage)","doute","jungle","yeux","voyager",
"déborder","ressentir","habiter","ça le fait","avoir l’air","au plaisir","à part ça","et pour cause","bien des choses","pour l’instant","ça alors","faut voir","tu parles","à d’autres","sans doute","nulle part","l’air de rien",
"et bien","de rien","encore heureux","rien que ça","par ailleurs","ou bien","tout simplement comment dire","de ci de là","que dalle","pour autant","vu d’ici","après tout","en vrai","d’ailleurs","quelque part","mon œil","et voilà",
"et alors","bien entendu","pourquoi pas","d’ici peu","sous silence","d’ici là","n’importe quoi","d’autant plus","tout d’un coup","mais encore","ma parole","et encore","bref","voilà voilà","sait-on jamais","bien du plaisir","ici même"];

var particleShape;
var ellipseRadius;

var silenceStarted;
var talkStarted = false;
var hasTalked = false;
var switchToWord = false;
var waitFreq = -1;

var freqArray = [];

var changePitch = false;

var tooLoud = false;
var tooLoudEndedTimer;
var changeToLuciole = false;

var onHighPicthEvent = false;
var isHighPitch = false;
var highPitchCounter = 0;
var highThreshold = false;

// preaload images
function preloadSketch() {

    myFont = loadFont('js/assets/futura_book.otf');
    img = loadImage("js/assets/ellipse.png");

}

// initial settings
function initSketch() {

    nums = 500;
    backgroundColor = color(0);

    createCanvas(windowWidth, windowHeight, WEBGL);
    background(backgroundColor);

    txtCanvas.width = width/scaleVal;
    txtCanvas.height = height/scaleVal;
    txtCanvas.setAttribute("id", "txtCss");
    
    ctx = txtCanvas.getContext('2d');
    currentWord = "";
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,txtCanvas.width, txtCanvas.height);
    ctx.font = "40px futura";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(currentWord, txtCanvas.width/2, txtCanvas.height/2); 
    ctx.fill();
    ctx.clearRect(0, 0, txtCanvas.width, txtCanvas.height);
    currentWord = words[round(random(words.length))];
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,txtCanvas.width, txtCanvas.height);
    ctx.font = "40px futura";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(currentWord, txtCanvas.width/2, txtCanvas.height/2); 
    ctx.fill();

    var imgData = ctx.getImageData(0,0,txtCanvas.width,txtCanvas.height).data;
            
    for( let yImage = 0 ; yImage < txtCanvas.height ; yImage++ ){
        for( let xImage = 0 ; xImage < txtCanvas.width ; xImage++ ){
            let iData = (yImage * (txtCanvas.width * 4)) + (xImage * 4);
            if( imgData[iData] > 250) myPixels.push( new WhitePixels( xImage , yImage ) );
        }
    }

    posX = width/2+1;
    posY = 0;

}

// init stat
function initState() {

    transpBGTarget = 255;
    isLuciole = false;
    isSquare = false;
    isFlocking = false;
    isBacteria = true;
    freqArray = [];
    changePitch = false;
    waitFreq = -1;
    isWordOver = false;
    radiusTarget = round(random(10,30));
    radius = radiusTarget;
    particleShape = round(random(4));
    ellipseRadius = 0.3;
    hasTalked = false;
    isWord = false;

isReady = true;
isEmpty = true;

    for(var i = 0; i < particles.length; i++) {
        particles[i].zoomTailleTarget = 0;
        particles[i].shaking = 0;
        particles[i].radiusTarget = minRadus;
        //particles[i].alphaTarget = 255;
        particles[i].factorParticle = random(1,6);
    }

    // BG selection
    if (!isBacteria && !isFlocking) transpBGTarget = 205;
    else {
        let rndBg = round(random(1));
        if (rndBg == 0) transpBGTarget = 10;
        //transpBGTarget = 8;
        else transpBGTarget = 205;
        if (particleShape == 3) transpBGTarget = 205;
    }

}

// draw skecth
function drawSketch() {

    let toto = amp*500;

    if (amp && freq) {

        //console.log("isReady "+isReady);
        //console.log("nb Part "+particles.length);

        if (/*toto > 5*/isTalking && speechDur > 0 && isReady) {

            console.log("vol detected");

            ////// create particle
            if (particles.length < 800 && !isWord && !isTooLoud /*&& isEmpty*/) {
                changeToLuciole = true;
                for (var i=0; i<3; i++) {
                    particles.push(new Particle( int(random(myPixels.length)), random(-width,-1) , 100000 , width/2 , height/2+100 ));
                }
            }

            if (!talkStarted) {
                initState();
                talkStarted = true;
            }

            if (millis()-waitFreq > 3000) {

                if (!changePitch) {
                    if (tessitura == 'low') {
                        isFlocking = false;
                        isBacteria = true;
                    } else if (tessitura == 'mid') {
                        isFlocking = false;
                        isBacteria = false;
                    } else if (tessitura == 'hi') {
                        isFlocking = true;
                        isBacteria = false;
                    } else {
                        isFlocking = false;
                        isBacteria = true;
                    }
                }

                changePitch = true;

            }

            speechDuration+=.25;

            radiusTarget = map(speechDuration,0,300,minRadus,15);
            silenceStarted = millis();
            hasTalked = true;
            isWord = false;
            simulationSpeed = toto;
            switchToWord = false;

            if (freq < 100) highThreshold = false;
            if (freq > 300) highThreshold = true;

            if (highThreshold && !isHighPitch) {
                isHighPitch = true;
                highPitchCounter = 0;
                onHighPicthEvent = true;
            }

            if (!highThreshold && isHighPitch) {
                highPitchCounter++;
                if (highPitchCounter > 2) {
                    isHighPitch = false;
                }
            }

            for(var i = 0; i < particles.length; i++) {

                if (onHighPicthEvent) {
                    if (particles[i] != null && particles[i].superParticle && particles.length < 800) {
                        for (let i=0; i<5; i++) {
                            particles.push(new Particle( int(random(myPixels.length)), particles[i].depth , particles[i].depth , particles[i].pos.x, particles[i].pos.y ));
                        }
                    }   
                }

                if (particles[i] != null && toto > 100 && tessitura != 'mid') {
                    isTooLoud = true;
                    isTooLoudFinish = false;
                    tooLoudTimer = millis();
                    tooLoudEndedTimer = millis();
                    particles[i].posTarget.x = particles[i].posEscape.x;
                    particles[i].posTarget.y = particles[i].posEscape.y;
                    particles[i].depthTarget = 0;
                }

                if (isTooLoud && particles[i] != null) {
                    if (millis()-tooLoudTimer > 2000) {
                        particleShape = 5;
                        particles[i].posTarget.x = 30;
                        particles[i].posTarget.y = 20;
                        particles[i].depthTarget = random(-width,-1);
                        isTooLoud = false;
                    }
                }

            }

        } else {

            if (silenceDur >= maxSilenceDur && /*hasTalked*/ !hasWordBeenDisplayed && micOn) {

               // talkStarted = false; 
                isFlocking = false;
                isWord = true;

                if (!switchToWord) {

                    radiusTarget = random(1,5);

                    myPixels.splice(0, myPixels.length);

                    ctx.clearRect(0, 0, txtCanvas.width, txtCanvas.height);

                    currentWord = currentWord = words[round(random(words.length))];
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(0,0,txtCanvas.width, txtCanvas.height);
                    ctx.font = "40px futura";
                    ctx.fillStyle = "white";
                    ctx.textAlign = "center";
                    ctx.fillText(currentWord, txtCanvas.width/2, txtCanvas.height/2); 
                    ctx.fill();

                    var imgData = ctx.getImageData(0,0,txtCanvas.width,txtCanvas.height).data;
                    
                    for( var yImage = 0 ; yImage < txtCanvas.height ; yImage++ ){
                        for( var xImage = 0 ; xImage < txtCanvas.width ; xImage++ ){
                            var iData = (yImage * (txtCanvas.width * 4)) + (xImage * 4);
                            if( imgData[iData] > 250) myPixels.push( new WhitePixels( xImage , yImage ) );
                        }
                    }

                    for(var i = 0; i < particles.length; i++){
                        var pos = int(random(myPixels.length));
                        particles[i].timerStart = millis();
                        particles[i].whitePosX = random(myPixels[pos].x*scaleVal-5,myPixels[pos].x*scaleVal+5);
                        particles[i].whitePosY = random(myPixels[pos].y*scaleVal-5,myPixels[pos].y*scaleVal+5);
                        particles[i].shaking = speechDuration/10+5;
                        particles[i].scaleValue = 0.6;
                    }

                    startTimer = millis();
                    for (var i = 0; i < particles.length; i++) particles[i].timerStart = millis();
                    switchToWord = true;

                }
                speechDuration = 0.1;
            }
        }

        if (freq < 100) highThreshold = false;
        if (freq > 300) highThreshold = true;

        if (highThreshold && !isHighPitch) {
            isHighPitch = true;
            highPitchCounter = 0;
            onHighPicthEvent = true;
        }

        if (!highThreshold && isHighPitch) {
            highPitchCounter++;
            if (highPitchCounter > 2) {
                isHighPitch = false;
            }
        }

        for(var i = 0; i < particles.length; i++) {

            if (isFlocking) {
                particles[i].zoomTailleTarget = 5;
                particles[i].speedo = amp*300+1;
            } else {
                if (!isBacteria) {
                    tooLoudTimer = millis();
                    for(var i = 0; i < particles.length; i++) particles[i].zoomTailleTarget = 1;
                }
            }

            if (onHighPicthEvent) {
                if (particles[i] != null && particles[i].superParticle && particles.length < 800) {
                    for (let i=0; i<5; i++) {
                        particles.push(new Particle( int(random(myPixels.length)), particles[i].depth , particles[i].depth , particles[i].pos.x, particles[i].pos.y ));
                    }
                }
            }

            if (particles[i] != null && toto > 100 && tessitura != 'mid') {
                isTooLoud = true;
                isTooLoudFinish = false;
                tooLoudTimer = millis();
                tooLoudEndedTimer = millis();
                particles[i].posTarget.x = particles[i].posEscape.x;
                particles[i].posTarget.y = particles[i].posEscape.y;
                particles[i].depthTarget = 0;
            }

            if (isTooLoud && particles[i] != null) {
                if (millis()-tooLoudTimer > 2000) {
                    particleShape = 5;
                    particles[i].posTarget.x = 30;
                    particles[i].posTarget.y = 20;
                    particles[i].depthTarget = random(-width,-1);
                    isTooLoud = false;
                }
            }

        }

        if (millis()-tooLoudEndedTimer > 3000) isTooLoudFinish = true;
        if (onHighPicthEvent) onHighPicthEvent = false;

    }

    translate(-width/2,-height/2,0);
    noStroke();
    fill(0,transpBG);
    push();
    translate(0,0,1);
    rect(0,0,width,height);
    pop();

    if (isWord) {
        isReady = false;
        if (millis()-startTimer > wordDuration) {
            isWord = false;
            isWordOver = true;
        }
    }
    
    if (isFlocking) {
        posX = (lerp(posX, noise (frameCount/500.0) * width, 0.05));
        posY = lerp(posY, noise (100+frameCount/400.0), 0.05);
    }

    if (!isBacteria && !isFlocking) {
        if (toto > 3) {
            if (transpBGTarget > 10) transpBGTarget-=30;
        } else {
            if (transpBGTarget < 205) transpBGTarget += 15;
        }
    }

    push();

    for(let i = 0; i < particles.length; i++) {

        let iterations = map(i,0,particles.length,5,1);

        if (!isTooLoud) {
            if (!isFlocking) particles[i].move(iterations);
            else particles[i].setVelo(posX, posY, noise (frameCount / 300.0));
            particles[i].checkEdge();
        }
     
        particles[i].display(radius);
        particles[i].zoomTaille += (particles[i].zoomTailleTarget - particles[i].zoomTaille) * 0.05;
        particles[i].alpha += (particles[i].alphaTarget-particles[i].alpha)*0.1;
        particles[i].depth += (particles[i].depthTarget-particles[i].depth)*0.1;
        particles[i].pos.x += (particles[i].posTarget.x - particles[i].pos.x) * 0.1;
        particles[i].pos.y += (particles[i].posTarget.y - particles[i].pos.y) * 0.1;

        if (particles[i].die) particles.splice(i,1);   

        if (particles.length == 0) {
            talkStarted = false; 
            isReady = true;
            isEmpty = true;
        } else  {
            isEmpty = false;
        }

    }

    pop();

    radius += (radiusTarget-radius) * easing;
    transpBG += (transpBGTarget-transpBG) * easing;

}
