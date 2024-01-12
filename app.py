from flask import Flask, render_template, request
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/audio', methods=['POST'])
def transcribe_audio():
    # Get the audio data from the request
    audio_data = request.get_data()

    # Make a call to the OpenAI Whisper API (you'll need to implement this)
    response = call_whisper_api(audio_data)

    # Return the transcribed text
    return response.text

def call_whisper_api(audio_data):
    # Make a POST request to the Whisper API with the audio data
    response = requests.post('https://api.openai.com/v1/whisper/asr', data=audio_data, headers={
        'Content-Type': 'audio/x-flac',
        'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
    })

    # Return the response
    return response

@app.route('/api/upload', methods=['POST'])
def save_audio():
    # Get the audio file from the request
    audio_file = request.files['file']
    
    # Use a secure version of the file's original name
    filename = secure_filename(audio_file.filename)
    
    # Save the file to a local directory
    audio_file.save(os.path.join('/Users/jamie/github.com/talktoai/talktoai/tmp', filename))
    
    return 'File saved successfully'

if __name__ == '__main__':
    app.run(port=5000)