

import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({ settings, onSettingsChange, onCheckBoxChange }) {
    // State hooks to manage the visibility of each section
    const [isCircleSettingsVisible, setIsCircleSettingsVisible] = useState(true);
    const [isScalesModesVisible, setIsScalesModesVisible] = useState(true);

    // Toggle functions for each section
    const toggleCircleSettingsVisibility = () => {
        setIsCircleSettingsVisible(!isCircleSettingsVisible);
    };

    const toggleScalesModesVisibility = () => {
        setIsScalesModesVisible(!isScalesModesVisible);
    };

    const handleCheckBoxChange = (e) => {
        console.log('Checkbox checked:', e.target.checked); // Debugging line
        onCheckBoxChange(e.target.checked);
    }

    const handleCircleColorSchemeChange = (event) => {
        // Create a synthetic event with the correct target structure
        const newEvent = {
            ...event,
            target: {
                name: 'circleColorScheme', // This should match the state key in App.js
                value: event.target.value, // Get the selected value from the event
                type: event.target.type // Get the type from the event
            }
        };
        onSettingsChange(newEvent);
    }

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
                                name="store-shapes" 
                                onChange={handleCheckBoxChange}/>
                            <label htmlFor="store-shapes">Store shapes</label>
                        </div>
                        <div>
                            <input type="checkbox" 
                                id="dottedLines" 
                                name="dottedLines"
                                checked = {settings.dottedLines}
                                onChange = {onSettingsChange} />
                            <label htmlFor="dotted-lines">Dotted lines</label>
                        </div>                    
                            <label htmlFor="shape-color-scheme">Shapes</label>
                            <select id="shape-color-scheme">
                                <option>Choose color scheme</option>
                                <option value="distinct">Distinct Colors</option>
                                <option value="shaperainbow">Rainbow</option>
                                <option value="theoretic">Theoretic</option>
                            </select>
                            <label htmlFor="circle-color-scheme">Circle Color Scheme</label>
                            <select 
                                id="circleColorScheme"
                                name="circleColorScheme"
                                value={settings.circleColorScheme}
                                onChange={handleCircleColorSchemeChange}>
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
        </aside>
    );
}

export default Sidebar;
