// SOUNDFILES
let whispers;
let piano;
let whispersHaveBeenPlayed = false;
let pianoHasBeenPlayed = false;
let shouldPlayersBeOn = false;
// MIX
let master = new p5.Gain();
let granulationGain = new p5.Gain();
let whispersGain = new p5.Gain();
let pianoGain = new p5.Gain();
let pianoNoteGain = new p5.Gain();
let audioInGain = new p5.Gain();
let micGain = 10; // You may need to increase it if your microphone isn't sensitive enough
let masterVol = 1; 
// AUDIO IN
let mic;
let amp = 0;
let fft;
let centroid = 0.0;
let ampThresh = 0.01;
let isTalking = false;
window.y; // global variable for yin (wavesjs-lfo)
let freq;
// AUDIO PROCESSOR
let audioProcessorLoop;
// SCHEDULING 
let schedulerLoop;
let theEnd = false;
let silentState = false;
let afterWordDuration = 10000;
let isSchedulerOn = false;
let whispersDuration = 0;
let pianoDuration = 0;
let hasWordBeenDisplayed = false;
// SPEECHDUR
let speechDur = 0;
const fadeEasing = 0.01;
let smoothSpeechDur = 0;
// SILENCEDUR
let silenceDur = 0;
let maxSilenceDur = 10;
// X-FADE STRUCTURE
const pianoStartTime = 15;
const pianoFadeEndTime = 18;
const whispersFadeStartTime = 6;
const whispersFadeEndTime = 10;
const speechFadeStartTime = 8;
const speechFadeEndTime = whispersFadeEndTime;
let continuousWhispers = false;
// FILTERING
let filter = new p5.LowPass();
const filteringDur = whispersFadeEndTime - 2;
let micFilteringOn = false;
// TESSITURA
let tessitura = '';
let tessInc = 0;
let tessArray = [];
let hasRecordedPitch = false;
let gotTessitura = false;
// WHISPERS PLAYER
let whisperPlayer;
// PIANO PLAYER
let pianoPlayer;
const hiScale = [96, 112, 124, 144, 160, 172, 192];

// Called from preload() in main.js
function preloadSounds() {
    whispers = loadSound('js/assets/concatWhispersMono.mp3');
    // piano = loadSound('js/assets/piano.mp3');
    piano = loadSound('js/assets/pia.mp3'); // 22050 version
}

// Called from setup() in main.js
function audioSetup() {
	if (micOn) {
		// AUDIO SETTINGS
		const playMode = 'sustain';
		whispersDuration = whispers.duration();
		pianoDuration = piano.duration();
		// input
		mic = new p5.AudioIn();
		mic.start();
		mic.disconnect();
		audioInGain.setInput(mic);
		audioInGain.connect(filter);
		filter.disconnect();
		filter.connect(master);
		filter.amp(1, 0.2, 0);
		micFilteringOn = true;
		// output 
		master.connect();
		master.amp(1, 0.5, 0); 
		// analyzer
		fft = new p5.FFT();
        // Whisper Player
		whispers.disconnect();
		granulationGain.setInput(whispers);
		granulationGain.disconnect();
		granulationGain.connect(whispersGain);
		whispersGain.connect(master);
		whispersGain.amp(0, 0.2, 0);
		// Piano Player 
		piano.disconnect();
		pianoNoteGain.setInput(piano);
		pianoNoteGain.disconnect();
		pianoNoteGain.connect(pianoGain);
		pianoGain.connect(master);
		pianoGain.amp(0, 0.2, 0);
		/*
		*
		*	p5.SoundLoop used instead of the old seTimeOuts
		*	Interval time is acccessible dynamically from out of the scope like this:
		*
		*		nameOfTheLoop.interval = yourNewInterval		
		*
		*/
		// Audio Processor
		const audioPollFreq = 0.020; // in seconds
		audioProcessorLoop = new p5.SoundLoop(() => {
			if (micOn) audioProcessor();
		}, audioPollFreq);
		audioProcessorLoop.start()
		// Whispers Player
		const defaultDuration = 0.300; // Duration is in seconds
		let rate = 1;
		const whispersInterval = 0.08; // in seconds
		whispersPlayer = new p5.SoundLoop(() => {
			if (shouldPlayersBeOn === true){
				let offset = Math.floor(random(whispersDuration));
				if (freq >= 70 && freq <= 580) rate = map(freq, 70, 580, 0.8, 1.7);
				whispers.play(0, rate, 1, offset, defaultDuration); //Man rate 0.85
			}
		}, whispersInterval);
		// Piano Player
		let offset;
		let duration;
		let noteInterval;
		pianoPlayer = new p5.SoundLoop(() => {
			if(shouldPlayersBeOn) playPianoNote(offset, duration, noteInterval)
		}, 1);
		// Scheduler
		const schedulerInterval = 1;
		schedulerLoop = new p5.SoundLoop(() => {
			if(isSchedulerOn) scheduler()
		}, schedulerInterval);
	}
}

// Called from draw() in main.js
function audioLoop() {	
}

// Real time audio handling at slower update frequency
function audioProcessor() {	
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
	if (isSchedulerOn === false && isTalking) audioInit();
	// lowpass filtering on mic
	smoothSpeechDur += (speechDur - smoothSpeechDur) * fadeEasing;
	micFiltering(smoothSpeechDur);
	// Crossfade function
	xFade();
}


/*
*	Dynamic timeline handler
*	To be called from a loop at a very slow interval (1s for instance)
*/
function scheduler() {
	if (isTalking){
		speechDur++;
	} else {
		silenceDur++;
	}
	if (hasRecordedPitch === true && !gotTessitura) {
		getTessitura();
		console.log(tessitura);
		gotTessitura = true;
	}					
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
	}
	if (micOn && speechDur > whispersFadeStartTime && !whispers.isPlaying() && !whispersHaveBeenPlayed) {
		console.log("Whipers are fading in, speechDur = " + speechDur)
		shouldPlayersBeOn = true;
		whispersPlayer.start();
		whispersHaveBeenPlayed = true;
	}
	if (micOn && speechDur > pianoStartTime && !piano.isPlaying() && !pianoHasBeenPlayed) {
		console.log("Piano notes are fading in!")
		shouldPlayersBeOn = true;
		pianoPlayer.start();
		pianoHasBeenPlayed = true;
		//continuous whispers during piano stage
		continuousWhispers = true;
	} else {
		continousWhisperts = false;
	}
}

/* 
*	Microphone filtering
*	exponentially increasing cutoff freq !!!NOT ANYMORE!!!
*/
function micFiltering(f) {
	if (micFilteringOn){
		// const min = 0;
		// const max = filteringDur;
	 	// let newMin = Math.log(10);
	 	// let newMax = Math.log(10000);
	 	// let scale = (newMax - newMin) / (max - min);
	 	// let cutoff = Math.exp(newMin + scale * (f - min));
	 	// cutoff = constrain(cutoff, 10, 12000);
		let cutoff = map(f, 0, filteringDur, 30, 500);
		//console.log(cutoff);
		filter.freq(cutoff);
		// if (cutoff >= 12000) {
		if (cutoff >= 500) {
			console.log("Done filtering!");
			micFilteringOn = false;
		}
	}
}

/*
*	Crossfade between audio input (down) and whispers (up)
*	But not completely (filtered voice is audible through the whole exp)
*/
function xFade() {
	if (speechDur >= speechFadeStartTime && speechDur <= speechFadeEndTime){
		let vol = map(smoothSpeechDur, speechFadeStartTime, speechFadeEndTime, 1, 0.5, true);
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

/*
*	Plays a single piano note according to tessitura
*	The function has to be called inside a loop 
*/
function playPianoNote(offset, duration, noteInterval){
	// Vienna - random notes and duration - fast
	if(tessitura === 'low'){ 
		offset = Math.floor(random(pianoDuration / 4)) * 4;
		duration = random(0.1, 2);
		noteInterval = random(0.1, 0.250);
	// Debussy - long notes - whole-tone scale - mid 
	} else if (tessitura === 'mid'){
		offset = (Math.floor(random(14, pianoDuration / 8)) * 8) - 40;
		duration = random(1.5, 2.5);
		noteInterval = random(0.100, 0.300);
	// Tonal - fixed duration - triads - C for now, will add F, Am, G, etc.
	} else if (tessitura === 'hi'){
		offset = hiScale[Math.floor(random(hiScale.length))];
		duration = 1;
		noteInterval = random(0.190, 0.250);
	} else {
		console.log(`Didn't get tessitura? tessitura is ${tessitura ? tessitura : "empty"}`);
		console.log("Setting tessitura to low by default!");
		tessitura = 'low';
	}
	pianoPlayer.interval = noteInterval;
	if (offset) piano.play(0, 1, 1, offset, duration);
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
	stopLoops(); // FRESH START
	shouldPlayersBeOn = false;
	pianoHasBeenPlayed = false;
	whispersHaveBeenPlayed = false;
	hasWordBeenDisplayed = false;
	speechDur = 0;
	silenceDur = 0;
	smoothSpeechDur = 0;
	micFilteringOn = true;
	hasRecordedPitch = false;
	gotTessitura = false;
	continuousWhispers = false;
	micOn = true;
	audioProcessorLoop.start();
	// Turn audio back on 
	master.amp(1, 0.2, 0);
	filter.amp(1, 0.2, 0);
	pianoGain.amp(0, 0.2, 0);
	whispersGain.amp(0, 0.2, 0);
	// scheduler loop starter
	isSchedulerOn = true;
	schedulerLoop.start();
	console.log("Scheduler started!");
}

function audioStop() {
	shouldPlayersBeOn = false;
	stopLoops();
	master.amp(0, 0.2, 0);
	// experienceDur = 0;
	speechDur = 0;
	silenceDur = 0;
	//smoothExperienceDur = 0;
	smoothSpeechDur = 0;
	isSchedulerOn = false;  
	audioProcessorLoop.start();
	continuousWhispers = false;
	console.log("Scheduler stopped!");
}

/*
*	Stops the SoundLoops
*	all but the audioAnalyser one 
*/
function stopLoops() {
	if (whispers.isPlaying()) whispersPlayer.stop();
	if (piano.isPlaying()) pianoPlayer.stop();
	if (isSchedulerOn) schedulerLoop.stop();
}