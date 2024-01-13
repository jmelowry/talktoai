// Variables for recording
let mediaRecorder;
let audioChunks = [];
let finalTranscript = ''; // Store final results
let interimTranscript = ''; // Store interim results

// Variables for speech recognition
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var recognition = new SpeechRecognition();
var isRecording = false; // To track if recording is in progress

document.addEventListener('DOMContentLoaded', () => {
    listAudioDevices(); // Call this function to populate the microphone list
});

async function listAudioDevices() {
    try {
        // Request microphone access
        await navigator.mediaDevices.getUserMedia({ audio: true });

        // Then list devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputDevices = devices.filter(device => device.kind === 'audioinput');

        const select = document.getElementById('micSelect');
        let builtInMicFound = false;

        audioInputDevices.forEach(device => {
            let option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Microphone ${select.options.length + 1}`;
            select.appendChild(option);

            // Check if the device label contains 'Built-in'
            if (device.label.includes('Built-in')) {
                select.value = device.deviceId; // Set this device as selected
                builtInMicFound = true;
            }
        });

        // Fallback if no built-in microphone is found
        if (!builtInMicFound && audioInputDevices.length > 0) {
            select.value = audioInputDevices[0].deviceId;
        }
    } catch (error) {
        console.error('Error accessing media devices:', error);
        // Handle the error or inform the user as needed
    }
}

function getUserSelectedMic() {
    const select = document.getElementById('micSelect');
    return select.value;
}

// Modified startRecording to check if dictation is active
async function startRecording() {
    if (!isRecording) {
        const deviceId = getUserSelectedMic();
        let stream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: deviceId ? { exact: deviceId } : undefined }
        });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = []; // Clear any previous recording chunks

        mediaRecorder.addEventListener("dataavailable", event => {
            audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');

            fetch('http://127.0.0.1:5000/api/upload', {
                method: 'POST',
                body: formData
            })
                .then(response => response.text())
                .then(result => {
                    console.log('Success:', result);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });

        mediaRecorder.start();
    } else {
        alert("Stop dictation before starting the recording.");
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);

            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = audioUrl;
            downloadLink.download = 'recorded_audio.webm';
            downloadLink.style.display = 'block';
        };
    } else {
        console.log("Recording has not started or already stopped");
    }
}

// Speech recognition setup
var startButton = document.getElementById('start-btn');
var stopButton = document.getElementById('stop-btn');
var textArea = document.getElementById('text');

recognition.onstart = function () {
    isRecording = true;
    document.getElementById('processing-indicator').style.display = 'block';
    startButton.disabled = true; // Disable start button when dictation starts
    stopButton.disabled = false; // Enable stop button
};

recognition.onend = function () {
    isRecording = false;
    document.getElementById('processing-indicator').style.display = 'none';
    startButton.disabled = false; // Re-enable start button when dictation stops
    stopButton.disabled = true; // Disable stop button
};

recognition.onresult = function (event) {
    interimTranscript = ''; // Reset interim transcript at the start of each new result

    // Iterate through results
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
        } else {
            interimTranscript += event.results[i][0].transcript;
        }
    }

    textArea.value = finalTranscript + interimTranscript; // Display both final and interim results
};

stopButton.onclick = function () {
    recognition.stop();
};

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

recognition.onspeechend = function () {
    isRecording = false;
};

recognition.onerror = function (event) {
    console.error('Speech recognition error:', event.error);

    // Handle different types of errors
    switch (event.error) {
        case 'no-speech':
            alert("No speech was detected. Please try again.");
            break;
        case 'audio-capture':
            alert("Microphone is not available. Please check your microphone settings.");
            break;
        case 'not-allowed':
            alert("Permission to use microphone is denied. Please enable microphone access.");
            break;
        // Add more cases as needed
        default:
            alert("An error occurred: " + event.error);
    }

    isRecording = false; // Reset the recording flag
};


startButton.onclick = function () {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        recognition.start();
    } else {
        alert("Stop the recording before starting dictation.");
    }
};