let whispers;
let mic;
let amp = 0;
let fft;
let centroid = 0.0;
let confidence = 0.0;
const playMode = 'sustain';
let speechRec; 

// Called from preload() in main.js
function preloadSounds() {
	whispers = loadSound('js/assets/whispers.mp3');
}

// Called from setup() in main.js
function audioSetup() {
	if (micOn) {
		// input
		mic = new p5.AudioIn();
		mic.start();
		// speech recognition
		speechRec = new p5.SpeechRec('fr-FR', gotSpeech)
		let continuous = true;
		let interim = true;
		speechRec.start(continuous, interim);
		// player
		let metroPlayer = setInterval(playWhisper, 250);
		// analyzer
		fft = new p5.FFT();
	}
}

// Called from draw() in main.js
function audioLoop() {
	if (micOn){
		amp = mic.getLevel(0.8) * 5;
		fft.analyze();
		centroid = fft.getCentroid();
	}
}

// Random granulation player, amplitude is controlled by mic input
function playWhisper() {
	let offset = floor(random(0, 16) * 2);
	whispers.play(0, 1, amp, offset, 1);
}

function gotSpeech() {
	if (speechRec.resultValue) {
		// Speech rec confidence value, between 0 and 1
		confidence = speechRec.resultConfidence;
	}
}









