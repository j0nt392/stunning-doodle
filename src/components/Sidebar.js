

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
        console.log(event.target.name)
        console.log(event.target.value)
    };
    

    return (
        <aside className="sidebar">
            <div className="collapsible-section">
                <h2 className="collapsible-header" onClick={toggleCircleSettingsVisibility}>
                    Circle settings
                </h2>
                {isCircleSettingsVisible && (
                    <div className="circle-settings-grid">
                            <select className="circle-select">
                                <option value="Chromatic circle">Chromatic circle</option>
                                <option value="Circle of fifths">Circle of fifths</option>
                                <option value="Circle of fifhts(Modal substitutions)">Modal substitutions</option>
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
                    Scales and modes
                </h2>
                {isScalesModesVisible && (
                    <div className="Theory-grid">
                        <select className="Keys">
                            <option value="">--Select a key--</option>
                            <option value="Cmajor">--Cmajor--</option>
                        </select>
                        <select className="Modes">
                            <option value="">--Select a mode--</option>
                            <option value="Aeolian">--Aeolian--</option>
                            <option value="Aeolian">--Dorian--</option>
                            <option value="Aeolian">--Locrian--</option>
                            <option value="Aeolian">--Ionian--</option>
                            <option value="Aeolian">--Phrygian--</option>
                            <option value="Aeolian">--Select a mode--</option>
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
