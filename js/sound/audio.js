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
const audioPollFreq = 20; // ms
let duration = 0.300;     // Duration is in seconds
let density = 80;         // ms
let rate = 1; 
let soundFile;
let recognizedWords;
let master = new p5.Gain();
let granulationGain = new p5.Gain();
let micGain = 30; // You may need to increase it if your microphone isn't sensitive enough
window.v; // global variable for vowels
let vowel = '';
window.y; // global variable for yin (wavesjs-lfo)
let freq;

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
		// let sources = mic.getSources((srcs) => {
		// 	//console.log(srcs); 
		// 	//mic.setSource(5);
		// });
		//
		// output 
		master.connect();
		master.amp(1, 0.5, 0); 
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
		//granulationGain = new p5.Gain();
		granulationGain.setInput(whispers);
		granulationGain.connect(master);
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

//	Random granulation player, amplitude is controlled by mic input
function playWhisper() {
    let offset = floor(random(0, 16) * 2); 
	if (freq >= 70 && freq <= 580) rate = map(freq, 70, 580, 0.8, 1.7);
	//console.log(rate); 
	whispers.play(0, rate, 1, offset, duration); //Man rate 0.85

    let metroPlayer = setTimeout(playWhisper, density);
}

// Speech rec callback function
function gotSpeech() {
	if (speechRec.resultValue) {
		// Speech rec confidence value, between 0 and 1
		confidence = speechRec.resultConfidence;
		recognizedWords = speechRec.resultString; 
		//wordsArray.push(speechRec.resultString);
		//console.log(wordsArray.length);
		console.log(speechRec.resultString);
	}
}

// Real time audio analysis with amp and fft at slower update frequency
function audioAnalyser() {
	if (micOn){
		amp = mic.getLevel();
		granulationGain.amp(amp * micGain, 0.1, 0);
		fft.analyze();
		centroid = fft.getCentroid();
		bassEnergy = fft.getEnergy('bass');
		midEnergy = fft.getEnergy('mid');
		trebleEnergy = fft.getEnergy('treble');
		//console.log("Bass: " + bassEnergy + "   " + "Mid: " + midEnergy + "   " + "Treble: " + trebleEnergy)
		if (typeof window.v !== "undefined") vowel = window.v;
		if (window.y && window.y.pitch !== -1) freq = window.y.pitch;

		let analyserRefresh = setTimeout(audioAnalyser, audioPollFreq);
	}
}