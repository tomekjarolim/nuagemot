const micOn = true;

function preload() {
    preloadSketch();
    //preloadSounds();
}

function setup() {
    initSketch();
    //audioSetup();
}

function draw() {
    drawSketch();
    //audioLoop();
}

function mousePressed() {
}

function mouseReleased() {
}

function mouseDragged() {
  zoom = map(mouseX,0,width,-width,width);
}

function keyPressed() {
}

function mouseMoved() {
  /*for(var i = 0; i < nums; i++) {
    particles[i].posTarget.x -=4;
  }*/
    maxSpeed = map(mouseX, width/10, width*9/10, 10, 0.4, true);

    simulationSpeed = map(mouseX, 0, width, 2, maxSpeed, true);

    transpBGTarget = map(mouseY, 0, height, 255, 5);
   // transpBGTarget = 255;

  //radiusTarget = map(mouseY, 0, height, 2, 15);
}