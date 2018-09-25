let whispers;
let mic;
let amp = 0;
let fft;
let centroid = 0.0;
const playMode = 'sustain'; // Allow overlapping players with a single audio buffer
const audioPollFreq = 20;   // ms
let duration = 0.300;       // Duration is in seconds
let density = 80;           // ms
let rate = 1; 
let micBuffer;
let master = new p5.Gain();
let granulationGain = new p5.Gain();
let audioInGain = new p5.Gain(); 
let micGain = 10; // You may need to increase it if your microphone isn't sensitive enough
window.y; 		  // global variable for yin (wavesjs-lfo)
let freq;
let ampThresh = 0.01;
let isTalking = false;
let speechDur = 0;
/////////////////////////////////////////////////////////////////////
//                                                                 //
//	No eloquence anymore, use those variables to trig the events   //
//                                                                 //
let silenceDur = 0;                                                //
let maxSilenceDur = 30;                                            //
/////////////////////////////////////////////////////////////////////
let timerInterval = 250;
let theEnd = false;
let silentState = false;
let afterWordDuration = 20000;
let isSchedulerOn = false;
let whispersDuration = 0;
let filter = new p5.LowPass();
const filteringDur = maxSilenceDur/3;
let micFilteringOn = false;

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
		audioInGain.connect(filter);
		filter.connect(master);
		micFilteringOn = true;
		// output 
		master.connect();
		master.amp(1, 0.5, 0); 
		// analyzer
		fft = new p5.FFT();
		audioProcessor();
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

/*



		ACTUAL PLAYERRR FUNCTION IS DEPRECATED, A NEW ONE WILL BE ADDED SOON 



*/
//	Random granulation player, amplitude is controlled by mic input
// function playerrr() {
// 	let offset = Math.floor(random(whispersDuration));
// 	if (freq >= 70 && freq <= 580) rate = map(freq, 70, 580, 0.8, 1.7);
// 	whispers.play(0, rate, 1, offset, duration); //Man rate 0.85

//     let metroPlayer = setTimeout(playerrr, density);
// }

// Real time audio analysis with amp and fft at slower update frequency
function audioProcessor() {
	if (micOn){
		amp = mic.getLevel();
		let micVolume = amp * micGain;
		micVolume = constrain(micVolume, 0, 1);
		//console.log(micVolume);
		granulationGain.amp(micVolume, 0.2, 0);
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
		//lowpass filter on mic
		if (isSchedulerOn === true) micFiltering(speechDur);

		let analyserRefresh = setTimeout(audioProcessor, audioPollFreq);
	}
}

/*
	NO ELOQUENCE GAUGE ANYMORE... 
	USE SILENCEDUR AND MAXSILENCEDUR TO TRIG THE WORD
*/
// Dynamic timeline handler
function scheduler() {
	let timer;
	if(isSchedulerOn === true) {
		if (isTalking){
			speechDur++;
		} else {
			silenceDur++;
		}
		// TRUST THIS TEST :
		if (micOn && silenceDur === maxSilenceDur){  
			// Word is displayed when silenceDur exceeds maxSlienceDur value
			console.log("Too much silence, shutting down audio and displaying the word!"); 
			micOn = false;
			granulationGain.amp(0, 1, 0);
			// End is triggered n seconds after word is displayed
			theEnd = setTimeout(() => {
				console.log("End of loop, listening for the next user...");
				// unblock audio and freeze scheduler
				micOn = true;
				audioProcessor();
				isSchedulerOn = false;
				console.log("Scheduler stopped!")
				speechDur = 0;
				silenceDur = 0;
				micFilteringOn = true;
			}, afterWordDuration);
		}		
	}
	
	timer = setTimeout(scheduler, timerInterval);
}

// Microphone filtering with exponentially increasing cutoff freq
function micFiltering(f) {
	if (micFilteringOn){
		const min = 0;
		const max = filteringDur;
	  	let newMin = Math.log(10);
	  	let newMax = Math.log(10000);
	  	let scale = (newMax - newMin) / (max - min);
	  	let cutoff = Math.exp(newMin + scale * (f - min));
	  	cutoff = constrain(cutoff, 10, 12000);
	  	//console.log(cutoff);
		filter.freq(cutoff);
		if (cutoff >= 12000) {
			console.log("Done filtering!");
			micFilteringOn = false;
		}
	}
}










