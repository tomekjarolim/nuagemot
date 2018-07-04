function preload() {
	preloadSketch();
}

function setup() {
	initSketch();
}

function draw() {
	drawSketch();
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
	maxSpeed = map(mouseX, width/10, width*9/10, 10, 0.4, true);
	simulationSpeed = map(mouseX, width/10, width*9/10, 0.1, maxSpeed, true);
}