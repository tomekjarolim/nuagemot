/*
*
*   AUDIO VARIABLES : 
*
*
*   amp             // [0.0-1.0]     =>   Microphone realtime amplitude
*   centroid        // [0.0-~15000]  =>   Spectral centroid 
*                                         Not an indicator of the average pitch of voice
*                                         Useful as a speech dynamics analyser
*   bassEnergy      // [0.0-255]        
*   midEnergy       // [0.0-255]        
*   trebleEnergy    // [0.0-255]        
*
*   vowel           // ['i', 'e',          
*                       'u', 'a',
*                       'o', 'œ']    =>   No internet connexion needed, but results depend on your voice
*                                         
*   recognizedWords // [string]      =>   !!EXPERIMENTAL!! (May crash if used for too long)
*                                         Continuous stream of words and sentences recognized   
*                                         SpeechRecOn must be set to true
*
*/

const micOn = true;
const speechRecOn = false;
let recordState = 0;

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
    //audioLoop();
}

function mousePressed() {
}

function mouseReleased() {
}

function keyPressed() {
    // Press return to start/stop audio recording
    if (keyCode === RETURN) {
        if (recordState === 0) {
            recorder.record(soundFile);
            console.log('Recording audio...');
            recordState = 1;
        } else if (recordState === 1) {
            recorder.stop(); 
            let theTime = Date.now();
            saveSound(soundFile, 'whispers_' + theTime + '.wav');
            console.log('Stopped recording. Soundfile saved!');
            recordState = 0;
        }
    }
}

function mouseMoved() {
  /*for(var i = 0; i < nums; i++) {
    particles[i].posTarget.x -=4;
  }*/
	transpBGTarget = map(mouseY, 0, height, 255, 5);
  //radiusTarget = map(mouseY, 0, height, 2, 15);
}