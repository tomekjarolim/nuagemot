// SOUNDFILES
let whispers;
let whispersHaveBeenPlayed = false;
let continuousWhispersTriggered = false;
let shouldPlayersBeOn = false;
// MIX
let master = new p5.Gain();
let granulationGain = new p5.Gain();
let whispersGain = new p5.Gain();
let audioInGain = new p5.Gain();
let micGain = 10; // You may need to increase it if your microphone isn't sensitive enough
let isMasterFadingOut = false;
// AUDIO IN
let mic;
let amp = 0;
let fft;
let centroid = 0.0;
let ampThresh = 0.001;
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
let hasWordBeenDisplayed = false;
let continuousWhispers = false;
// SPEECHDUR
let speechDur = 0;
const fadeEasing = 0.01;
let smoothSpeechDur = 0;
// SILENCEDUR
let silenceDur = 0;
let maxSilenceDur = 10;
// X-FADE STRUCTURE //////////////////////////////////////////
const continuousWhispersStartTime = 15;                     //
const whispersFadeStartTime =       4;                      //
const whispersFadeEndTime =         6;                      //
const speechFadeStartTime =         8;                      //
const speechFadeEndTime =           whispersFadeEndTime;    //
//////////////////////////////////////////////////////////////
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
let whisperState = 0;
// INSTANTS PLAYER
let instants = []; 

// Called from preload() in main.js
function preloadSounds() {
    whispers = loadSound('js/assets/allWhispersConcat.mp3');
    for (let i = 0; i < 15; i++){
    	instants[i] = loadSound('js/assets/instants/' + i + '.mp3');
    }
}

// Called from setup() in main.js
function audioSetup() {
	if (micOn) {
		// AUDIO SETTINGS
		const playMode = 'sustain';
		whispersDuration = whispers.duration();
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
			if (shouldPlayersBeOn === true) whisperFragment(defaultDuration, rate);
		}, whispersInterval);
		// Scheduler
		const schedulerInterval = 1;
		schedulerLoop = new p5.SoundLoop(() => {
			if(isSchedulerOn) scheduler()
		}, schedulerInterval);
	}
}

/* 
*	Real time audio handling at slower update frequency
*	Default: 20ms
*/
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
	if (isMasterFadingOut) masterFadeOut();
}

/*
*	Dynamic timeline handler
*	To be called from a loop at a very slow interval
*	Default: 1s
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
		//micOn = false;
		// START FADEOUT
		isMasterFadingOut = true;
		let chosenInstant = Math.floor(random(instants.length));
		instants[chosenInstant].play(0, 1, 0.1, 0, instants[chosenInstant].duration());
		//master.amp(0, 5, 0);
		// End is triggered n seconds after word is displayed
		theEnd = setTimeout(() => {
			console.log("End of loop, listening for the next user...");
			audioStop();
		}, afterWordDuration);
	}
	if (micOn && speechDur > whispersFadeStartTime && !whispers.isPlaying() && !whispersHaveBeenPlayed) {
		console.log("Whipers are fading in...");
		shouldPlayersBeOn = true;
		whispersPlayer.start();
		whispersHaveBeenPlayed = true;
	}
	if(isTalking && whispersFadeStartTime > 0) {
		whisperState = chooseWhisperState();
	}
	if (micOn && speechDur > continuousWhispersStartTime && !continuousWhispersTriggered) {
		console.log("Continuous whispers were triggered!")
		shouldPlayersBeOn = true;
		continuousWhispersTriggered = true;
		continuousWhispers = true;
	} else {
		continuousWhispers = false;
	}
}

/* 
*	Microphone filtering
*
*       lo must be high enough to be heard...
*       but the words must remain blurry
*                                             
*                                             lo   hi
*
*                                             |    |
*                                             V    V
*/
function micFiltering(f) {
	if (micFilteringOn){
		let cutoff = map(f, 0, filteringDur, 100, 400);
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
}

/*
*	Record pitch values in an array when talking for the first time
*	The bigger tessArray is (default is 50), the more precise it gets
*/
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

/*
*	Get average pitch (tessitura) from previously recorded values
*	Sets the tessitura global variable to 'low' 'mid' or 'hi' 
*	depending on hardcoded values
*/
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

/*
*	Init function called at the beginning of a new exp. 
*/
function audioInit() {
	stopLoops(); // FRESH START
	shouldPlayersBeOn = false;
	continuousWhispersTriggered = false;
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
	whispersGain.amp(0, 0.2, 0);
	// scheduler loop starter
	isSchedulerOn = true;
	schedulerLoop.start();
	// master volume init
	masterVolumeTarget = 1;
	masterVolume = 1;
	console.log("Scheduler started!");
}

/*
*	Stop function called at the end of the current exp. 
*/
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
	if (isSchedulerOn) schedulerLoop.stop();
}

/*
*	Master fadeout function, called when the word is displayed
*/
function masterFadeOut() {
	master.amp(masterVolume, 0.1, 0);
	if (masterVolume > 0) masterVolume -= 0.004;
	if (masterVolume < 0) isMasterFadingOut = false;
}

/*
*	Whispers granulation function,
*	To be called from a loop
*	offset depends on whisperState
*/
function whisperFragment(defaultDuration, rate) {
	switch(whisperState){
		case 0:
			offset = Math.floor(random(14));  // -> Taha
			break;
		case 1: 
			offset = Math.floor(random(26));  // -> Siyaiboue
			break;
		case 2:
			offset = Math.floor(random(37));  // -> Amine
			break;
		case 3:
			offset = Math.floor(random(54));  // -> Evelyne
			break;
		default:
			offset = Math.floor(random(14));  // -> Taha (default)
			break;
	}
	if (freq >= 70 && freq <= 580) rate = map(freq, 70, 580, 0.8, 1.7);
	whispers.play(0, rate, 1, offset, defaultDuration);
}

/*
*	Returns the whisperState depending on speechDur
*	Change these values to schedule whisperState differently :
*
*                                           |
*///                                        |
function chooseWhisperState() {//           V
	let theWhisperState = 0;
	if(speechDur > (whispersFadeStartTime + 3)) theWhisperState = 0;
	if(speechDur > (whispersFadeStartTime + 6)) theWhisperState = 1;
	if(speechDur > (whispersFadeStartTime + 9)) theWhisperState = 2;
	if(speechDur > (whispersFadeStartTime + 12)) theWhisperState = 3;
	return theWhisperState;
}