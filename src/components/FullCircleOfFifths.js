import MusicalCircle  from './MusicalCircle';
import * as d3 from 'd3';

export default class FullCircleOfFifths extends MusicalCircle {
  constructor(radius) {
    super(radius);
    this.labels = {
      'I': 'C',
      'V': 'G',
      'II': 'D',
      'VI': 'A',
      'III': 'E',
      'VII': 'B',
      'bV': 'Gb',
      'bII': 'Db',
      'bVI': 'Ab',
      'bIII': 'Eb',
      'bVII': 'Bb',
      'IV': 'F'
    };
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
    this.drawCircle(svgContainer, innerRadius, this.labels, "major");
    
    // Draw the mode labels around the edge
    this.drawLabels(svgContainer, outerRadius + 20, this.modes, "modes");
  }

  drawCircle(svgContainer, radius, labels, className) {
    const segmentAngle = (2 * Math.PI) / 12;
    const chordRelationships = {
      'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°'],
      'Db': ['C#', 'D#m', 'Fm', 'Gb', 'Ab', 'A#m', 'C°'],
      'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#°'],
      'Eb': ['D#', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'D°'], // D# is enharmonically equivalent to Eb
      'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#°'],
      'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'E°'],
      'Gb': ['Gb', 'G#m', 'A#m', 'B', 'Db', 'D#m', 'F°'],
      'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#°'],
      'Ab': ['G#', 'A#m', 'Cm', 'Db', 'Eb', 'Fm', 'G°'], // G# is enharmonically equivalent to Ab
      'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#°'],
      'Bb': ['A#', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'A°'], // A# is enharmonically equivalent to Bb
      'B': ['B', 'C#m', 'D#m', 'E', 'Gb', 'G#m', 'A#°']
    };

    const labelsArray = Object.entries(labels);
    console.log(labelsArray.length)

    // Create an arc generator
    const arc = d3.arc()
      .innerRadius(radius - 38) // Inner radius of segment, adjust as needed
      .outerRadius(radius + 20); // Outer radius of segment, adjust as needed
  
    const svg = d3.select(svgContainer);
  
    // Bind the labels data to groups
    const groups = svg.selectAll(`.${className}-group`)
      .data(labelsArray)
      .enter()
      .append('g')
      .attr('class', `${className}-group`)
      .attr('transform', `translate(${this.centerX}, ${this.centerY})`)
      .attr('id', d => `${className}-${d[0].replace('#', 'sharp')}`); // Use d[0] for the key in the entry
    
    var self = this;
    // Append the arc path to each group
    groups.each(function(d, i) {
      // Calculate start and end angles for this segment
      const startAngle = i * segmentAngle + 50; // Adjust the start angle as needed
      const endAngle = (i + 1) * segmentAngle + 50; // Adjust the end angle as needed
      // Draw the arc for this segment
      d3.select(this).append('path')
        .attr("d", "M 10,90 Q 100,15 200,70 Q 340,140 400,30") //SVG path
        .attr('d', arc.startAngle(startAngle).endAngle(endAngle))
        .attr('fill', self.segmentColors[i])
       // .attr('fill', '#CDD3D0') // Default fill color, can be changed with CSS
        .attr('stroke', 'black');
      
      // Calculate label position for this chord
      const angle = i * segmentAngle - Math.PI / 2; // Adjust the angle for the label
      const labelRadius = radius - 10; // Adjust the label radius as necessary
      const rotationangle = (i * 360 / 12) - 90;       
      
      const labelX = labelRadius * Math.cos(angle);
      const labelY = labelRadius * Math.sin(angle);
      // Append the text label for this chord
  // Create the main text element
  const text = d3.select(this).append('text')
    .attr('x', labelX)
    .attr('y', labelY)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('class', `${className}-label`)
    .attr('transform', `rotate(${rotationangle + 90}, ${labelX}, ${labelY})`);

  // Append first tspan for d[0]
  text.append('tspan')
    .style('font-weight', 'normal') // Style for d[0]
    .style('font-size', '13px')
    .text(`${d[0]} `);

  // Append second tspan for d[1]
  text.append('tspan')
    .style('font-weight', 'bold') // Different style for d[1]
    .attr('dx', '5') // Add some space between d[0] and d[1]
    .text(d[1]);
      
      });


  // Add hover effects to the group, not the individual elements
  groups.on('mouseenter', function(event, d) {
    // Change fill opacity for the hovered group
    d3.select(this).select('path').attr('fill-opacity', '0.5');
  
    // Get related chords based on the key
    const relatedChords = chordRelationships[d[1]];
    if (relatedChords) {
      svg.selectAll('text').each(function() {
        const textElement = d3.select(this);
        const textParts = textElement.text().split(' '); // Split the text content by space
        const chordName = textParts[textParts.length - 1]; // Assume the chord name is the last part
  
        if (relatedChords.includes(chordName)) {
          // Find the parent group and select the path to change its fill opacity
          const parentGroup = textElement.node().parentNode;
          d3.select(parentGroup).select('path').attr('fill-opacity', '0.5');
        }
      });
    }
  })
  .on('mouseleave', function(event, d) {
    // Remove hover effect from all chords
    svg.selectAll('path').attr('fill-opacity', '1');

  });

  }
  
  olddrawCircle(svgContainer, radius, labels, className) {
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
    
    const svg = d3.select(svgContainer)
    labels.forEach((mode, index) => {
      const angle = (index * 360 / 12) - 240; 
      const radian = (angle * Math.PI) / 180;
      const x = this.centerX + radius * Math.cos(radian);
      const y = this.centerY + radius * Math.sin(radian);
  
      svg.append("text")
      .attr("x", x)
      .attr('font-size', '1.2rem')
      .attr("y", y - 10)
      .attr("text-anchor", "middle")
      .attr('transform', `rotate(${angle + 90}, ${x},${y})`)
      .attr('fill', '#CDD3D0')
      .text(mode);
  });
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
}
