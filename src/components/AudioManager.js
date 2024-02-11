// audioManager.js
import io from 'socket.io-client';
const socket = io('http://localhost:5000');

const startRecording = (onDataAvailable) => {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = onDataAvailable;
        mediaRecorder.start(2000); // Adjust timeSlice as needed
        resolve(mediaRecorder); // Resolve the promise with the MediaRecorder instance
      })
      .catch(error => {
        console.error('MediaRecorder start error:', error);
        reject(error); // Reject the promise if getUserMedia fails
      });
  });
};

const stopRecording = (mediaRecorder) => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop(); // Stops recording
    console.log('Recording stopped');
  } else {
    console.error('Attempted to stop recording, but MediaRecorder was not active.');
  }
};

const initializeSocketListeners = (onProcessedAudio) => {
  socket.on('processed_audio', onProcessedAudio);
};

export { startRecording, stopRecording, initializeSocketListeners };




























// const sendAudioToServer = async (audioBlob) => {
//     const formData = new FormData();
//     formData.append("audio", audioBlob, "recording.webm");

//     try {
//       const response = await fetch("https://16.171.170.11/audio", {
//         method: "POST",
//         body: formData,
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP error status: ${response.status}`);
//       }
//       const result = await response.json();
//       // Simulate received notes (replace with actual data from server)
//       const simulatedNotes = result.notes; // Replace with actual received notes
//       const chordName = result.chord;
//       addChordToProgression(chordName);

//       if (settings.storeShapes) {
//         setAllReceivedNotes((prevNotes) => [...prevNotes, simulatedNotes]);
//       } else {
//         setAllReceivedNotes([simulatedNotes]);
//       }

//       setChord(chordName);
//     } catch (error) {
//       console.error("Failed to send audio to server:", error);
//     }
//   };

//   const handleRecordClick = async () => {
//     if (!isRecording) {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorder.current = new MediaRecorder(stream);
//       setAudioChunks([]);

//       mediaRecorder.current.ondataavailable = (event) => {
//         setAudioChunks((prev) => [...prev, event.data]);
//       };

//       mediaRecorder.current.onstop = async () => {
//         const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
//         const url = URL.createObjectURL(audioBlob);

//         if (audioUrl) {
//           URL.revokeObjectURL(audioUrl);
//         }

//         setAudioUrl(url);

//         await sendAudioToServer(audioBlob);
//       };

//       mediaRecorder.current.start();
//       setIsRecording(true);
//     } else {
//       mediaRecorder.current.stop();
//       setIsRecording(false);
//     }
//   };