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
let micGranulationGain = new p5.Gain();
let micGain = 10; // You may need to increase it if your microphone isn't sensitive enough
window.y; // global variable for yin (wavesjs-lfo)
let freq;
let ampThresh = 0.01;
let isTalking = false;
let speechDur = 0;
let silenceDur = 0;
let eloquence = 50; // Eloquence gauge starts at 50
let timerInterval = 250;
let hasRecorded = false;
let isRecording = false;
let theEnd = false;
let silentState = false;
<<<<<<< HEAD
let afterWordDuration = 20000;
let zeroTimerDuration = 5000;
=======
let afterWordDuration = 10000;
>>>>>>> d795baaef5eb1d406b8c370d46247d61cc403574
let chosenBufferNumber = 0;
let isSchedulerOn = false;

// Called from preload() in main.js
function preloadSounds() {
    whispers = loadSound('js/assets/whispersNorm.mp3');
}

// Called from setup() in main.js
function audioSetup() {
	if (micOn) {
		// input
		mic = new p5.AudioIn();
		mic.start();
		// output 
		master.connect();
		master.amp(1, 0.5, 0); 
		// analyzer
		fft = new p5.FFT();
		audioAnalyser();
        // Recorder
        recorder = new p5.SoundRecorder();
        recorder.setInput(mic);
        micBuffer = new p5.SoundFile();
        // Player
		whispers.disconnect();
		micBuffer.disconnect();
		granulationGain.setInput(whispers);
		granulationGain.connect(master);
		micGranulationGain.setInput(micBuffer);
		micGranulationGain.connect(master);
		playerrr();
	}
}

// Called from draw() in main.js
function audioLoop() {
}

//	Random granulation player, amplitude is controlled by mic input
function playerrr() {
	chosenBufferNumber = chooseBuffer();
	//console.log(chosenBufferNumber);
	if (chosenBufferNumber === 0 && isTalking) {
    	let offset = Math.floor(random(0, 16) * 2);
		if (freq >= 70 && freq <= 580) rate = map(freq, 70, 580, 0.8, 1.7);
		whispers.play(0, rate, 1, offset, duration); //Man rate 0.85
	} else {
		if (micBuffer && eloquence >= 75 && isTalking){
			let offset = random(0, (micBuffer.duration() - duration));
			micBuffer.play(0, 1, 1, offset, duration);
		}
	}

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
		// Start recording as soon as possible
		if (!hasRecorded && isTalking && eloquence <= 75) {
			startRecorder();
		}
		// Stop recording when user has talked enough
		if (eloquence >= 75){
			stopRecorder();
		}
		// When eloquence is at its minimum, 
		if (micOn && eloquence === 0){ 
			// Word is displayed when eloquence hit zero
			console.log("Eloquence gauge at zero, shutting down audio and displaying the word!"); 
			//Stop recorder if user didn't talk enough, and turn mic off (and whispers)
			stopRecorder();
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
				hasRecorded = false;
			}, afterWordDuration);
		}		
	}
	
	timer = setTimeout(scheduler, timerInterval);
}

// Choose whether it's one or the other buffer that will be played
// by the playerrr() function according to eloquence gauge
function chooseBuffer() {
	let bufferChoiceProbability = 1 - (eloquence / 100) + 0.7;
	let prob = constrain(bufferChoiceProbability, 0.7, 1.0);
	let bufferChoice = Math.random();
	if (bufferChoice <= prob) return 0;
	else return 1;
} 

// Start recording microphone into a buffer for later use
function startRecorder() {
	if (!isRecording) {
	    recorder.record(micBuffer);
	    isRecording = true; 
	    console.log('Recording audio...');
	    //console.log('Eloquence :' + eloquence);
	}
}

// Stop recording to be able to use the buffer with the playerrr() function
function stopRecorder() {
	if (isRecording) {		
		recorder.stop();
		isRecording = false;
		hasRecorded = true;
		console.log('Recording stopped!');
	}
}