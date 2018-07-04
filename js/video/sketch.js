// particles variables
var particles = [];
var nums;
var particleDensity = 4000;
var noiseScale = 800;
var maxLife = 10;
var maxSpeed = 10;
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
var easing2 = .1;
var img;
var myPixels = []; 
var startTimer;

// position booleans
var isBacteria = true;
var isWord = false;
var isCloud = false;
var isVanGogh = false;
var isEscape = false;

// preaload images
function preloadSketch() {

    img = loadImage('js/assets/hello.png');

}

// initial settings
function initSketch() {

    nums = 750;
    backgroundColor = color(0);

    createCanvas(windowWidth, windowHeight, WEBGL);
    background(backgroundColor);

    for (var i=0; i<img.width; i++) {
        for (var j=0; j<img.height; j++) {
            var c = img.get(i, j);
            if (red(c) == 255) {
                myPixels.push(new WhitePixels(i, j));
            }
        }
    }

    // for (var i=0; i<myPixels.length; i++) console.log(myPixels[i].x);
    for(var i = 0; i < nums; i++){
        particles[i] = new Particle(int(random(myPixels.length)));
    }

}

// draw skecth
function drawSketch() {

    getSound();

    translate(-width/2,-height/2,0);

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
            isEscape = true;
            //isCloud = true;
        }

        if (key == 'E') {
            //isCloud = false;
        }

    }

    if (isWord) {

        if (millis()-startTimer > 5000) isWord = false;

    }

    if (isEscape) {

        if (millis()-startTimer > 5000) isEscape = false;

    }

    noStroke();
    fill(0,transpBG);
    rect(0,0,width,height);

    for(var i = 0; i < nums; i++) {

        var iterations = map(i,0,nums,5,1);
        
        particles[i].move(iterations);
        particles[i].checkEdge();
        
        var particleColor;
        var fadeRatio;
        fadeRatio = min(particles[i].life * 5 / maxLife, 1);
        fadeRatio = min((maxLife - particles[i].life) * 5 / maxLife, fadeRatio);

        var lifeRatioGrayscale = min(255, (255 * particles[i].life / maxLife) + red(backgroundColor));
        particleColor = color(255, alpha * fadeRatio);
            
        fill(red(particleColor), green(particleColor), blue(particleColor), transp * fadeRatio);
        particles[i].display(radius);
        //if (i==0) console.log("val : "+particles[i].angleT+" | "+particles[i].angleMinT);

        particles[i].pos.x = particles[i].pos.x + ((particles[i].posTarget.x - particles[i].pos.x) * 0.1);
        particles[i].pos.y = particles[i].pos.y + ((particles[i].posTarget.y - particles[i].pos.y) * 0.1);

    } 

    radius += (radiusTarget-radius) * easing2;
    transp += (transpTarget-transp) * easing2;
    transpBG += (transpBGTarget-transpBG) * easing2;

}

function getSound() {
    radiusTarget = map(amp, 0, 1, 1, 80, true);
    transpBGTarget = map(centroid, 3000, 8000, 255, 5);
}