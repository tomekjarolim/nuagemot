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
const audioPollFreq = 10; // ms
let duration = 0.200; // Duration is in seconds
let density = 15;     // ms
let soundFile;
let recognizedWords;

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
		// output 
		master = new p5.Gain();
		master.connect(); 
		// speech recognition
		if (speechRecOn) {
			speechRec = new p5.SpeechRec('fr-FR', gotSpeech);
			speechRec.continuous = true; 
			speechRec.interimResults = true;
			speechRec.start();
			speechRec.onEnd = () => speechRec.start();
			resetRec = setInterval(() => speechRec.abort(), 5000);
		}
		// analyzer
		fft = new p5.FFT();
		audioAnalyser();
		// Player
		whispers.disconnect();
		granulationGain = new p5.Gain();
		granulationGain.setInput(whispers);
		playWhisper();
        // Recorder
        recorder = new p5.SoundRecorder();
        recorder.setInput(mic);
        soundFile = new p5.SoundFile();
	}
}

// Called from draw() in main.js
function audioLoop() {
}

/*	Random granulation player, amplitude is controlled by mic input
*
*	TODO : Do not set the volume locally, it sounds weird:
*		   Should the microphone control the master volume instead? 
*
*/
function playWhisper() {
    let offset = floor(random(0, 16) * 2); 
	//let offset = floor(random(0, whispers.duration()));
	whispers.play(0, 1, volume, offset, duration);

    let metroPlayer = setTimeout(playWhisper, density);
}

// Speech rec callback function
function gotSpeech() {
	if (speechRec.resultValue) {
		// Speech rec confidence value, between 0 and 1
		confidence = speechRec.resultConfidence;
		recognizedWords = speecRec.resultString; 
		//wordsArray.push(speechRec.resultString);
		//console.log(wordsArray.length);
		//console.log(speechRec.resultString);
	}
}

// Real time audio analysis with amp and fft at slower update frequency
function audioAnalyser() {
	if (micOn){
		amp = mic.getLevel();
		volume = mic.getLevel(0.8);
		fft.analyze();
		centroid = fft.getCentroid();
		bassEnergy = fft.getEnergy('bass');
		midEnergy = fft.getEnergy('mid');
		trebleEnergy = fft.getEnergy('treble');
		//console.log("Bass: " + bassEnergy + "   " + "Mid: " + midEnergy + "   " + "Treble: " + trebleEnergy)
		
		let analyserRefresh = setTimeout(audioAnalyser, audioPollFreq);
	}
}