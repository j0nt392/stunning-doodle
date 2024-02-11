import React, { useCallback, useState, useRef, useEffect } from "react";
// import DefaultWaveform from "./components/audioplayer";
import Sidebar from "../components/Sidebar";
import ChromaticCircle from "../components/ChromaticCircle";
import CircleOfFifths from "../components/CircleOfFifths";
import FullCircleOfFifths from "../components/FullCircleOfFifths";
import MidiComponent from "../components/midikeyboard";
import "../App.css";
import "../output.css";
import {
  startRecording,
  stopRecording,
  initializeSocketListeners,
} from "../components/AudioManager";
import { useSocket } from "../SocketContext"; // Import the hook
// At the top of your component file
const generateSessionId = () => {
  return `${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}`;
};
function MainWindow() {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const socket = useSocket();
  const [sessionId, setSessionId] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [allReceivedNotes, setAllReceivedNotes] = useState([["C", "E", "G"]]);
  const [chord, setChord] = useState("");
  const [progression, setProgression] = useState([]);
  const [activeMidiNotes, setActiveMidiNotes] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [playedChords, setPlayedChords] = useState([]);
  const svgRef = useRef(null);
  const radius = 230;
  let audioContext;
  let savedAudioUrl;
  
  // Function to initialize the AudioContext
  function initAudioContext() {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log("AudioContext initialized");
    } catch (e) {
      console.error("The Web Audio API is not supported in this browser", e);
    }
  }
  // RECORD SOUNDS And PLAY BACK
  useEffect(() => {
    const onProcessedAudio = (audioBlob) => {
      console.log("received processedaudio", audioBlob);
    };
    let currentAudioUrl = null; // Holds the current Blob URL
    // Setup to handle incoming audio for immediate playback

    socket.on("complete_recording", (completeAudio) => {
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
        currentAudioUrl = null;
      }
      const audioBlob = new Blob([completeAudio], { type: "audio/webm" });
      currentAudioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(currentAudioUrl);
      audio
        .play()
        .then(() => {
          console.log("playback started");
        })
        .catch((error) => {
          console.error("Playback failed", error);
        });
      console.log("received recording", completeAudio);
    });

    initializeSocketListeners(onProcessedAudio);
    return () => {
      socket.off("processed_audio", onProcessedAudio);
      socket.off("complete_recording");
    };
  }, []);

  const handleStartRecording = () => {
    setIsRecording(true);
    const newSessionId = generateSessionId(); // Generate a new session ID
    setSessionId(newSessionId); // Store it in the state
    const onDataAvailable = (event) => {
      if (event.data.size > 0) {
        socket.emit("audio_chunk", {
          session_id: newSessionId,
          chunk: event.data,
        });
      }
    };

    startRecording(onDataAvailable)
      .then((recorder) => {
        setMediaRecorder(recorder);
      })
      .catch((error) => console.error("Start recording error:", error));
  };

  function handleStopRecording() {
    setIsRecording(false);
    if (mediaRecorder) {
      stopRecording(mediaRecorder);
      mediaRecorder.stream.getTracks().forEach((track) => track.stop()); // Stop all stream tracks
      setMediaRecorder(null);
      socket.emit("recording_stopped", { session_id: sessionId }); // Include the session ID
    }
  }

  const handleRecordButtonClick = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      initAudioContext();
      handleStartRecording();
    }
    console.log(isRecording);
  };

  // HANDLE MIDI KEYBOARD INPUTS
  const handleDevicesChange = useCallback((connectedDevices) => {
    setConnectedDevices(connectedDevices);
  }, []); // Empty dependency array means this only gets created once

  const handleActiveNotesChange = useCallback((newNotes) => {
    // Update active notes as before
    setActiveMidiNotes(newNotes);

    // If a new chord is played (3 or more notes), add it to playedChords
    if (newNotes.length >= 3) {
      setPlayedChords((prevChords) => {
        // Add the new chord if it's not already in the playedChords
        const newChord = JSON.stringify(newNotes);
        if (!prevChords.find((chord) => JSON.stringify(chord) === newChord)) {
          return [...prevChords, newNotes];
        }
        return prevChords;
      });
    }
  }, []);

  // Function to add a new chord to the progression
  const addChordToProgression = (chordName) => {
    setProgression((prevProgression) => [...prevProgression, chordName]);
  };

  // Function to handle chord click (to highlight the chord in the circle)
  const handleChordClick = (chordName) => {
    console.log("hello");
  };

  const handleCheckBoxChange = (name, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleDrawingControls = () => {
    handleSettingsChange("isDrawing", !settings.isDrawing);
  };

  const clearShapes = () => {
    console.log("Hello");
    setPlayedChords([]);
  };

  // GLOBAL SETTINGS
  const [settings, setSettings] = useState({
    circleType: "Chromatic circle",
    enharmonic: false,
    dottedLines: false,
    circleColorScheme: "monochrome",
    storeShapes: false,
    shapeColorScheme: "monochrome",
    isDrawing: false,
    key: "",
    mode: "",
  });

  const handleSettingsChange = (name, value) => {
    setSettings((prevSettings) => {
      const newSettings = { ...prevSettings, [name]: value };
      return newSettings;
    });
  };

  // DRAWING AND Rendering THE CIRCLES
  useEffect(() => {
    console.log(mediaRecorder);
    if (svgRef.current) {
      // Choose circle
      let circle;
      const circleType = settings.circleType;
      if (circleType === "Chromatic circle") {
        circle = new ChromaticCircle(radius);
      } else if (circleType === "Circle of fifths") {
        circle = new CircleOfFifths(radius);
      } else if (circleType === "Full circle of fifths") {
        circle = new FullCircleOfFifths(radius);
      }

      // Color constants
      const colors =
        settings.circleColorScheme === "monochrome"
          ? Array(12).fill("#4A5568") // All segments black for monochrome
          : [
              "#e57373", // Soft Red
              "#ffa726", // Soft Orange
              "#ffd54f", // Soft Yellow-Orange
              "#fff176", // Soft Yellow
              "#dce775", // Soft Yellow-Green
              "#aed581", // Soft Green
              "#81c784", // Soft Green-Cyan
              "#4dd0e1", // Soft Cyan
              "#4fc3f7", // Soft Sky Blue
              "#7986cb", // Soft Blue
              "#9575cd", // Soft Violet
              "#f06292", // Soft Magenta
            ];

      circle.setSegmentColors(colors);
      circle.draw(svgRef.current);

      // Draw midi notes
      if (svgRef.current) {
        if (!settings.storeShapes && playedChords.length >= 2) {
          playedChords.shift();
        }
        playedChords.forEach((chord) => {
          if (chord.length >= 3) {
            // Ensure it's a valid chord
            circle.drawChordLines(
              svgRef.current,
              chord, // Draw the chord
              settings.dottedLines ? true : false,
              settings.shapeColorScheme,
              settings.circleType === "Chromatic circle" ||
                settings.circleType === "Circle of fifths"
                ? "big"
                : "small"
            );
          }
        });
      }

      if (settings.key && settings.mode) {
        const notes = circle.drawModes(settings.key, settings.mode);
        circle.drawChordLines(
          svgRef.current,
          notes,
          false,
          settings.shapeColorScheme,
          settings.circleType === "Chromatic circle" ||
            settings.circleType === "Circle of fifths"
            ? "big"
            : "small"
        );
      }
    }
  }, [settings, allReceivedNotes, activeMidiNotes, playedChords]);

  return (
    <>
      <MidiComponent
        onDevicesChange={handleDevicesChange}
        onActiveNotesChange={handleActiveNotesChange}
      />
      <div className="flex bg-gray-800">
        <div className="">
          <Sidebar
            connectedDevices={connectedDevices}
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onCheckBoxChange={handleCheckBoxChange}
            progression={progression}
            onChordClick={handleChordClick}
          />
        </div>

        <div>
          <div className="text-red-500 gap-y-2 flex justify-self-start p-5 flex-col">
            <button
              id="draw-btn"
              class="control-btn"
              onClick={handleDrawingControls}
            >
              <i class="fa fa-pencil-alt"></i>
            </button>
            <button id="undo-btn" class="control-btn">
              <i class="fa fa-undo"></i>
            </button>
            <button id="redo-btn" class="control-btn">
              <i class="fa fa-redo"></i>
            </button>
            <button id="delete-btn" class="control-btn" onClick={clearShapes}>
              <i class="fa fa-trash"></i>
            </button>

            <button
              className={`pt-28 ${isRecording ? "recording" : ""}`}
              onClick={handleRecordButtonClick}
            >
              {isRecording ? (
                <i className="fas fa-stop"></i>
              ) : (
                <i className="fas fa-microphone"></i>
              )}
            </button>
          </div>
        </div>

        <div className="text-gray flex justify-center items-center w-full">
          <svg
            ref={svgRef}
            width={460}
            height={460}
            viewBox="-50,0,550,460"
          ></svg>
        </div>
      </div>
    </>
  );
}

export default MainWindow;
