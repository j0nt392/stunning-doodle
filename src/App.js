import React, { useState, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChordCircle from './components/ChordCircle';
import './App.css';

function App() {
  const mediaRecorder = useRef(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [receivedNotes, setReceivedNotes] = useState([]); // Define receivedNotes state
  const [chord, setChord] = useState("");
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
      setChord(chordName);
      setReceivedNotes(simulatedNotes); 
      console.log('Server response:', result);
    } catch (error) {
      console.error('Failed to send audio to server:', error);
    }
  };

  const [preserveLines, setPreserveLines] = useState(false);
  const handleCheckBoxChange = (isChecked) => {
    setPreserveLines(isChecked)
  }
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
    circleColorScheme: 'monochrome'
  });

  const handleSettingsChange = (event) => {
    const { name, type, checked, value } = event.target;
    setSettings(prevSettings => ({
        ...prevSettings,
        [name]: type === 'checkbox' ? checked : value
    }));console.log('Event received:', event);

};

  return (
    <div className="App">
      <Header />
      <Sidebar 
      setPreserveLines={setPreserveLines}
      settings={settings} 
      onSettingsChange={handleSettingsChange}
      onCheckBoxChange={handleCheckBoxChange} />
      <div className="main-content">
        <ChordCircle 
        settings={settings} 
        receivedNotes={receivedNotes} 
        preserveLines={preserveLines}
        dottedLines={settings.dottedLines}/>
        <label className="chord-name">{chord}</label>
        <button
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onClick={handleRecordClick}>
          {isRecording ? <i className="fas fa-stop"></i> : <i className="fas fa-microphone"></i>}
        </button>
        {/* {audioUrl && <audio src={audioUrl} controls />} */}
      </div>
    </div>
  );
}

export default App;
