const micOn = true;

function preload() {
    preloadSketch();
    preloadSounds();
}

function setup() {
    initSketch();
    audioSetup();
}

function draw() {
    drawSketch();
    audioLoop();
}

function mousePressed() {
}

function mouseReleased() {
}

function keyPressed() {
}

function mouseMoved() {
  /*for(var i = 0; i < nums; i++) {
    particles[i].posTarget.x -=4;
  }*/
	transpBGTarget = map(mouseY, 0, height, 255, 5);
  //radiusTarget = map(mouseY, 0, height, 2, 15);
}