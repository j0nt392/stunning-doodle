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
  const [allReceivedNotes, setAllReceivedNotes] = useState([["C", "E", "G"]]);
  const [chord, setChord] = useState("");
  const [progression, setProgression] = useState([]);
  const [activeMidiNotes, setActiveMidiNotes] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [playedChords, setPlayedChords] = useState([]);
  const svgRef = useRef(null);
  const radius = 230;
  const [circle, setCircle] = useState();
  const [colors, setColors] = useState();
  const socket = useSocket();
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef(null);
  const scriptProcessorNodeRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const isRecordingRef = useRef(isRecording);
  const [processingAudio, setProcessingAudio] = useState(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const handleAudioData = (data) => {
    let newNotes = data.notes;
    setPlayedChords((prevChords) => {
      // Add the new chord if it's not already in the playedChords
      const newChord = JSON.stringify(newNotes);
      if (!prevChords.find((chord) => JSON.stringify(chord) === newChord)) {
        return [...prevChords, newNotes];
      }
      return prevChords;
    });
  };

  useEffect(() => {
    socket.on("audio_data", handleAudioData);
    return () => {
      socket.off("audio_data", handleAudioData);
    };
  }, [socket]);

  const handleStartRecording = () => {
    // Check if the AudioContext is already created
    if (!audioContextRef.current) {
      // Create the AudioContext inside a user-triggered function
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create a ScriptProcessorNode for real-time audio processing
      const scriptProcessorNode = audioContext.createScriptProcessor(
        4096,
        1,
        1
      );
      scriptProcessorNodeRef.current = scriptProcessorNode;

      // Add event listener for audio processing
      scriptProcessorNode.addEventListener("audioprocess", handleAudioProcess);
    }

    // Start recording
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const microphone =
          audioContextRef.current.createMediaStreamSource(stream);
        microphone.connect(scriptProcessorNodeRef.current);
        scriptProcessorNodeRef.current.connect(
          audioContextRef.current.destination
        );

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          console.log("Data available:", event.data);
          // Process the audio data here
        };

        mediaRecorder.start();
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const handleStopRecording = () => {
    console.log("Stopping recording...");
    if (mediaRecorderRef.current) {
      // Stop the media recorder
      mediaRecorderRef.current.stop();

      // Remove the event listener for audio processing
      console.log("Removing event listener for audio processing...");
      scriptProcessorNodeRef.current.removeEventListener(
        "audioprocess",
        handleAudioProcess
      );
    }
  };

  const handleRecordButtonClick = () => {
    console.log("rec" + isRecording);

    if (isRecording) {
      setIsRecording(false);
      handleStopRecording();
    } else {
      setIsRecording(true);
      handleStartRecording();
    }
  };

  const calculateRMS = (audioData) => {
    let sumOfSquares = 0;
    for (let i = 0; i < audioData.length; i++) {
      sumOfSquares += audioData[i] * audioData[i];
    }
    const meanSquare = sumOfSquares / audioData.length;
    const rms = Math.sqrt(meanSquare);
    return rms;
  };

  const handleAudioProcess = (event) => {
    // Guard clause to prevent rapid execution
    if (isRecordingRef.current && !processingAudio) {
      setProcessingAudio(true); // Set flag to indicate processing
      console.log("rec from audioprocess" + isRecordingRef.current);

      const inputData = event.inputBuffer.getChannelData(0);

      // Calculate the RMS value
      const rms = calculateRMS(inputData);

      // Set your threshold RMS value
      const thresholdRMS = 0.045; // Adjust this value as needed

      // Compare the RMS value to the threshold
      if (rms > thresholdRMS) {
        const audioArray = Array.from(inputData);
        socket.emit("audio_data", audioArray);
      }

      setTimeout(() => {
        setProcessingAudio(false); // Reset processing flag after a short delay
      }, 100); // Adjust the delay as needed
    }
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

  const [settings, setSettings] = useState({
    circleType: "Chromatic circle",
    enharmonic: false,
    dottedLines: false,
    circleColorScheme: "Rainbow",
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

  //Set circle type
  useEffect(() => {
    if (svgRef.current) {
      let newCircle;
      const circleType = settings.circleType;
      switch (circleType) {
        case "Chromatic circle":
          newCircle = new ChromaticCircle(radius);
          break;
        case "Circle of fifths":
          newCircle = new CircleOfFifths(radius);
          break;
        case "Full circle of fifths":
          newCircle = new FullCircleOfFifths(radius);
          break;
        default:
          return; // Exit if no valid circleType is matched
      }
      setCircle(newCircle);
    }
  }, [settings]); // React to changes in circleType

  //Define circle-style
  useEffect(() => {
    if (circle && svgRef.current) {
      const colors =
        settings.circleColorScheme === "monochrome"
          ? Array(12).fill("#CDD3D0")
          : [
              "#f06292", // Soft Magenta
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
            ];
      circle.setSegmentColors(colors);
      circle.draw(svgRef.current);
    }
  }, [circle, settings.circleColorScheme]);

  function renderChords(){
    if (svgRef.current) {
      if(activeMidiNotes){
        if (!settings.storeShapes && playedChords.length >= 2) {
          playedChords.splice(0, playedChords.length - 1);
        }
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
  }

  function renderModes(){
    if (svgRef.current) {
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
  }

  //Draw chord-lines
  useEffect(() => {
    if(svgRef.current && circle){
      circle.draw(svgRef.current)
    }
      renderChords()
    if(settings.key && settings.mode && settings.circleType === 'Chromatic circle'){
      renderModes()
    }
  }, [playedChords, circle, settings.key, settings.mode])



  const shiftLabelsUp = () => {
    circle.shiftLabelsUp();
    circle.draw(svgRef.current)
    renderChords()
  };
  const shiftLabelsDown = () => {
    circle.shiftLabelsDown();
    circle.draw(svgRef.current)
    renderChords()
  };

  return (
    <>
      <MidiComponent
        onDevicesChange={handleDevicesChange}
        onActiveNotesChange={handleActiveNotesChange}
      />

      <div className="flex bg-gray-800">
        <div className="">
          <Sidebar
            isRecording={isRecording}
            connectedDevices={connectedDevices}
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onCheckBoxChange={handleCheckBoxChange}
            progression={progression}
            onChordClick={handleChordClick}
          />
        </div>

        {/* <div>
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
        </div> */}

        <div className="text-gray flex flex-col justify-center items-center w-full">

          <svg
            ref={svgRef}
            width={460}
            height={460}
            viewBox="-50,0,550,460"
          ></svg>
          <div className="flex ml-2 mt-5">
          <img
            src="arrow.svg"
            onClick={() => shiftLabelsDown()}
            className="h-10 hover:cursor-pointer"
            style={{ rotate: "-90deg"}}
            />
          <img
            src="arrow.svg"
            onClick={() => shiftLabelsUp()}
            className="h-10 hover:cursor-pointer "
            style={{ rotate: "90deg"}}
            />

            </div>
        </div>
        
      </div>
    </>
  );
}

export default MainWindow;
