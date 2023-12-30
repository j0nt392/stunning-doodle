import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './ChordCircle.css';

const getNotes = (enharmonic) => {
  return enharmonic
    ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
};

const scaleIntervals = {
  "Ionian": [2, 2, 1, 2, 2, 2, 1],      // Major scale
  "Dorian": [2, 1, 2, 2, 2, 1, 2],
  "Phrygian": [1, 2, 2, 2, 1, 2, 2],
  "Lydian": [2, 2, 2, 1, 2, 2, 1],
  "Mixolydian": [2, 2, 1, 2, 2, 1, 2],
  "Aeolian": [2, 1, 2, 2, 1, 2, 2],     // Natural minor scale
  "Locrian": [1, 2, 2, 1, 2, 2, 2]
  // You can define additional modes and their intervals here
};

const getColorForNoteIndex = (index, total, colorScheme) => {
  switch (colorScheme) {
    case 'rainbow':
      const hue = (index / total) * 360;
      return d3.hsl(hue, 1, 0.5).toString();
    case 'monochrome':
      return 'black';
    default:
      return 'black';
  }
};

function ChordCircle({ settings, receivedNotes }) {
  const svgRef = useRef(null);
  const notes = getNotes(settings.enharmonic);
  const [userChord, setUserChord] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const calculateNotePosition = (note, radiusScale = 1) => {
    const index = notes.indexOf(note);
    const angle = (index * (2 * Math.PI / notes.length)) - Math.PI / 2;
    return {
      x: (265 / 2 * radiusScale) * Math.cos(angle),
      y: (265 / 2 * radiusScale) * Math.sin(angle)
    };
  };

  const calculateScaleNotes = (rootNote, selectedMode) => {
    const intervals = scaleIntervals[selectedMode];
    const allNotes = getNotes(settings.enharmonic); // Get all notes based on enharmonic settings
    const notes = [rootNote];
    let currentNoteIndex = allNotes.findIndex(note => note === rootNote);
    
    intervals.forEach(interval => {
      currentNoteIndex += interval;
      if (currentNoteIndex >= allNotes.length) {
        currentNoteIndex -= allNotes.length;
      }
      notes.push(allNotes[currentNoteIndex]);
    });
    
    return notes;
  };
  

  const drawChords = (chordNotes, index) => {
    const svg = d3.select(svgRef.current);
    let chordGroup = svg.select(`.chord-group-${index}`);
    console.log(chordNotes);
    if (chordGroup.empty()) {
      chordGroup = svg.append('g').attr('class', `chord-group-${index}`);
      chordGroup.attr('transform', `translate(150, 150)`); // center of the svg
    }
  
    const lineGenerator = d3.line()
      .x(d => calculateNotePosition(d).x)
      .y(d => calculateNotePosition(d).y)
      .curve(d3.curveLinear);
  
    if (chordNotes && chordNotes.length > 0) {
      const closedNotes = [...chordNotes, chordNotes[0]];
      const uniqueColor = getColorForNoteIndex(index, chordNotes.length, settings.shapeColorScheme);
  
      chordGroup.append('path')
        .data([closedNotes])
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', uniqueColor)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', settings.dottedLines ? '4,4' : 'none'); // Adjusting for dotted lines
    }
  };

  const drawCustomChord = (event) => {
    setIsDrawing(true);
    const noteText = d3.select(event.target).text();
    const notelabel = d3.select(event.target);

    setUserChord(prevChord => {
      const updatedChord = [...prevChord, noteText];
      console.log(updatedChord);
      if (updatedChord.length > 2 && updatedChord[0] === updatedChord[updatedChord.length -1]) {
        drawChords(updatedChord, updatedChord.length); // Call drawChords with the new chord
        setIsDrawing(false);
        return []; // Reset the chord for new input
      }

      return updatedChord; // Update the chord with the new note
    });
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    console.log("Key:", settings.key);
    console.log("Mode:", settings.mode);

    if (!settings.storeShapes && !setIsDrawing) {
      svg.selectAll("*").remove();
    }

    if (settings.key && settings.mode){
      const scaleNotes = calculateScaleNotes(settings.key, settings.mode);
      //svg.selectAll("*").remove();
      drawChords(scaleNotes);
      console.log(scaleNotes);
    }

    const segmentGroup = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);
    notes.forEach((note, index) => {
      const position = calculateNotePosition(note);
      segmentGroup.append("text")
        .attr("x", position.x * 1.15)
        .attr("y", position.y * 1.15)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(note)
        .on("mousedown", drawCustomChord);

      const startAngle = (index * (2 * Math.PI / notes.length)) - Math.PI / 2 -50;
      const endAngle = ((index + 1) * (2 * Math.PI / notes.length)) - Math.PI / 2 -50;
      const arc = d3.arc().innerRadius(radius - 15).outerRadius(radius - 15).startAngle(startAngle).endAngle(endAngle);
      segmentGroup.append("path")
        .attr("d", arc)
        .attr("fill", "none")
        .attr("stroke", getColorForNoteIndex(index, notes.length, settings.circleColorScheme))
        .attr("stroke-width", "2");
    });

    receivedNotes.forEach((notesSet, index) => drawChords(notesSet, index));
  }, [notes, settings, receivedNotes, isDrawing]);

  return (
    <div className="chord-circle-container">
      <svg ref={svgRef} width="300" height="300" className={`chord-circle-container svg ${settings.isDrawing ? 'crosshair-cursor' : ''}`}></svg>
    </div>
  );
}

export default ChordCircle;
