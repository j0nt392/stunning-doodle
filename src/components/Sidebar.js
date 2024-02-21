import React, { useRef, useEffect, useState } from "react";
import LiveWaveform from "./audioplayer";

function Sidebar({
  settings,
  onSettingsChange,
  onCheckBoxChange,
  progression,
  onChordClick,
  connectedDevices,
  isRecording,
}) {
  // State hooks to manage the visibility of each section
  const [isCircleSettingsVisible, setIsCircleSettingsVisible] = useState(true);
  const [isScalesModesVisible, setIsScalesModesVisible] = useState(true);
  const [isProgressionsVisible, setIsProgressionsVisible] = useState(true);
  const [devices, setDevices] = useState(true)
  const [connectedDevice, setConnectedDevice] = useState([])
  useEffect(() => {
    setConnectedDevice(connectedDevices)
  }, [connectedDevices])

  // Toggle functions for each section
  const toggleCircleSettingsVisibility = () => {
    setIsCircleSettingsVisible(!isCircleSettingsVisible);
  };

  const toggleScalesModesVisibility = () => {
    setIsScalesModesVisible(!isScalesModesVisible);
  };

  const toggleProgressionsVisibility = () => {
    setIsProgressionsVisible(!isProgressionsVisible);
  };

  const handleCheckBoxChange = (e) => {
    onSettingsChange(e.target.name, e.target.checked);
  };

  const handleColorSchemeChange = (event) => {
    onSettingsChange(event.target.name, event.target.value);
  };

  const handleKeyChange = (event) => {
    onSettingsChange(event.target.name, event.target.value);
  };

  const handleCircleType = (event) => {
    onSettingsChange(event.target.name, event.target.value);
  };

  const handleDeviceChange = () => {
    setDevices(!devices)
  }

  const keys = [
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "Gb",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ];
  // const blackKeys = ['Ab', 'Gb', 'Eb', 'Db', 'Bb']
  const blackKeys = ["Db", "Eb", "Gb", "Ab", "Bb"];

  const renderActiveNotes = () => {
    let marginLeft = 0; // Initialize the left margin for white keys

    return keys.map((key, index) => {
      const isBlackKey = blackKeys.includes(key);
      let keyClasses = " ";
      keyClasses += isBlackKey
        ? "bg-black text-white h-[60px] w-[36px] absolute z-20 "
        : "bg-white text-black h-28 w-[72px] relative ";

      // Manually set left values for each black key
      if (isBlackKey) {
        // Distance from the left edge of the white keys container
        let leftDistance;
        switch (key) {
          case "Db":
            leftDistance = "ml-[50px]"; //Width of C white key + some offset
            break;
          case "Eb":
            leftDistance = "ml-[118px]"; // Width of D white key + some offset
            break;
          case "Gb":
            leftDistance = "ml-[252px]"; // Width of F white key + some offset
            break;
          case "Ab":
            leftDistance = "ml-[320px]"; // Width of G white key + some offset
            break;
          case "Bb":
            leftDistance = "ml-[385px]"; // Width of A white key + some offset
            break;
          default:
            leftDistance = "ml-0";
            break;
        }
        keyClasses += ` ${leftDistance}`;
      }

      return (
        <div key={key} className={keyClasses}>
          {key}
        </div>
      );
    });
  };

  return (
    <aside className="text-gray-500 gap-y-3 col-start-1 col-span-4 flex flex-col p-5 bg-gray-900 w-full h-[100%] shadow-2xl">
      <h2 className="text-gray-300" onClick={toggleCircleSettingsVisibility}>
        Settings
      </h2>
      {isCircleSettingsVisible && (
        <div className=" grid grid-cols-2 gap-3">
          <select
            id="circletype"
            name="circleType"
            value={settings.circleType}
            onChange={handleCircleType}
            className="circle-select"
          >
            <option value="Chromatic circle">Chromatic circle</option>
            <option value="Circle of fifths">Circle of fifths</option>
            <option value="Full circle of fifths">Full circle of fifths</option>
            <option value="Coltrane circle">Coltrane circle</option>
          </select>
          <div>
            <input
              type="checkbox"
              id="enharmonic"
              name="enharmonic"
              checked={settings.enharmonic}
              onChange={onSettingsChange}
            />
            <label htmlFor="enharmonic">Enharmonic</label>
          </div>
          <div>
            <input type="checkbox" id="suggest-shape" name="suggest-shape" />
            <label htmlFor="suggest-shape">Suggest shape</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="highlight-chord"
              name="highlight-chord"
            />
            <label htmlFor="highlight-chord">Highlight chord</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="store-shapes"
              name="storeShapes"
              checked={settings.storeShapes}
              onChange={handleCheckBoxChange}
            />
            <label htmlFor="store-shapes">Store shapes</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="dottedLines"
              name="dottedLines"
              className=""
              checked={settings.dottedLines}
              onChange={handleCheckBoxChange}
            />
            <label htmlFor="dotted-lines">Dotted lines</label>
          </div>
          <label htmlFor="shapeColorScheme">Chord colors</label>
          <select
            id="shapeColorScheme"
            name="shapeColorScheme"
            value={settings.shapeColorScheme}
            onChange={handleColorSchemeChange}
          >
            <option>Choose color scheme</option>
            <option value="monochrome">Default</option>
            <option value="rainbow">Rainbow</option>
          </select>
          <label htmlFor="circle-color-scheme">Circle Color</label>
          <select
            id="circleColorScheme"
            name="circleColorScheme"
            value={settings.circleColorScheme}
            onChange={handleColorSchemeChange}
          >
            <option value="rainbow">Rainbow</option>
            <option value="monochrome">Default</option>
          </select>
        </div>
      )}

      <h2
        className="collapsible-header text-gray-300"
        onClick={toggleScalesModesVisibility}
      >
        Modes
      </h2>
      {isScalesModesVisible && (
        <div className="grid grid-cols-2 gap-3">
          <select
            className="Keys"
            name="key"
            value={settings.key}
            onChange={handleKeyChange}
          >
            <option value="">--Select a key--</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="Eb">Eb</option>
            <option value="E">E</option>
            <option value="F">F</option>
            <option value="Gb">Gb</option>
            <option value="G">G</option>
            <option value="Ab">Ab</option>
            <option value="A">A</option>
            <option value="Bb">Bb</option>
            <option value="B">B</option>
          </select>
          <select
            className="Modes"
            name="mode"
            value={settings.mode}
            onChange={handleKeyChange}
          >
            <option value="">--Select a mode--</option>
            <option value="Ionian">Ionian</option>
            <option value="Dorian">Dorian</option>
            <option value="Phrygian">Phrygian</option>
            <option value="Lydian">Lydian</option>
            <option value="Mixolydian">Mixolydian</option>
            <option value="Aeolian">Aeolian</option>
            <option value="Locrian">Locrian</option>
          </select>
        </div>
      )}

      <h2
        className="collapsible-header text-gray-300 "
        onClick={toggleProgressionsVisibility}
      >
        Your chords
      </h2>
      {isProgressionsVisible && (
        <div className="bg-gray-800 h-20 rounded w-full">
          {progression.map((chord, index) => (
            <span
              key={index}
              className="progression-chord"
              onClick={() => onChordClick(chord)}
            >
              {chord}
            </span>
          ))}
        </div>
      )}
      <div className="collapsible-header text-gray-300">
        <div className="flex justify-between ">
          <h2>Devices</h2>
          <select onChange={handleDeviceChange}>
            <option value="Audio">Audio</option>
            <option value="Midi">
              Midi
            </option>
          </select>
        </div>
        
        <>
        {connectedDevice.length > 0 ? 
        connectedDevice.map((device, index) => (
          <div key={index}>
            <h5>Device Name: {device.name }</h5>
            <h5>Status: {device.state}</h5>
          </div>
        ))
        :<div>
        <h5>Device Name: No device found</h5>
        <h5>Status: Offline</h5>
      </div>
        }
        </>
      
      
      
      {!devices && (
        <>
      <div className="text-black rounded text-center flex w-full relative">
        {renderActiveNotes()}
      </div>
        </>
      )}

      {devices && (
        <>
        <LiveWaveform></LiveWaveform>
        </>
      )} 
      </div>
    </aside>
  );
}

export default Sidebar;
