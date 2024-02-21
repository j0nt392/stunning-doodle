import React from 'react';
import { useEffect, useState } from 'react';

const MidiComponent = ({ onActiveNotesChange, onDevicesChange  }) => {
    const [activeNotes, setActiveNotes] = useState([]);
    const [connectedDevices, setConnectedDevices] = useState( new Map());
    // Function to get note name from MIDI note number
    const getNoteName = (noteNumber) => {
        const noteNames = [
            'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
        ];
        const noteIndex = noteNumber % 12;
        const noteName = noteNames[noteIndex];
        return noteName; // Return only the note name without the octave
    };
    

    // Function to handle incoming MIDI messages
    const onMIDIMessage = (message) => {
        const [command, noteNumber, velocity] = message.data;

        // Check if it's a "note on" message with a velocity > 0
        if (command === 144 && velocity > 0) { // Note on
            setActiveNotes((prevNotes) => {
                const noteName = getNoteName(noteNumber); // This should be just 'C', 'D', etc.
                // Ensure uniqueness when adding the new noteName
                const newNotes = Array.from(new Set([...prevNotes, noteName]));
                onActiveNotesChange(newNotes); // Notify parent component
                return newNotes;
            });
        } else if (command === 128 || (command === 144 && velocity === 0)) {
            setActiveNotes((prevNotes) => {
                const noteName = getNoteName(noteNumber);
                const newNotes = prevNotes.filter((activeNote) => activeNote !== noteName);
                //console.log('Notes currently playing:', newNotes);
                onActiveNotesChange(newNotes);  // Notify parent component
                return newNotes;
            });
        }
    };

    useEffect(() => {
        // Function to handle MIDI device connection
        const onMIDISuccess = (midiAccess) => {
            //console.log('MIDI Access Object', midiAccess);

            // Listen to connected MIDI input devices
            const inputs = midiAccess.inputs.values();
            for (let input of inputs) {
                input.onmidimessage = onMIDIMessage;
            }

            // Also listen for state changes in MIDI device connections
            midiAccess.onstatechange = (e) => {
                console.log(`State change on port ${e.port.name}`);
                if (e.port.state === 'connected' && e.port.type === 'input') {
                    e.port.onmidimessage = onMIDIMessage;
                }
                updateDevices(midiAccess);
            };
        };

        // Function to handle errors in getting MIDI access
        const onMIDIFailure = () => {
            console.log('Could not access your MIDI devices.');
        };

        // Request MIDI access
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
        } else {
            console.log('Web MIDI API not supported in this browser.');
        }
        const updateDevices = (midiAccess) => {
            const devices = new Map();
            midiAccess.inputs.forEach((input) => {
                devices.set(input.id, { name: input.name, state: input.state });
            });
            
            // Convert the Maps to arrays for easy comparison
            const newDevicesArray = Array.from(devices.values());
            const currentDevicesArray = Array.from(connectedDevices.values());
        
            // Check if the devices have actually changed
            if (JSON.stringify(newDevicesArray) !== JSON.stringify(currentDevicesArray)) {
                setConnectedDevices(devices); // Update state only if devices have changed
                onDevicesChange(newDevicesArray); // Notify parent component
            }
        };
    }, [onDevicesChange]);

    return
};

export default MidiComponent;