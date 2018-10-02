// SOUNDFILES
let whispers;
let piano;
const playMode = 'sustain'; // Allow overlapping players with a single audio buffer
let defaultDuration = 0.300;       // Duration is in seconds
let whispersDensity = 80;           // ms
let rate = 1;
let whispersHaveBeenPlayed = false;
let pianoHasBeenPlayed = false;
////////////////////////////////// TEST //
let shouldPlayersBeOn = false;			//
//////////////////////////////////////////
// MIX
let master = new p5.Gain();
let granulationGain = new p5.Gain();
let whispersGain = new p5.Gain();
let pianoGain = new p5.Gain();
let pianoNoteGain = new p5.Gain(); 
let audioInGain = new p5.Gain(); 
let micGain = 10; // You may need to increase it if your microphone isn't sensitive enough
// AUDIO IN
let mic;
const audioPollFreq = 20;   // ms
let amp = 0;
let fft;
let centroid = 0.0;
let ampThresh = 0.01;
let isTalking = false;
window.y; // global variable for yin (wavesjs-lfo)
let freq;
// SPEECHDUR
let speechDur = 0;
const fadeEasing = 0.01;
let smoothSpeechDur = 0;
// EXPERIENCE
// let experienceDur = 0;
// let smoothExperienceDur = 0;
// SILENCEDUR
let silenceDur = 0;
let maxSilenceDur = 10;
let timerInterval = 1000;
// SCHEDULING 
let theEnd = false;
let silentState = false;
let afterWordDuration = 10000;
let isSchedulerOn = false;
let whispersDuration = 0;
let pianoDuration = 0;
let hasWordBeenDisplayed = false;
let hasRecordedCurrentTime = false;
// FILTERING
let filter = new p5.LowPass();
const filteringDur = 6;
let micFilteringOn = false;
// TIMEOUTS
let whisperPlayerTimeout;
let analyserTimeout;
let pianoTimeout;
let schedulerTimeout;
// X-FADE STRUCTURE
const pianoStartTime = 18;
const pianoFadeEndTime = 20;
const whispersFadeStartTime = 8;
const whispersFadeEndTime = 12;
const speechFadeStartTime = 10;
const speechFadeEndTime = pianoStartTime;
let continuousWhispers = false;
let isMasterFadingOut = false;
let experienceCurrentTime;
let experienceTargetTime;
// TESSITURA
let tessitura = '';
let tessInc = 0;
let tessArray = [];
let hasRecordedPitch = false;
let gotTessitura = false;
// PIANO PLAYER
const hiScale = [96, 112, 124, 144, 160, 172, 192];

// Called from preload() in main.js
function preloadSounds() {
    whispers = loadSound('js/assets/concatWhispersMono.mp3');
    piano = loadSound('js/assets/piano.mp3');
}

// Called from setup() in main.js
function audioSetup() {
	if (micOn) {
		whispersDuration = whispers.duration();
		pianoDuration = piano.duration();
		// input
		mic = new p5.AudioIn();
		mic.start();
		audioInGain.setInput(mic);
		audioInGain.connect(filter);
		filter.connect(master);
		filter.amp(1, 0.2, 0);
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
        // Whisper Player
		whispers.disconnect();
		granulationGain.setInput(whispers);
		granulationGain.connect(whispersGain);
		whispersGain.connect(master);
		whispersGain.amp(0, 0.2, 0);
		// Instruments Player (TODO)
		piano.disconnect();
		pianoNoteGain.setInput(piano);
		pianoNoteGain.connect(pianoGain);
		pianoGain.connect(master);
		pianoGain.amp(0, 0.2, 0);
	}
}

// Called from draw() in main.js
function audioLoop() {	
}

//	Random granulation player, amplitude is controlled by mic input
function playerrr() {
	if (shouldPlayersBeOn === true){
		let offset = Math.floor(random(whispersDuration));
		if (freq >= 70 && freq <= 580) rate = map(freq, 70, 580, 0.8, 1.7);
		whispers.play(0, rate, 1, offset, defaultDuration); //Man rate 0.85

    	whisperPlayerTimeout = setTimeout(playerrr, whispersDensity);
	}
}

// Real time audio handling at slower update frequency
function audioProcessor() {
	if (micOn){
		amp = mic.getLevel();
		let micVolume = amp * micGain;
		micVolume = constrain(micVolume, 0, 1);
		// Continuous whispers
		if (continuousWhispers === false){
			granulationGain.amp(micVolume, 0.2, 0);
		} else {
			granulationGain.amp(1, 2, 0);
		}
		fft.analyze();
		centroid = fft.getCentroid();
		if (window.y && window.y.pitch !== -1) freq = window.y.pitch;
		// Get tessitura at start
		if(freq) getPitch();
		// isTalking threshold
		isTalking = (amp >= ampThresh) ? true : false;
		if (isSchedulerOn === false && isTalking) {
			isSchedulerOn = true;
			audioInit();
		}
		// lowpass filtering on mic
		smoothSpeechDur += (speechDur - smoothSpeechDur) * fadeEasing;
		micFiltering(smoothSpeechDur);
		//console.log(smoothSpeechDur)
		//// Smooth experience duration counter
		//smoothExperienceDur += (experienceDur - smoothExperienceDur) * fadeEasing;
		// crossfade handling
		xFade();
		// if(isMasterFadingOut){
		// 	masterFadeOut();
		// }

		analyserTimeout = setTimeout(audioProcessor, audioPollFreq);
	}
}

// Dynamic timeline handler
function scheduler() {
	if(isSchedulerOn === true) {
		//experienceDur++;
		if (isTalking){
			speechDur++;
		} else {
			silenceDur++;
		}
		// Example of a test that enables tessitura function call only once 
		if (hasRecordedPitch === true && !gotTessitura) {
			getTessitura();
			console.log(tessitura);
			gotTessitura = true;
		}
		// 						
		if (micOn && silenceDur > maxSilenceDur && !hasWordBeenDisplayed){
			console.log("Too much silence, shutting down (w/ fadeout) audio and displaying the word!"); 
			hasWordBeenDisplayed = true;
			// START FADEOUT
			master.amp(0, 5, 0);
			// End is triggered n seconds after word is displayed
			theEnd = setTimeout(() => {
				console.log("End of loop, listening for the next user...");
				audioStop();
			}, afterWordDuration);
		}																		///////// TEST ////////////
		if (micOn && speechDur > whispersFadeStartTime && !whispers.isPlaying() && !whispersHaveBeenPlayed) {
			console.log("Whipers are fading in, speechDur = " + speechDur)
			shouldPlayersBeOn = true;
			playerrr();
			whispersHaveBeenPlayed = true;
		}																 ///////// TEST ////////////
		if (micOn && speechDur > pianoStartTime && !piano.isPlaying() && !pianoHasBeenPlayed) {
			console.log("Piano notes are fading in!")
			shouldPlayersBeOn = true;
			pianoPlayer();
			pianoHasBeenPlayed = true;
			//continuous whispers during piano stage
			continuousWhispers = true;
		} else {
			continousWhisperts = false;
		}
	}

	schedulerTimeout = setTimeout(scheduler, timerInterval);
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

// Crossfade between audio input (down) and whispers (up)
function xFade() {
	if (speechDur >= speechFadeStartTime && speechDur <= speechFadeEndTime){
		let vol = map(smoothSpeechDur, speechFadeStartTime, speechFadeEndTime, 1, 0, true);
		filter.amp(vol, 0.2, 0);
	}
	if (speechDur >= whispersFadeStartTime && speechDur <= whispersFadeEndTime){
		let vol = map(smoothSpeechDur, whispersFadeStartTime, whispersFadeEndTime, 0, 1, true);
		whispersGain.amp(vol, 0.2, 0);
	}
	if (speechDur >= pianoStartTime && speechDur){
		let vol = map(smoothSpeechDur, whispersFadeEndTime, pianoFadeEndTime, 0, 0.2, true);
		pianoGain.amp(vol, 0.2, 0);
	}
}

function pianoPlayer() {
	if(shouldPlayersBeOn){
		let offset;
		let duration;
		let noteInterval;
		if(tessitura === 'low'){
			// Vienna - random notes and duration - fast
			offset = Math.floor(random(pianoDuration / 4)) * 4;
			duration = random(0.1, 2);
			noteInterval = random(75, 250);
		} else if (tessitura === 'mid'){
			// Debussy - long notes - whole-tone scale - mid 
			offset = (Math.floor(random(14, pianoDuration / 8)) * 8) - 40;
			duration = random(1.5, 2.5);
			noteInterval = random(100, 300);
		} else if (tessitura === 'hi'){
			// Tonal - fixed duration - triads - C for now, will add F, Am, G, etc.
			offset = hiScale[Math.floor(random(hiScale.length))];
			duration = 1;
			noteInterval = random(190, 250);
		} else {
			console.log(`Didn't get tessitura? tessitura is ${tessitura ? tessitura : "empty"}`);
		}
		//console.log(`offset: ${offset} duration: ${duration} noteInterval: ${noteInterval}`)
		if (offset) piano.play(0, 1, 1, offset, duration);
		clearTimeout(pianoTimeout);

		pianoTimeout = setTimeout(pianoPlayer, noteInterval);
	}
}

function getPitch() {
	if (!hasRecordedPitch){ 
		++tessInc;
		if (tessInc < 50){ 
			tessArray.push(freq);
		} else {
			hasRecordedPitch = true;
			tessInc = 0;
		}
	}
}

function getTessitura() {
	let sum = 0;
	// get average pitch
	tessArray.forEach((e) => sum += e);
	let average = sum / tessArray.length;
	// get tessitura
	if (average < 115){
		tessitura = 'low';
	} else if (average > 115 && average < 170){
		tessitura = 'mid';
	} else if (average > 170){
		tessitura = 'hi';
	} else {
		console.log("Setting tessitura to low by default");
		tessitura = 'low';
	}
}

function audioInit() {
	shouldPlayersBeOn = false;
	pianoHasBeenPlayed = false;
	whispersHaveBeenPlayed = false;
	clearTimeouts();
	// isMasterFadingOut = false;
	hasWordBeenDisplayed = false;
	// hasRecordedCurrentTime = false;
	// experienceDur = 0;
	speechDur = 0;
	silenceDur = 0;
	micFilteringOn = true;
	hasRecordedPitch = false;
	gotTessitura = false;
	continuousWhispers = false;
	micOn = true;
	audioProcessor(); 
	// Turn audio back on 
	master.amp(1, 0.2, 0);
	filter.amp(1, 0.2, 0);
	scheduler();
	console.log("Scheduler started!");
}

function audioStop() {
	shouldPlayersBeOn = false;
	clearTimeouts();
	master.amp(0, 0.01, 0);
	// experienceDur = 0;
	speechDur = 0;
	silenceDur = 0;
	//smoothExperienceDur = 0;
	smoothSpeechDur = 0;
	isSchedulerOn = false;  
	audioProcessor(); 
	continuousWhispers = false;
	console.log("Scheduler stopped!");
}

function clearTimeouts() {
	if (whisperPlayerTimeout){
		clearTimeout(whisperPlayerTimeout)
	} else {
		console.log("tried to clear whispers timeout: undefined");	
	}
	if (pianoTimeout){
		clearTimeout(pianoTimeout)
	} else {
		console.log("tried to clear piano timeout: undefined");	
	}
	if (schedulerTimeout) {
		clearTimeout(schedulerTimeout)
	} else {
		console.log("tried to clear scheduler timeout: undefined");	
	}
}