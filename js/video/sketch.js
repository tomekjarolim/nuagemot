// particles variables
var particles = [];
var nums;
var particleDensity = 4000;
var noiseScale = 800;
var maxLife = 10;
var maxSpeed = 30;
var simulationSpeed = /*0.2*/0;
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
var transpBorder = 0;
var transpBorderTarget = 0;
var easing = .1;
var easing2 = .1;
var img;
var myPixels = []; 
var startTimer;
var zoom = 0;
var scaleVal = 5;
var posX;
var posY;
var rotation = 0;
var rotationTarget = 0;
var wordDuration = 10000;

var translation = 0;
var translationTarget = 0;

// position booleans
var isBacteria = true;
var isWord = false;
var isCloud = false;
var isDepth = false;
var isEscape = false;
var isFlocking = false;
var isRotate = false;

// word container
var pgText;
var myFont;
var txtCanvas = document.createElement("canvas");
var ctx;
var currentWord = "";

var speechDuration = 0;

var words = ["tu voyageras loin ?","n’oublie pas le pain","vers où ?","l’espace est un doute","c’est à dire","ici je suis ailleurs","fais-moi signe","paysage","paradis (au 7ème étage)","doute","jungle","yeux","voyager",
"déborder","ressentir","habiter","ça le fait","avoir l’air","au plaisir","à part ça","et pour cause","bien des choses","pour l’instant","ça alors","faut voir","tu parles","à d’autres","sans doute","nulle part","l’air de rien",
"et bien","de rien","encore heureux","rien que ça","par ailleurs","ou bien","tout simplement comment dire","de ci de là","que dalle","pour autant","vu d’ici","après tout","en vrai","d’ailleurs","quelque part","mon œil","et voilà",
"et alors","bien entendu","pourquoi pas","d’ici peu","sous silence","d’ici là","n’importe quoi","d’autant plus","tout d’un coup","mais encore","ma parole","et encore","bref","voilà voilà","sait-on jamais","bien du plaisir","ici même"];

// preaload images
function preloadSketch() {

    myFont = loadFont('js/assets/futura_book.otf');

}

// initial settings
function initSketch() {


    nums = 600;
    backgroundColor = color(0);

    createCanvas(windowWidth, windowHeight, WEBGL);
    background(backgroundColor);

    txtCanvas.width = width/scaleVal;
    txtCanvas.height = height/scaleVal;
    txtCanvas.setAttribute("id", "txtCss");
    
    //document.body.appendChild(txtCanvas);

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
            
    for( var yImage = 0 ; yImage < txtCanvas.height ; yImage++ ){
        for( var xImage = 0 ; xImage < txtCanvas.width ; xImage++ ){
            var iData = (yImage * (txtCanvas.width * 4)) + (xImage * 4);
            if( imgData[iData] > 250) myPixels.push( new WhitePixels( xImage , yImage ) );
        }
    }

    for(var i = 0; i < nums; i++){
        particles[i] = new Particle(int(random(myPixels.length)));
        particles[i].timerStart = millis();
    }

    posX = width/2+1;
    posY = 0;

}

var silenceStarted;
var hasTalked = false;

// draw skecth
function drawSketch() {

    ////////////////////////////////////////////////////// to delete
    if (amp) {
        let toto = amp*1000;
        if (toto > 1) {
            if (speechDuration < 500) speechDuration+=.25;
            if (transpBGTarget > 5) transpBGTarget--;
            //transpBGTarget = map(speechDuration,0,300,255,5);
            //radiusTarget = map(freq,70,480,2,10);
            radiusTarget = map(speechDuration,0,300,2,10);
            silenceStarted = millis();
            hasTalked = true;
            isWord = false;
            simulationSpeed = toto;
        } else {
            if (millis()-silenceStarted > 5000 && hasTalked) {
                isWord = true;
                isBacteria = true;
                isFlocking = false;
                speechDuration = 0.1;
                radiusTarget = 2;
            }
        }
        /*console.log(speechDuration);*/
    }
    ////////////////////////////////////////////////////////////////

    if (speechDuration == 0) {
        for(var i = 0; i < nums; i++) {
            particles[i].posTarget.x = width/2;
            particles[i].posTarget.y = height/2;
            particles[i].pos.x = width/2;
            particles[i].pos.y = height/2;
            background(0);
        }
    }

    if (speechDuration > 100 && speechDuration <= 200) {
        isBacteria = false;
    }

    if (speechDuration > 200 && speechDuration <= 300) {
        isFlocking = true;
    }

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

        if (key == 'a') {
            isWord = true;
            startTimer = millis();
            for (var i = 0; i < nums; i++) particles[i].timerStart = millis();
        }

        if (key == 'z') {
            isEscape = true;
            startTimer = millis();
        }
        if (key=='q') {
            transpBorderTarget = 255;
            radiusTarget = 40;
            for(var i = 0; i < nums; i++) {
                particles[i].zoomTailleTarget = 0;
                particles[i].alphaTarget = 0;
            }
        }
        if (key=='s') {
            transpBorderTarget = 0;
            radiusTarget = 2;
            for(var i = 0; i < nums; i++) {
                particles[i].zoomTailleTarget = 0;
                particles[i].alphaTarget = 255;
            }
        }
        if (key == 'h') { 

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

            for(var i = 0; i < nums; i++){
                var pos = int(random(myPixels.length));
                particles[i].timerStart = millis();
                particles[i].whitePosX = random(myPixels[pos].x*scaleVal-5,myPixels[pos].x*scaleVal+5);
                particles[i].whitePosY = random(myPixels[pos].y*scaleVal-5,myPixels[pos].y*scaleVal+5);
            }
        }
        if (key == 'o') {
            for(var i = 0; i < nums; i++) {
                var angleO = random(TWO_PI);
                particles[i].posTarget.x = width/2 + cos(angleO) * 200;
                particles[i].posTarget.y = height/2 + sin(angleO) * 200;
            }
        }
        if (key == 'p') {
            for(var i = 0; i < nums; i++) {
                var l = int(random(255));
                particles[i].zoomTailleTarget = l;
                particles[i].alphaTarget = map(l,0,255,15,5);
            }
        }
        if (key == 'P') {
            for(var i = 0; i < nums; i++) {
                particles[i].zoomTailleTarget = 0;
                particles[i].alphaTarget = 255;
            }
        }
        if (key == 'm') {
            for(var i = 0; i < nums; i++) {
                var l = int(random(20));
                particles[i].zoomTailleTarget = l;
                particles[i].alphaTarget = map(l,0,20,255,5);
            }
        }
        if (key == 'M') {
            for(var i = 0; i < nums; i++) {
                particles[i].zoomTailleTarget = 0;
                particles[i].alphaTarget = 255;
            }
        }
        if (key == 'f') {
            isFlocking = true;
        }
        if (key == 'F') {
            isFlocking = false;
        }
        if (key == 'r') {
            isRotate = true;
        }
        if (key == 'R') {
            isRotate = false;
        }
        if (key == 'b') {
            isBacteria = true;
        }
        if (key == 'B') {
            isBacteria = false;
        }
        if (key == 'd') {
            isDepth = true;
        }
        if (key == 'D') {
            isDepth = false;
        }
    }

    if (isWord) {

        if (millis()-startTimer > wordDuration) {
            isWord = false;
            for(var i = 0; i < nums; i++) particles[i].timerStart = millis();
        }

    }

    if (isEscape) {

        if (millis()-startTimer > wordDuration) isEscape = false;

    }

    noStroke();
    fill(0,transpBG);
    push();
    translate(0,0,1);
    rect(0,0,width,height);
    pop();
    
    if (isFlocking) {

        posX = lerp(posX, noise (frameCount /500.0) * width, 0.05);
        posY = lerp(posY, noise (100+frameCount / 400.0), 0.05);

    }

    if (isRotate) {
        rotationTarget = radians(mouseY);
        translationTarget = width/2;
    } else {
        rotationTarget = 0;
        translationTarget = 0;
    }

    push();

    translate(0,translation,0);
    rotateX(rotation);

    for(var i = 0; i < nums; i++) {

        var iterations = map(i,0,nums,5,1);
        
        if (!isFlocking) particles[i].move(iterations);
        else particles[i].setVelo(posX, posY, noise (frameCount / 300.0));

        particles[i].checkEdge();
        
        var particleColor;
        var fadeRatio;
        fadeRatio = min(particles[i].life * 5 / maxLife, 1);
        fadeRatio = min((maxLife - particles[i].life) * 5 / maxLife, fadeRatio);

        var lifeRatioGrayscale = min(255, (255 * particles[i].life / maxLife) + red(backgroundColor));
        particleColor = color(255, alpha * fadeRatio);
          
        particles[i].display(radius);
        particles[i].pos.x = particles[i].pos.x + ((particles[i].posTarget.x - particles[i].pos.x) * 0.1);
        particles[i].pos.y = particles[i].pos.y + ((particles[i].posTarget.y - particles[i].pos.y) * 0.1);

        particles[i].zoomTaille = particles[i].zoomTaille + ((particles[i].zoomTailleTarget - particles[i].zoomTaille) * 0.1);
        //particles[i].alpha = particles[i].alpha + ((particles[i].alphaTarget - particles[i].alpha) * 0.1);
        particles[i].alpha += (particles[i].alphaTarget-particles[i].alpha)*0.1;

    } 

    pop();

    radius += (radiusTarget-radius) * easing2;
    transp += (transpTarget-transp) * easing2;
    transpBorder += (transpBorderTarget-transpBorder) * easing2;
    transpBG += (transpBGTarget-transpBG) * easing2;
    rotation += (rotationTarget-rotation) * easing;
    translation += (translationTarget-translation) * easing;


}

function getSound() {

    radiusTarget = map(amp, 0, 1, 1, 80, true);

}