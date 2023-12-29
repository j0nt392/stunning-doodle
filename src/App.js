import React, { useState, useRef } from 'react';
import DefaultWaveform from './components/audioplayer';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChordCircle from './components/ChordCircle';
import './App.css';

function App() {
  const mediaRecorder = useRef(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [allReceivedNotes, setAllReceivedNotes] = useState([]);
  const [chord, setChord] = useState("");
  const [progression, setProgression] = useState([]);
  const [audioUrl, setAudioUrl] = useState(); // URL of the audio file
  const [isDrawing, setIsDrawing] = useState(false);

  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await fetch('http://localhost:5000/audio', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }
      const result = await response.json();
      // Simulate received notes (replace with actual data from server)
      const simulatedNotes = result.notes; // Replace with actual received notes
      const chordName = result.chord;
      addChordToProgression(chordName);

      if (settings.storeShapes) {
        setAllReceivedNotes(prevNotes => [...prevNotes, simulatedNotes]);
      } else {
        setAllReceivedNotes([simulatedNotes]);
      }

      setChord(chordName);
      
      console.log('Server response:', result);
    } catch (error) {
      console.error('Failed to send audio to server:', error);
    }
  };
  
  // Function to add a new chord to the progression
  const addChordToProgression = (chordName) => {
    setProgression(prevProgression => [...prevProgression, chordName]);
  };

  // Function to handle chord click (to highlight the chord in the circle)
  const handleChordClick = (chordName) => {
    // Logic to highlight the chord in the circle
    console.log(`Chord clicked: ${chordName}`);
    // You can add the logic to highlight the chord here
  };

  const handleCheckBoxChange = (name, value) => {
    setSettings(prevSettings => ({
        ...prevSettings,
        [name]: value,
    }));
  };
  const handleDrawingControls = () => {
    handleSettingsChange('isDrawing', !settings.isDrawing);
    console.log(settings.isDrawing);
  };

  const handleRecordClick = async () => {
    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      setAudioChunks([]);

      mediaRecorder.current.ondataavailable = event => {
        setAudioChunks(prev => [...prev, event.data]);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }

        setAudioUrl(url);

        await sendAudioToServer(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } else {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const [settings, setSettings] = useState({
    circleType: 'chromatic circle',
    enharmonic: false,
    dottedLines: false,
    circleColorScheme: 'monochrome',
    storeShapes: false,
    shapeColorScheme: 'monochrome',
    isDrawing: false
  });

  const handleSettingsChange = (name, value) => {
    setSettings(prevSettings => {
        const newSettings = { ...prevSettings, [name]: value };
        console.log("New settings:", newSettings); // Debugging line
        return newSettings;
    });
};

  return (
    <div className="App">
      <Header />
      <Sidebar 
      settings={settings} 
      onSettingsChange={handleSettingsChange} 
      onCheckBoxChange={handleCheckBoxChange} 
      progression={progression}
      onChordClick={handleChordClick} />
      <div className="main-content">
        <div class="drawing-controls">
          <button 
            id="draw-btn" 
            class="control-btn"
            onClick={handleDrawingControls}
            >
              <i class="fa fa-pencil-alt"></i>
            </button>
          <button id="undo-btn" class="control-btn"><i class="fa fa-undo"></i></button>
          <button id="redo-btn" class="control-btn"><i class="fa fa-redo"></i></button>
          <button id="delete-btn" class="control-btn"><i class="fa fa-trash"></i></button>
        </div>
        <ChordCircle 
        settings={settings} 
        receivedNotes={allReceivedNotes} 
        dottedLines={settings.dottedLines}/>
        <label className="chord-name">{chord}</label>
        <div className="bottom-container" style={{ width: '100%', height: '150px', backgroundColor: '#f3f3f3' }}>
        <button
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onClick={handleRecordClick}>
          {isRecording ? <i className="fas fa-stop"></i> : <i className="fas fa-microphone"></i>}
        </button>
        <div className="wavesurfer">
          <DefaultWaveform  audioUrl={audioUrl}/>
        </div>
        </div>
      </div>
    </div>
  );
}

export default App;
