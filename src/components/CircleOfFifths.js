import MusicalCircle  from './MusicalCircle';
import * as d3 from 'd3';

export default class CircleOfFifths extends MusicalCircle {
  constructor(radius) {
    super(radius);
    // Order the labels according to the Circle of Fifths
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
    };  }
  draw(svgContainer) {
    super.clear(svgContainer); // Call the clear method from the parent class
    // Define the inner and outer radius to create the ring effect
    const innerRadius = this.radius * 0.99; // Adjust as necessary for the desired ring thickness
    const outerRadius = this.radius;
    const segmentAngle = (2 * Math.PI) / Object.keys(this.labels).length;

    Object.entries(this.labels).forEach(([key,label], index) => {
      const angleStart = segmentAngle * index - Math.PI / 2 + 50;
      const angleEnd = segmentAngle * (index + 1) - Math.PI / 2 + 50;
      // Create the arc path for the ring segment
      const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(angleStart)
        .endAngle(angleEnd);

      // Draw the arc segment as a ring
      d3.select(svgContainer)
        .append('path')
        .attr('d', arc())
        .attr('fill', this.segmentColors[index]) // Fill with segment color
        .attr('transform', `translate(${this.centerX}, ${this.centerY})`);

      // Position the labels around the outer edge of the ring
      const labelRadius = outerRadius + 20; // The labels are placed outside of the ring
      const labelAngle = angleStart + segmentAngle / 2;
      const labelX = this.centerX + labelRadius * Math.cos(labelAngle);
      const labelY = this.centerY + labelRadius * Math.sin(labelAngle);

      // Add the labels
      d3.select(svgContainer)
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('fill', '#D1D5DB')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .text(`${key}  ${label}`);
    });
  }
    // Drawing logic for a chromatic circle, e.g., colored arcs
    // This is where you'll use D3 to draw the chromatic circle
}
