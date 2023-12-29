from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import subprocess
from utils import Chord_classifier, Chord_preprocessing

app = Flask(__name__)
CORS(app)
chord_classifier = Chord_classifier()
preprocessing = Chord_preprocessing()

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)

@app.route('/audio', methods=['POST'])
def receive_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file in the request"}), 400

    audio_file = request.files['audio']

    uploads_dir = 'uploads'
    os.makedirs(uploads_dir, exist_ok=True)
    file_path = os.path.join(uploads_dir, audio_file.filename)

    audio_file.save(file_path)

    # Convert the audio file to WAV using ffmpeg
    wav_path = os.path.join(uploads_dir, 'audio.wav')
    subprocess.run(['ffmpeg', '-y', '-i', file_path, wav_path])

    notes, chord = chord_classifier.predict_new_chord('uploads/audio.wav', 44100)
    chord = chord.tolist()

    data = {
        "notes": notes, 
        "chord": chord
    }

    return data, 200

if __name__ == '__main__':
    app.run(debug=True)
