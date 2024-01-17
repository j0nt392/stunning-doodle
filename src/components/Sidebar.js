

import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({ settings, onSettingsChange, onCheckBoxChange, progression, onChordClick  }) {
    // State hooks to manage the visibility of each section
    const [isCircleSettingsVisible, setIsCircleSettingsVisible] = useState(true);
    const [isScalesModesVisible, setIsScalesModesVisible] = useState(true);
    const [isProgressionsVisible, setIsProgressionsVisible] = useState(true);

    // Toggle functions for each section
    const toggleCircleSettingsVisibility = () => {
        setIsCircleSettingsVisible(!isCircleSettingsVisible);
    };

    const toggleScalesModesVisibility = () => {
        setIsScalesModesVisible(!isScalesModesVisible);
    };

    const toggleProgressionsVisibility = () => {
        setIsProgressionsVisible(!isProgressionsVisible)
    }

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
    }

    return (
        <aside className="sidebar">
            <div className="collapsible-section">
                <h2 className="collapsible-header" onClick={toggleCircleSettingsVisibility}>
                    Settings
                </h2>
                {isCircleSettingsVisible && (
                    <div className="circle-settings-grid">
                            <select 
                                id="circletype"
                                name="circleType"
                                value={settings.circleType}
                                onChange={handleCircleType}
                                className="circle-select">
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
                            <input type="checkbox" id="highlight-chord" name="highlight-chord" />
                            <label htmlFor="highlight-chord">Highlight chord</label>
                        </div>
                        <div>
                            <input 
                                type="checkbox" 
                                id="store-shapes" 
                                name="storeShapes" 
                                checked = {settings.storeShapes}
                                onChange={handleCheckBoxChange}/>
                            <label htmlFor="store-shapes">Store shapes</label>
                        </div>
                        <div>
                            <input type="checkbox" 
                                id="dottedLines" 
                                name="dottedLines"
                                checked = {settings.dottedLines}
                                onChange = {handleCheckBoxChange} />
                            <label htmlFor="dotted-lines">Dotted lines</label>
                        </div>                    
                            <label htmlFor="shapeColorScheme">Chord colors</label>
                            <select id="shapeColorScheme"
                                    name="shapeColorScheme"
                                    value={settings.shapeColorScheme}
                                    onChange={handleColorSchemeChange}>
                                <option>Choose color scheme</option>
                                <option value="monochrome">Monochrome</option>
                                <option value="rainbow">Rainbow</option>
                                <option value="theoretic">Theoretic</option>
                            </select>
                            <label htmlFor="circle-color-scheme">Circle Color</label>
                            <select 
                                id="circleColorScheme"
                                name="circleColorScheme"
                                value={settings.circleColorScheme }
                                onChange={handleColorSchemeChange}>
                                <option value="monochrome">Monochrome</option>
                                <option value="rainbow">Rainbow</option>
                                <option value="theoretic">Theoretic</option>
                            </select>
                        </div>
                    )}
            </div>

            <div className="collapsible-section">
                <h2 className="collapsible-header" onClick={toggleScalesModesVisibility}>
                    Modes
                </h2>
                {isScalesModesVisible && (
                    <div className="Theory-grid">
                        <select 
                            className="Keys"
                            name="key"
                            value={settings.key}
                            onChange={handleKeyChange}>
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
                            onChange={handleKeyChange}>
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
            </div>

            <div className="collapsible-section">
                <h2 className="collapsible-header" onClick={toggleProgressionsVisibility}>
                    Your chords
                </h2>
                {isProgressionsVisible && (
                <div className="progression-container">
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
            </div>
            <div className="collapsible-section">
                <h2 className="collabsible-header">
                    Tutorial
                </h2>
                <div className="tutorial-container">
                    <span>
                    </span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
