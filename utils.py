import joblib
import librosa 
import numpy as np 
import sys
import os


def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_path, relative_path)

# When loading the .pkl files
chord_identifier_model_path = resource_path('chord_identifier.pkl')
label_encoder_path = resource_path('label_encoder.pkl')

class Chord_preprocessing():
    def __init__(self):
        pass

    def normalize_audio_peak(self, audio, target_level=0.5):
        peak = np.max(np.abs(audio))
        if peak > 0:
            audio = audio / peak * target_level
        return audio

    def adjust_loudness(self, audio, fs, target_rms=-15):
        # Calculate the RMS energy of the audio
        rms = np.sqrt(np.mean(audio**2))

        # Calculate the gain needed to reach the target RMS level
        gain = 10**((target_rms - 20 * np.log10(rms)) / 20)

        # Apply the gain to the audio
        adjusted_audio = audio * gain

        # Specify the output filename
        output_filename = "adjusted_audio.wav"

        # Export the adjusted audio to a WAV file
        #sf.write(output_filename, adjusted_audio, fs)

        return adjusted_audio

class Chord_classifier():
    '''Uses the chord_identifier.pkl model to classify any chord.'''
    def __init__(self):
        self.model = joblib.load('chord_identifier.pkl')
        self.label_encoder = joblib.load('label_encoder.pkl')
        self.preprocessing = Chord_preprocessing()
    
    def get_notes_for_chord(self, chord):
        '''takes a chord (C#) and gives you the triad notes in that chord'''
        chord_notes_mapping = {
            'Ab': ['Ab', 'Eb', 'C'],
            'A': ['A', 'Db', 'E'],
            'Am': ['A', 'C', 'E'],
            'B': ['B', 'Gb', 'Eb'],
            'Bb': ['Bb', 'D', 'F'],
            'Bdim': ['B', 'D', 'F'],
            'C': ['C', 'E', 'G'],
            'Cm': ['C', 'Eb', 'G'],
            'Db': ['Db', 'Ab', 'F'],
            'Dbm': ['Db', 'E', 'Ab'],
            'D': ['D', 'A', 'Gb'],
            'Dm': ['D', 'F', 'A'],
            'Eb': ['Eb', 'Bb', 'G'],
            'E': ['E', 'B', 'Ab'],
            'Em': ['E', 'G', 'B'],
            'F': ['F', 'A', 'C'],
            'Fm': ['F', 'Ab', 'C'],
            'Gb': ['Gb', 'Db', 'Bb'],
            'G': ['G', 'B', 'D'],
            'Gm': ['G', 'Bb', 'D'],
            'Bbm': ['Bb', 'Db', 'F'],
            'Bm': ['B', 'D', 'Gb'],
            'Gbm': ['Gb', 'Bb', 'Db']
            # You can continue to add more chords and their notes as needed
        }

        if chord in chord_notes_mapping:
            # Get the list of notes corresponding to the chord
            chord_notes = chord_notes_mapping[chord]
            
            # Return the first three notes from the list (or fewer if there are less than three)
            return chord_notes[:3]
        else:
            # Handle the case when the chord is not in the dictionary
            return []

    def _extract_features(self, audio_file, fs):
        audio = None
        if type(audio_file) == str:
            audio, fs = librosa.load(audio_file, sr = None)
        else:
            audio = audio_file

        audio = self.preprocessing.normalize_audio_peak(audio)
        
        #preprocessing
        harmonic, percussive = librosa.effects.hpss(audio)
        
        # Compute the constant-Q transform (CQT)
        C = librosa.cqt(y=harmonic, sr=fs, fmin=librosa.note_to_hz('C1'), hop_length=256, n_bins=36)
        
        # Convert the complex CQT output into magnitude, which represents the energy at each CQT bin
        # Summing across the time axis gives us the aggregate energy for each pitch bin
        pitch_sum = np.abs(C).sum(axis=1)
        
        return pitch_sum

    def predict_new_chord(self, audio_file_path, fs):
        # Extract features from the new audio file
        feature_vector = self._extract_features(audio_file_path, fs)
        # # Reshape the feature vector to match the model's input shape
        feature_vector = feature_vector.reshape(1, -1)
        try:
            predicted_label = self.model.predict(feature_vector)
            predicted_chord = self.label_encoder.inverse_transform(predicted_label)
            predicted_chord_notes = self.get_notes_for_chord(predicted_chord[0])
            return predicted_chord_notes, predicted_chord  
        except Exception as e:
            return "Error during prediction: %s", str(e)

    def analyze_chord_progression(self, audio_file, buffer_length=1, hop_length=0.2):
        # Load the audio file
        y, sr = librosa.load(audio_file, sr=None)
        # Calculate the number of samples per buffer
        buffer_samples = int(buffer_length * sr)
        hop_samples = int(hop_length * sr)
        chords = []
        # Start at the beginning and hop through the file
        for start in range(0, len(y), hop_samples):
            end = start + buffer_samples
            # Make sure we don't go past the end of the audio file
            if end <= len(y):
                buffer = y[start:end]
                # Predict the chord for this buffer
                chord = self.predict_new_chord(buffer, sr)
                chords.append(chord)
            else:
                break  # We've reached the end of the audio
        # Return the list of chords
        return chords