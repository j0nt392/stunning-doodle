import MusicalCircle  from './MusicalCircle';
import * as d3 from 'd3';

export default class FullCircleOfFifths extends MusicalCircle {
  constructor(radius) {
    super(radius);
    // Define the arrays for each circle
    this.majorChords = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
    this.minorChords = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Fm', 'Cm', 'Gm', 'Dm'];
    this.diminishedChords = ['B°', 'F#°', 'C#°', 'G#°', 'D#°', 'A#°', 'F°', 'C°', 'G°', 'D°', 'A°', 'E°'];
    this.modes = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian'];
    this.innerRadius = this.radius * 0.5;
  }

  draw(svgContainer) {
    super.clear(svgContainer);

    // Calculate radii for each circle
    const outerRadius = this.radius;
    const middleRadius = this.radius * 0.75;
    const innerRadius = this.radius * 0.5;

    // Draw the circles
    this.drawCircle(svgContainer, middleRadius, this.minorChords, "minor");
    this.drawCircle(svgContainer, outerRadius, this.diminishedChords, "diminished");
    this.drawCircle(svgContainer, innerRadius, this.majorChords, "major");
    
    // Draw the mode labels around the edge
    this.drawLabels(svgContainer, outerRadius + 20, this.modes, "modes");
    this.highlightArcs(svgContainer, this.radius, [1, 3], "major");
    this.highlightArcs(svgContainer, this.radius * 0.5, [1,2,3], "diminished");
    this.highlightArcs(svgContainer, this.radius * 1.28, [2], "major");

    // Highlight the key of C (or any other key, depending on the input)
    //this.highlightKey(svgContainer, 'C', outerRadius, middleRadius, innerRadius);
  }

  drawCircle(svgContainer, radius, labels, className) {
    const segmentAngle = (2 * Math.PI) / labels.length;
    // Define which indices should be red for each class
    const redIndices = {
        major: [11, 2], // Indices for 'F', 'C', 'G' in the major circle
        diminished: [0, 1],
        minor: [11, 2] // Indices for 'E°', 'F#°' in the diminished circle
        // Add other classes and their red indices if needed
    };
    // Draw the outer ring for the circle
    d3.select(svgContainer)
      .append('circle')
      .attr('cx', this.centerX)
      .attr('cy', this.centerY)
      .attr('r', radius)
      .attr('fill', 'none');
      

    // Draw segments and lines
    labels.forEach((label, index) => {
      const angleStart = segmentAngle * index + 350;
      const angleEnd = segmentAngle * (index + 1) + 350;
      
      // Create an arc generator for the segments
      const arc = d3.arc()
        .innerRadius(radius) // Adjust for the thickness of your segment
        .outerRadius(radius)
        .startAngle(angleStart)
        .endAngle(angleEnd);
  
      // Draw the arc segment
      d3.select(svgContainer)
        .append('path')
        .attr('d', arc)
        .attr('transform', `translate(${this.centerX}, ${this.centerY})`)
        .attr('stroke', this.segmentColors[index]) // Use the color for this segment's stroke
        .attr('fill', 'none');

    // Draw the lines that separate the notes
    // Modify the factor (0.8, for example) to adjust how far the lines go towards the edge
    const lineOuterX = this.centerX + radius * Math.cos(angleStart);
    const lineOuterY = this.centerY + radius * Math.sin(angleStart);
    let lineInnerX = this.centerX + radius * (1.28) * Math.cos(angleStart); // Increase this factor to make lines shorter
    let lineInnerY = this.centerY + radius * (1.28) * Math.sin(angleStart); // Increase this factor to make lines shorter
    
    if (className === 'major') {
        lineInnerX = this.centerX + radius * (2) * Math.cos(angleStart); // Increase this factor to make lines shorter
        lineInnerY = this.centerY + radius * (2) * Math.sin(angleStart); // Increase this factor to make lines shorter
    };
    d3.select(svgContainer)
    .append('line')
    .attr('x1', lineOuterX)
    .attr('y1', lineOuterY)
    .attr('x2', lineInnerX)
    .attr('y2', lineInnerY)
    .attr('stroke', redIndices[className] && redIndices[className].includes(index) ? 'black' : 'black')
    // Use red for highlighted indices, black for others
    .attr('stroke-width', redIndices[className] && redIndices[className].includes(index) ? 3 : 1); // Change this as needed for the line thickness

    // Calculate label positioning
    const labelRadius = radius + 15; // Adjust as necessary
    const labelAngle = angleStart + (angleEnd - angleStart) / 2;
    const labelX = this.centerX + labelRadius * Math.cos(labelAngle);
    const labelY = this.centerY + labelRadius * Math.sin(labelAngle);

    // Add labels to the segments
    d3.select(svgContainer)
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .text(label)
        .attr('class', `${className}-label`);
    });
  }

  drawLabels(svgContainer, radius, labels, className) {
    // Logic to draw the labels around the circle
    // ...
  }

  highlightArcs(svgContainer, radius, startIndices, className) {
    const segmentAngle = (2 * Math.PI) / 12; // Assuming 12 total segments for the circle
  
    // Define the indices of the segments you want to highlight
    // For example, F, C, G, E°, and F#°, assuming the order in your arrays
    const highlightIndices = startIndices; // An array of indices like [0, 1, 11]
  
    highlightIndices.forEach(index => {
      const angleStart = segmentAngle * index + 250;
      const angleEnd = segmentAngle * (index + 1) + 250;
  
      // Create an arc generator for the segments
      const arc = d3.arc()
        .innerRadius(radius - 2) // Adjust the thickness of your segment
        .outerRadius(radius)
        .startAngle(angleStart)
        .endAngle(angleEnd);
  
      // Draw the highlight arc segment
      d3.select(svgContainer)
        .append('path')
        .attr('d', arc)
        .attr('fill', 'black') // Color for highlight
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('transform', `translate(${this.centerX}, ${this.centerY})`);
    });
  }

  getNoteAngle(note) {
    const index = this.majorChords.indexOf(note);
    if (index === -1) {
      return null; // Note not found in the labels array
    }
    const segmentAngle = (2 * Math.PI) / this.majorChords.length;
    return segmentAngle * index - Math.PI / 2; // Offset by 90 degrees to start from the top
  }
  
  drawChordLines(svgContainer, chordNotes, style) {
    const radius = this.innerRadius; // Use the inner radius for the lines
    const center = { x: this.centerX, y: this.centerY };
  
    // Loop through the chord notes and draw lines between consecutive notes
    chordNotes.forEach((note, i) => {
      // Get the start angle for the current note
      const startAngle = super.getNoteAngle(note);
  
      // Get the end angle for the next note, wrapping around to the first note
      const nextNote = chordNotes[(i + 1) % chordNotes.length];
      const endAngle = super.getNoteAngle(nextNote);
  
      // Skip if the note is not found
      if (startAngle == null || endAngle == null) return;
  
      const startX = center.x + radius * Math.cos(startAngle);
      const startY = center.y + radius * Math.sin(startAngle);
      const endX = center.x + radius * Math.cos(endAngle);
      const endY = center.y + radius * Math.sin(endAngle);
  
      // Draw the line
      d3.select(svgContainer)
        .append('line')
        .attr('x1', startX)
        .attr('y1', startY)
        .attr('x2', endX)
        .attr('y2', endY)
        .attr('stroke', 'black') // or any color you wish to use
        .attr('stroke-dasharray', style ? '4,4' : 'none') // Adjusting for dotted lines
        .attr('stroke-width', 2); // adjust the width as necessary
    });
  }  
}
