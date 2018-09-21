let whispers;
let mic;
let amp = 0;
let fft;
let centroid = 0.0;
const playMode = 'sustain'; // Allow overlapping players with a single audio buffer
const audioPollFreq = 20; // ms
let duration = 0.300;     // Duration is in seconds
let density = 80;         // ms
let rate = 1; 
let micBuffer;
let master = new p5.Gain();
let granulationGain = new p5.Gain();
let audioInGain = new p5.Gain(); 
let micGain = 10; // You may need to increase it if your microphone isn't sensitive enough
window.y; // global variable for yin (wavesjs-lfo)
let freq;
let ampThresh = 0.01;
let isTalking = false;
let speechDur = 0;
let silenceDur = 0;
let eloquence = 50; // Eloquence gauge starts at 50
let timerInterval = 250;
let theEnd = false;
let silentState = false;
let afterWordDuration = 20000;
let zeroTimerDuration = 5000;
let isSchedulerOn = false;
let whispersDuration = 0; 

// Called from preload() in main.js
function preloadSounds() {
    whispers = loadSound('js/assets/concatWhispers.mp3');
}

// Called from setup() in main.js
function audioSetup() {
	if (micOn) {
		whispersDuration = whispers.duration();
		// input
		mic = new p5.AudioIn();
		mic.start();
		audioInGain.setInput(mic);
		audioInGain.connect(master);
		// output 
		master.connect();
		master.amp(1, 0.5, 0); 
		// analyzer
		fft = new p5.FFT();
		audioAnalyser();
        // Recorder
        recorder = new p5.SoundRecorder();
        recorder.setInput(mic);
        // Player
		whispers.disconnect();
		granulationGain.setInput(whispers);
		granulationGain.connect(master);
		//playerrr();
	}
}

// Called from draw() in main.js
function audioLoop() {
}

//	Random granulation player, amplitude is controlled by mic input
function playerrr() {
	let offset = Math.floor(random(whispersDuration));
	if (freq >= 70 && freq <= 580) rate = map(freq, 70, 580, 0.8, 1.7);
	whispers.play(0, rate, 1, offset, duration); //Man rate 0.85

    let metroPlayer = setTimeout(playerrr, density);
}

// Real time audio analysis with amp and fft at slower update frequency
function audioAnalyser() {
	if (micOn){
		amp = mic.getLevel();
		let micVolume = amp * micGain;
		micVolume = constrain(micVolume, 0, 1);
		//console.log(micVolume);
		granulationGain.amp(micVolume, 0.2, 0);
		micGranulationGain.amp(amp * micGain, 0.2, 0);
		fft.analyze();
		centroid = fft.getCentroid();
		if (window.y && window.y.pitch !== -1) freq = window.y.pitch;
		// isTalking threshold
		isTalking = (amp >= ampThresh) ? true : false;
		if (isSchedulerOn === false && isTalking) {
			isSchedulerOn = true;
			scheduler();
			console.log("Scheduler started!");
		}

		let analyserRefresh = setTimeout(audioAnalyser, audioPollFreq);
	}
}

// Dynamic timeline handler
function scheduler() {
	let timer;
	if(isSchedulerOn === true) {
		let zeroTimer;
		if (isTalking){
			speechDur++;
			eloquence += 2; // ++ faster than --
		} else {
			silenceDur++;
			eloquence--; 
		}
		eloquence = constrain(eloquence, 0, 100);

		// When eloquence is at its minimum, 
		if (micOn && eloquence === 0){ 
			// Word is displayed when eloquence hit zero
			console.log("Eloquence gauge at zero, shutting down audio and displaying the word!"); 
			micOn = false;
			granulationGain.amp(0, 1, 0);
			micGranulationGain.amp(0, 1, 0);
			// End is triggered n seconds after word is displayed
			theEnd = setTimeout(() => {
				console.log("End of loop, listening for the next user...");
				// unblock audio and freeze scheduler
				micOn = true;
				audioAnalyser();
				isSchedulerOn = false;
				console.log("Scheduler stopped!")
				speechDur = 0;
				silenceDur = 0; 
				eloquence = 50;
			}, afterWordDuration);
		}		
	}
	
	timer = setTimeout(scheduler, timerInterval);
}
















