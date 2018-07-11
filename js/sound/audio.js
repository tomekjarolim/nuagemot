let whispers;
let mic;
let amp = 0;
let fft;
let centroid = 0.0;
let bassEnergy;		// [0-255]
let midEnergy;		// [0-255]
let trebleEnergy;	// [0-255]
let confidence = 0.0;
const playMode = 'sustain'; // Allow overlapping players with a single audio buffer
let speechRec;
let wordsArray = [];
const audioPollFreq = 200; // ms

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
		speechRec = new p5.SpeechRec('fr-FR', gotSpeech);
		speechRec.continuous = true; 
		speechRec.interimResults = true;
		speechRec.start();
		// player
		let metroPlayer = setInterval(playWhisper, 250);
		// analyzer
		fft = new p5.FFT();
		audioAnalyser();
	}
}

// Called from draw() in main.js
function audioLoop() {
}

// Random granulation player, amplitude is controlled by mic input
function playWhisper() {
	let offset = floor(random(0, 16) * 2);
	whispers.play(0, 1, amp, offset, 1);
}

// Speech rec callback function
function gotSpeech() {
	if (speechRec.resultValue) {
		// Speech rec confidence value, between 0 and 1
		confidence = speechRec.resultConfidence;
		wordsArray.push(speechRec.resultString);
		//console.log(wordsArray.length);
	}
}

// Real time audio analysis with amp and fft at slower update frequency
function audioAnalyser() {
	if (micOn){
		amp = mic.getLevel();
		volume = mic.getLevel(0.7);
		
		fft.analyze();
		centroid = fft.getCentroid();
		bassEnergy = fft.getEnergy('bass');
		midEnergy = fft.getEnergy('mid');
		trebleEnergy = fft.getEnergy('treble');

		//console.log("Bass: " + bassEnergy + "   " + "Mid: " + midEnergy + "   " + "Treble: " + trebleEnergy)

		let analyserRefresh = setTimeout(audioAnalyser, audioPollFreq);
	}
}














