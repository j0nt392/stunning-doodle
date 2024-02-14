import * as d3 from 'd3';

export default class MusicalCircle {
  constructor(radius) {
    this.radius = radius;
    this.centerX = radius; // Assuming the SVG will be twice the radius
    this.centerY = radius; // Assuming the SVG will be twice the radius
    this.segmentColors = []; // Placeholder for colors
    this.labels = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    this.minorChords = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Fm', 'Cm', 'Gm', 'Dm'];
    this.diminishedChords = ['B°', 'F#°', 'C#°', 'G#°', 'D#°', 'A#°', 'F°', 'C°', 'G°', 'D°', 'A°', 'E°'];
    this.modes = ['Locrian', 'Phrygian', 'Aeolian', 'Dorian', 'Mixolydian', 'Ionian', 'Lydian'];
  }

  setSegmentColors(colors) {
    if (colors.length === this.labels.length) {
      this.segmentColors = colors;
    } else {
      throw new Error("Segment colors array does not match label length.");
    }
  }
  
  shiftLabelsUp(){
    const lastMajorElement = this.labels.pop()
    this.labels.unshift(lastMajorElement)

    const lastMinorElement = this.minorChords.pop()
    this.minorChords.unshift(lastMinorElement)

    const lastDiminishedElement = this.diminishedChords.pop()
    this.diminishedChords.unshift(lastDiminishedElement);
  }  

  shiftLabelsDown(){
    const firstMajorElement = this.labels.shift()
    this.labels.push(firstMajorElement)

    const lastMinorElement = this.minorChords.shift()
    this.minorChords.push(lastMinorElement)

    const lastDiminishedElement = this.diminishedChords.shift()
    this.diminishedChords.push(lastDiminishedElement);
  }  

  clear(svgContainer) {
    d3.select(svgContainer).selectAll('*').remove(); // Clear previous drawing
  }

  draw(svgContainer) {
    this.clear(svgContainer); // Clear before drawing

    // Base class doesn't draw anything by default,
    // subclasses will override this method.
  }

  getNoteAngle(note) {
    const index = this.labels.indexOf(note);
    if (index === -1) {
      return null; // Note not found in the labels array
    }
    const segmentAngle = (2 * Math.PI) / this.labels.length;
    return segmentAngle * index - Math.PI / 2; // Offset by 90 degrees to start from the top
  }
  
  getColorForNoteIndex(index, total, colorScheme) {
    switch (colorScheme) {
      case 'rainbow':
        const hue = (index / total) * 360;
        console.log(hue);
        return d3.hsl(hue, 2, 2.5).toString();
      case 'monochrome':
        return '#87B1B0';
      default:
        return '#87B1B0';
    }
  }

  drawChordLines(svgContainer, chordNotes, style, shapeColorScheme, size) {
    let radius = this.radius;
    if(size === 'small'){
      radius = radius * 0.335;
    };
    const center = { x: this.centerX, y: this.centerY };
  
    // Create a group element for the chord
    const chordGroup = d3.select(svgContainer)
      .append('g')
      .attr('class', 'chord-group'); // Add a class to identify the group
  
    // Loop through the chord notes and draw lines between consecutive notes
    chordNotes.forEach((note, i) => {
      // Get the start angle for the current note
      const startAngle = this.getNoteAngle(note);
  
      // Get the end angle for the next note, wrapping around to the first note
      const nextNote = chordNotes[(i + 1) % chordNotes.length];
      const endAngle = this.getNoteAngle(nextNote);
  
      const startX = center.x + radius * Math.cos(startAngle);
      const startY = center.y + radius * Math.sin(startAngle);
      const endX = center.x + radius * Math.cos(endAngle);
      const endY = center.y + radius * Math.sin(endAngle);
      const uniqueColor = this.getColorForNoteIndex(i, chordNotes.length, shapeColorScheme);
  
      // Draw the line within the chord group
      chordGroup
        .append('line')
        .attr('x1', startX)
        .attr('y1', startY)
        .attr('x2', endX)
        .attr('y2', endY)
        .attr('stroke', uniqueColor) // or any color you wish to use
        .attr('stroke-dasharray', style ? '4,4' : 'none') // Adjusting for dotted lines
        .attr('stroke-width', 2); // adjust the width as necessary
    });
  }
  
  drawModes(key, mode){
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
    const intervals = scaleIntervals[mode];
    const allNotes = this.labels; // Get all notes based on enharmonic settings
    const notes = [key];
    let currentNoteIndex = allNotes.findIndex(note => note === key);
    
    intervals.forEach(interval => {
      currentNoteIndex += interval;
      if (currentNoteIndex >= allNotes.length) {
        currentNoteIndex -= allNotes.length;
      }
      notes.push(allNotes[currentNoteIndex]);
    });
    
    return notes
  }
}
