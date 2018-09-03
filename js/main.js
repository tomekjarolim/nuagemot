/*
*
*   AUDIO VARIABLES : 
*
*
*   amp             // [0.0-1.0]        =>   Microphone realtime amplitude
*   centroid        // [0.0-~15000]     =>   Spectral centroid 
*                                            Not an indicator of the average pitch of voice
*                                            Useful as a speech dynamics analyser      
*
*   freq            // [~70.0-~480.0~]  =>   Wavesjs-flo Yin, an estimation of the fundamental frequency of speech
*
*/

let micOn = true;
let recordState = 0;

function preload() {
    preloadSketch();
    preloadSounds();
}

function setup() {
    initSketch();
    audioSetup();
    //noCursor();
}

function draw() {
    drawSketch();
    audioLoop();
}

function mousePressed() {
}

function mouseReleased() {
}

function mouseDragged() {
  zoom = map(mouseX,0,width,-2*width,width);
}

function keyPressed() {
}

function mouseMoved() {
    //maxSpeed = map(mouseX, width/10, width*9/10, 10, 0.4, true);
    //simulationSpeed = map(mouseX, 0, width, 2, maxSpeed, true);
    //transpBGTarget = map(mouseY, 0, height, 255, 5);
}