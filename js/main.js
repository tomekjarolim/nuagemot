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
}