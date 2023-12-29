import React, { useState, useEffect, useRef } from 'react';
import {select, mouse} from 'd3';
import * as d3 from 'd3';
import './ChordCircle.css';

const getNotes = (enharmonic) => {
  return enharmonic
    ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
};

// Updated function to use the new circle color setting
const getColorForNoteIndex = (index, total, colorScheme) => {
  switch (colorScheme) {
    case 'rainbow':
      const hue = (index / total) * 360 ;
      return d3.hsl(hue, 1, 0.5).toString();

    case 'monochrome':
      return 'black'; // or any default color for monochrome

    default:
      return 'black'; // Fallback color
  }
};

function ChordCircle({ settings, receivedNotes }) {
  const svgRef = useRef(null);
  // const [notes, setNotes] = useState([]);
  const notes = getNotes(settings.enharmonic);
  const [userChords, setUserChords] = useState([]);
  const [userChordsIndex, setUserChordsIndex] = useState(0);

  const drawChords = (chordNotes, index) => {
      const svg = d3.select(svgRef.current);
      const width = 300;
      const height = 300;
      const radius = Math.min(width, height) / 2;
      const chordGroups = receivedNotes.map((_,index) => `chord-group-${index}`);
      let colorScale;
      if (settings.shapeColorScheme === 'rainbow') {
        colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(receivedNotes.map((_, index) => index));
      } else {
        colorScale = () => 'black'; // Default color for other options
      }

      // Function to update the line styles
      const updateLineStyles = () => {
        svg.selectAll('[class^="chord-group-"] path')
          .attr('stroke-dasharray', settings.dottedLines ? '4 4' : 'none');
      };

            // Clear the SVG content only when 'storeShapes' is false
      if (!settings.storeShapes) {
        svg.selectAll("*").remove();
      }
      updateLineStyles();

      // Function to calculate the position of each note on the circle's circumference
      const calculateNotePosition = (note, radiusScale = 1) => {
        const index = notes.indexOf(note);
        const angle = (index * (2 * Math.PI / notes.length)) - Math.PI / 2;
        return {
          x: (radius * radiusScale) * Math.cos(angle),
          y: (radius * radiusScale) * Math.sin(angle)
        };
      };

      // Create a separate group for each chord if not exists.
      let chordGroup = svg.select(`.chord-group-${index}`);
      if (chordGroup.empty()) {
        chordGroup = svg.append('g').attr('class', `chord-group-${index}`);
        chordGroup.attr('transform', `translate(${width / 2}, ${height / 2})`);
      }

      // Define the line generator with a scaled radius
      const lineGenerator = d3.line()
        .x(d => calculateNotePosition(d, 0.90).x) // Use a scale factor less than 1
        .y(d => calculateNotePosition(d, 0.90).y); // to keep the chord lines inside the circle

      if (chordNotes && chordNotes.length > 0) {
        // Close the path by connecting the last note to the first
        const closedNotes = [...chordNotes, chordNotes[0]];
        //Assign a unique color from the color scale
        const uniqueColor = colorScale(index); // Get color from colorScale
        // Create a separate path for each chord shape
        const path = chordGroup.append('path')
          .data([closedNotes])
          .attr('d', lineGenerator)
          .attr('class', `chord-line chord-group-${index}`)
          .attr('fill', 'none') //put for example unique here to fill in the shapes. 
          .attr('stroke', uniqueColor)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', settings.dottedLines ? '4 4' : '')
          .on('mouseover', function() {
            d3.select(this).attr('stroke', 'blue').raise();
            })
          .on('mouseout', function() {
            d3.select(this).attr('stroke', uniqueColor)
          });
      }
  };

  useEffect(() => {
    if (userChords.length > 0) {
      // Here, you might want to use a different index or logic to differentiate
      // user chords from received chords.
      drawChords(userChords, userChordsIndex);
    }
  }, [userChords, userChordsIndex]);

  // useEffect(() => {
  //   setNotes(getNotes(settings.enharmonic));
  // }, [settings.enharmonic]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    const chordGroups = receivedNotes.map((_,index) => `chord-group-${index}`);
    let colorScale;
    if (settings.shapeColorScheme === 'rainbow') {
      colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(receivedNotes.map((_, index) => index));
    } else {
      colorScale = () => 'black'; // Default color for other options
    }

    // Function to update the line styles
    const updateLineStyles = () => {
      svg.selectAll('[class^="chord-group-"] path')
        .attr('stroke-dasharray', settings.dottedLines ? '4 4' : 'none');
    };

    // Clear the SVG content only when 'storeShapes' is false
    if (!settings.storeShapes) {
      svg.selectAll("*").remove();
    }
    updateLineStyles();

    // Function to calculate the position of each note on the circle's circumference
    const calculateNotePosition = (note, radiusScale = 1) => {
      const index = notes.indexOf(note);
      const angle = (index * (2 * Math.PI / notes.length)) - Math.PI / 2;
      return {
        x: (radius * radiusScale) * Math.cos(angle),
        y: (radius * radiusScale) * Math.sin(angle)
      };
    };

    function drawLine(event) {
      // Get the clicked text element and its note text
      const textElement = d3.select(event.target);
      const noteText = textElement.text();
    
      // Log the clicked note for debugging
      console.log("Clicked note:", noteText);
    
      // Change the color of the clicked note
      textElement.style("fill", "red");
    
      // For now, let's just log the note and not worry about state updates
      // You can later add logic to manage the user chords
    }

    function isChordComplete(chords) {
      // Return true if the length of the chords array is 3
      // indicating that three notes have been selected, completing a chord
      if (chords.length === 3) {
        console.log(chords.length);
        return true;
      }
    
      // You can add more conditions here if needed
    
      // Return false if the chord is not complete
      return false;
    }
    
    // Draw lines for each set of received notes
    receivedNotes.forEach((receivedNotesSet, index) => {

      // Create a separate group for each chord if not exists.
      let chordGroup = svg.select(`.chord-group-${index}`);
      if (chordGroup.empty()) {
        chordGroup = svg.append('g').attr('class', `chord-group-${index}`);
        chordGroup.attr('transform', `translate(${width / 2}, ${height / 2})`);
      }

      // Define the line generator with a scaled radius
      const lineGenerator = d3.line()
        .x(d => calculateNotePosition(d, 0.90).x) // Use a scale factor less than 1
        .y(d => calculateNotePosition(d, 0.90).y); // to keep the chord lines inside the circle

      if (receivedNotesSet && receivedNotesSet.length > 0) {
        // Close the path by connecting the last note to the first
        const closedNotes = [...receivedNotesSet, receivedNotesSet[0]];
        //Assign a unique color from the color scale
        const uniqueColor = colorScale(index); // Get color from colorScale
        // Create a separate path for each chord shape
        const path = chordGroup.append('path')
          .data([closedNotes])
          .attr('d', lineGenerator)
          .attr('class', `chord-line chord-group-${index}`)
          .attr('fill', 'none') //put for example unique here to fill in the shapes. 
          .attr('stroke', uniqueColor)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', settings.dottedLines ? '4 4' : '')
          .on('mouseover', function() {
            d3.select(this).attr('stroke', 'blue').raise();
            })
          .on('mouseout', function() {
            d3.select(this).attr('stroke', uniqueColor)
          });
      }
    });

    // Draw the circle's segments and labels
    const segmentGroup = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);
    notes.forEach((note, index) => {
      const position = calculateNotePosition(note);
      segmentGroup.append("text")
        .attr("x", position.x)
        .attr("y", position.y)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(note)
        .on("mousedown", drawLine);

      const startAngle = (index * (2 * Math.PI / notes.length)) - Math.PI / 2 - 50;
      const endAngle = ((index + 1) * (2 * Math.PI / notes.length)) - Math.PI / 2 - 50;
      const arc = d3.arc().innerRadius(radius - 15).outerRadius(radius - 15).startAngle(startAngle).endAngle(endAngle);
      segmentGroup.append("path")
        .attr("d", arc)
        .attr("fill", "none")
        .attr("stroke", getColorForNoteIndex(index, notes.length, settings.circleColorScheme))
        .attr("stroke-width", "2")
        .on('mousedown', drawLine);
    });

  }, [notes, settings, receivedNotes]);

  return (
    <div className="chord-circle-container">
      <svg 
      className={`chord-circle-container svg ${settings.isDrawing ? 'crosshair-cursor' : ''}`}
      ref={svgRef} 
      width="300" 
      height="300" />
    </div>
  );
}

export default ChordCircle;