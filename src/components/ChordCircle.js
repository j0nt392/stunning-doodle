import React, { useState, useEffect } from 'react';
import './ChordCircle.css';

function drawChordLines(notes, receivedNotes, preserveLines, dottedLines) {
  const svg = document.querySelector(".chord-circle");
  
  console.log('drawChordLines preserveLines:', preserveLines); // Debugging line

  if (!svg) return; // Make sure the SVG element exists

  // Clear previous lines
  if (!preserveLines) {
    console.log('Clearing previous lines'); // Debugging line
    const existingLines = svg.querySelectorAll(".chord-line");
    existingLines.forEach(line => line.remove());
  }else{
    console.log('not clearing previous lines'); // Debugging line

  }
  

  // Convert note names to angle positions
  const noteAngles = notes.map((note, index) => {
    return {
      note,
      angle: (index * (360 / notes.length)) * (Math.PI / 180)
    };
  });

  // Find angles for received notes
  receivedNotes.forEach((note, i) => {
    for (let j = i + 1; j < receivedNotes.length; j++) {
      const startNote = noteAngles.find(n => n.note === note);
      const endNote = noteAngles.find(n => n.note === receivedNotes[j]);

      // Skip if the note is not found in the array
      if (!startNote || !endNote) continue;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const startX = 50 + 25 * Math.cos(startNote.angle);
      const startY = 50 + 25 * Math.sin(startNote.angle);
      const endX = 50 + 25 * Math.cos(endNote.angle);
      const endY = 50 + 25 * Math.sin(endNote.angle);
      line.setAttribute("x1", startX);
      line.setAttribute("y1", startY);
      line.setAttribute("x2", endX);
      line.setAttribute("y2", endY);
      line.setAttribute("stroke", "black");
      line.setAttribute("stroke-width", "0.1");
      line.classList.add("chord-line");
      svg.appendChild(line);
    }
  });
}

function updateLineStyle(dottedLines){
  const svg = document.querySelector(".chord-circle");
  if (!svg) return;
  const lines = svg.querySelectorAll(".chord-line");
  lines.forEach(line => {
    line.setAttribute("stroke-dasharray", dottedLines ?  "2,2" : "none")
  });
}

function ChordCircle({ settings, receivedNotes, preserveLines }) {
  const getNotes = (enharmonic) => {
    return enharmonic
      ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  };
  
  const [notes, setNotes] = useState(getNotes(settings.enharmonic));
  const circleClass = settings.circleColorScheme === 'rainbow' ? 'rainbow-stroke' : 'default-stroke';
  console.log(circleClass); // Add this line in ChordCircle.js

  useEffect(() => {
    setNotes(getNotes(settings.enharmonic));
  }, [settings.enharmonic]);

  useEffect(() => {
    drawChordLines(notes, receivedNotes, preserveLines, settings.dottedLines);
    updateLineStyle(settings.dottedLines);
  }, [notes, receivedNotes, preserveLines, settings.dottedLines]);

  const calculatePosition = (index, arrayLength, circleRadius) => {
    const angle = (index * (360 / arrayLength)) * (Math.PI / 180);
    const x = 50 + (circleRadius * Math.cos(angle));
    const y = 50 + (circleRadius * Math.sin(angle));
    return { x, y };
  };

  return (
    <svg className="chord-circle" viewBox="0 0 100 100">
      <defs>
      <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="red" />
        <stop offset="16%" stop-color="orange" />
        <stop offset="33%" stop-color="yellow" />
        <stop offset="50%" stop-color="green" />
        <stop offset="66%" stop-color="blue" />
        <stop offset="83%" stop-color="indigo" />
        <stop offset="100%" stop-color="violet" />
      </linearGradient>
      </defs>
      <circle 
        cx="50" 
        cy="50" 
        r="25"
        className={circleClass} 
        strokeWidth="0.3" 
        fill="none" />
      {notes.map((note, index) => {
        const position = calculatePosition(index, notes.length, 29);
        return (
          <text key={note} x={position.x} y={position.y}
            textAnchor="middle" alignmentBaseline="central"
            className="note-label">
            {note}
          </text>
        );
      })}
    </svg>
  );
}

export default ChordCircle;
