from flask import Flask, render_template, request
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

# @app.route('/api/upload', methods=['POST'])
# def save_audio():
#     # Get the audio file from the request
#     audio_file = request.files['file']
    
#     # Use a secure version of the file's original name
#     filename = secure_filename(audio_file.filename)
    
#     # Save the file to a local directory
#     audio_file.save(os.path.join('/Users/jamie/github.com/talktoai/talktoai/tmp', filename))
    
#     return 'File saved successfully'

if __name__ == '__main__':
    app.run(port=5000, debug=True)