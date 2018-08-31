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
// TEMP FIX /////////////////////////
let granulationGain2 = new p5.Gain();
/////////////////////////////////////
let micGain = 30; // You may need to increase it if your microphone isn't sensitive enough
window.y; // global variable for yin (wavesjs-lfo)
let freq;
let ampThresh = 0.05;
let isTalking = false;
let speechDur = 0;
let silenceDur = 0;
let eloquence = 50;
let timerInterval = 250;
let hasRecorded = false;
let isRecording = false;
let theEnd = false;
let silentState = false;
let afterWordDuration = 10000;
let zeroTimerDuration = 5000;
let chosenBufferNumber = 0;
let isSchedulerOn = false;

// Called from preload() in main.js
function preloadSounds() {
    whispers = loadSound('js/assets/whispers.mp3');
    // TEMP
    micSound = loadSound('js/assets/mic.mp3');
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
		// Player
		whispers.disconnect();
		// TEMP FIX
		micSound.disconnect();
		//granulationGain = new p5.Gain();
		granulationGain.setInput(whispers);
		granulationGain.connect(master);
		//TEMP FIX
		granulationGain2.setInput(micSound);
		granulationGain2.connect(master);
		playerrr();
        // Recorder
        recorder = new p5.SoundRecorder();
        recorder.setInput(mic);
        micBuffer = new p5.SoundFile();
	}
}

// Called from draw() in main.js
function audioLoop() {
	//if (micOn && !isRecording) recordr(); 
}

//	Random granulation player, amplitude is controlled by mic input
function playerrr() {
	chosenBufferNumber = chooseBuffer();
	//console.log(chosenBufferNumber);
	if (chosenBufferNumber === 0) {
    	let offset = floor(random(0, 16) * 2); 
		if (freq >= 70 && freq <= 580) rate = map(freq, 70, 580, 0.8, 1.7);
		whispers.play(0, rate, 1, offset, duration); //Man rate 0.85
	} else {
		// if (micBuffer) {
		// 	let offset = random(0, (micBuffer.duration - duration));
		// 	micBuffer.play(0, rate, 1, offset, duration);
		// }
		//TEMP FIX
		let offset = random(0, (micSound.duration() - duration));
		micSound.play(0, 1, 1, offset, duration);
	}
    let metroPlayer = setTimeout(playerrr, density);
}

// Real time audio analysis with amp and fft at slower update frequency
function audioAnalyser() {
	if (micOn){
		amp = mic.getLevel();
		granulationGain.amp(amp * micGain, 0.1, 0);
		granulationGain2.amp(amp * micGain, 0.1, 0);
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

function scheduler() {
	if(isSchedulerOn === true) {
		//console.log("Scheduler triggered");
		//console.log('isSchedulerOn?' + isSchedulerOn);
		let zeroTimer;
		if (isTalking){
			speechDur++;
			eloquence += 4; // ++ faster than --
		} else {
			silenceDur++;
			eloquence--; 
		}
		eloquence = constrain(eloquence, 0, 100);
		console.log(eloquence);
		// Is this the end ?
		if (micOn && eloquence === 0){
			//console.log("timeouts triggered"); 
			// Word is displayed n seconds after eloquence hit zero
			console.log("Eloquence gauge at zero, shutting down audio and displaying the word!"); 
			micOn = false;
			// Stop recorder if user didn't talk enough
			// if (isRecording) {
			// 	recorder.stop(); 
			// 	console.log('Recording stopped!');
			// }
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
				//recordr(); 
			}, afterWordDuration);
		}		
	}
	
	let timer = setTimeout(scheduler, timerInterval);
}


function chooseBuffer() {
	let bufferChoiceProbability = 1 - (eloquence / 100) + 0.7;
	let prob = constrain(bufferChoiceProbability, 0.7, 1.0);
	//console.log(prob);
	let bufferChoice = random();
	if (bufferChoice <= prob) return 0;
	else return 1;
} 



// Recorder : isRecording is not triggered! See audioLoop() (test prevents recodr() to be called)
function recordr() {
	// if (!hasRecorded && isTalking && eloquence <= 75) {
 //       	recorder.record(micBuffer);
 //       	hasRecorded = true;
 //       	isRecording = true; 
 //       	console.log('Recording audio...');
 //       	console.log('Eloquence :' + eloquence);
	// } 
	// if (eloquence >= 75 && hasRecorded === true) {
	// 	console.log('Recording stopped!');
	// 	recorder.stop();
	// 	isRecording = false;
	// 	console.log('Recording stopped!');
	// }
}







