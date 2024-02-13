from flask import Flask, request
from flask_socketio import SocketIO, emit
import os
from utils import Chord_classifier, Chord_preprocessing
import io
import subprocess
from pydub import AudioSegment
import soundfile as sf


def load_wav_from_bytes(wav_bytes):
    # Convert bytes to a buffer
    buffer = io.BytesIO(wav_bytes)
    
    # Read the buffer with soundfile
    data, samplerate = sf.read(buffer)
    
    # Now `data` is a NumPy array that you can use with librosa
    return data, samplerate

# Assuming `audio_bytes` is the variable holding the bytes from the client
def convert_audio_bytes_to_wav_bytes(audio_bytes):
    # Load the audio bytes into pydub (this example assumes WebM format)
    audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="webm")
    
    # Export the audio segment to WAV format in memory
    buffer = io.BytesIO()
    audio_segment.export(buffer, format="wav")
    wav_bytes = buffer.getvalue()
    
    return wav_bytes


app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")
chord_classifier = Chord_classifier()
preprocessing = Chord_preprocessing()

AUDIO_SAVE_PATH = 'saved_audio'
if not os.path.exists(AUDIO_SAVE_PATH):
    os.makedirs(AUDIO_SAVE_PATH)

audio_sessions = {}  # Dict to hold audio chunks by session ID

@socketio.on('audio_data')
def handle_audio_chunk(data):
    print(data)
    notes, chord = chord_classifier.predict_new_chord(data, 44100)
    chord = chord.tolist()

    response = {
        "notes": notes, 
        "chord": chord
    }

    emit('audio_data', response)

@socketio.on('recording_stopped')
def handle_recording_stopped(data):
    session_id = data['session_id']
    print(f"Stopping recording for session {session_id}")  # Debugging print
    if session_id in audio_sessions:
        combined_audio = b''.join(audio_sessions[session_id])
        
        # Example integration
        # audio_bytes = combined_audio  # This is your own function to get audio bytes
        # wav_bytes = convert_audio_bytes_to_wav_bytes(audio_bytes)
        # audio_data, fs = load_wav_from_bytes(wav_bytes)

        # # Use your ML model for prediction
        # notes, chord = chord_classifier.predict_new_chord(audio_data, fs)
                
        # response_data = {
        #     "notes": notes, 
        #     "chord": chord,
        #     "audio": combined_audio
        # }
        socketio.emit('complete_recording', combined_audio)
        del audio_sessions[session_id]
    else:
        print(f"Session ID {session_id} not found!")  # Debugging print to identify the issue

