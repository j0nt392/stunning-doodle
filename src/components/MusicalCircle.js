import * as d3 from "d3";

export default class MusicalCircle {
  constructor(radius) {
    this.radius = radius;
    this.centerX = radius; // Assuming the SVG will be twice the radius
    this.centerY = radius; // Assuming the SVG will be twice the radius
    this.segmentColors = [];

    this.labels = {
      "I":"C",
      "bII":"Db",
      "II":"D",
      "bIII":"Eb",
      "III":"E",
      "IV":"F",
      "bV":"Gb",
      "V":"G",
      "bVI":"Ab",
      "VI":"A",
      "bVII":"Bb",
      "VII":"B",
    };
    this.minorChords = {
      "vi": "Am",
      "iii": "Em",
      "vii":"Bm",
      "#iv":"F#m",
      "#i":"C#m",
      "#v":"G#m",
      "biii":"D#m",
      "bvii":"A#m",
      "iv":"Fm",
      "i":"Cm",
      "v":"Gm",
      "ii":"Dm",
    };

    this.diminishedChords = {
      "vii°": "B°",
      "#iv°": "F#°",
      "#i°": "C#°",
      "#v°": "G#°",
      "#ii°": "D#°",
      "#vi°": "A#°",
      "iv°": "F°",
      "i°": "C°",
      "v°": "G°",
      "ii°": "D°",
      "vi°": "A°",
      "iii°": "E°",
    };
    // this.diminishedChords = ['B°', 'F#°', 'C#°', 'G#°', 'D#°', 'A#°', 'F°', 'C°', 'G°', 'D°', 'A°', 'E°'];

    this.modes = [
      "Locrian",
      "Phrygian",
      "Aeolian",
      "Dorian",
      "Mixolydian",
      "Ionian",
      "Lydian",
    ];
  }

  setSegmentColors(colors) {
      this.segmentColors = colors;
  }

  shiftLabelsUp() {
    this.diminishedChords = this.shiftValuesInDictionary(this.diminishedChords, 'up')
    this.minorChords = this.shiftValuesInDictionary(this.minorChords, 'up')
    this.labels = this.shiftValuesInDictionary(this.labels, 'up')
    const colorLastElement = this.segmentColors.pop();
    this.segmentColors.unshift(colorLastElement);
  }

    // Function to shift values in the dictionary
  shiftValuesInDictionary(dictionary, direction) {
    // Get the array of values and shift
    const values = Object.values(dictionary);
    let shiftedValues;
    if(direction === 'up'){
      shiftedValues = [values[values.length - 1], ...values.slice(0, values.length - 1)];
    }else{
      shiftedValues = [...values.slice(1), values[0]]; // Move the first element to the end
    }

    // Create a new object with the same keys but shifted values
    const keys = Object.keys(dictionary);
    const shiftedDictionary = {};
    keys.forEach((key, index) => {
      shiftedDictionary[key] = shiftedValues[index];
    });

    return shiftedDictionary;
  }

  shiftLabelsDown() {
    this.diminishedChords = this.shiftValuesInDictionary(this.diminishedChords)
    this.minorChords = this.shiftValuesInDictionary(this.minorChords)
    this.labels = this.shiftValuesInDictionary(this.labels)
    const firstColorElement = this.segmentColors.shift();
    this.segmentColors.push(firstColorElement);
  }

  clear(svgContainer) {
    d3.select(svgContainer).selectAll("*").remove(); // Clear previous drawing
  }

  draw(svgContainer) {
    this.clear(svgContainer); // Clear before drawing
  }

  getNoteAngle(note) {
    //const index = this.labels.indexOf(note);
    const valuesArray = Object.values(this.labels)
    const index = valuesArray.indexOf(note)
    if (index === -1) {
      return null; // Note not found in the labels array
    }
    const segmentAngle = (2 * Math.PI) / 12;
    return segmentAngle * index - Math.PI / 2; // Offset by 90 degrees to start from the top
  }

  getColorForNoteIndex(index, total, colorScheme) {
    switch (colorScheme) {
      case "rainbow":
        const hue = (index / total) * 360;
        console.log(hue);
        return d3.hsl(hue, 2, 2.5).toString();
      case "monochrome":
        return "#87B1B0";
      default:
        return "#87B1B0";
    }
  }

  sortNotes(notes) {
    const orderedNotes = Object.values(this.labels);
    notes.sort((a, b) => {
      return orderedNotes.indexOf(a) - orderedNotes.indexOf(b);
    });
    return notes;
  }

  drawChordLines(svgContainer, chordNotes, style, shapeColorScheme, size) {
    let radius = this.radius;
    if (size === "small") {
      radius = radius * 0.335;
    }
    const center = { x: this.centerX, y: this.centerY };

    let sortedNotes = this.sortNotes(chordNotes)

    // Create a group element for the chord
    const chordGroup = d3
      .select(svgContainer)
      .append("g")
      .attr("class", "chord-group"); // Add a class to identify the group

    // Loop through the chord notes and draw lines between consecutive notes
    sortedNotes.forEach((note, i) => {
      // Get the start angle for the current note
      const startAngle = this.getNoteAngle(note);

      // Get the end angle for the next note, wrapping around to the first note
      const nextNote = sortedNotes[(i + 1) % sortedNotes.length];
      const endAngle = this.getNoteAngle(nextNote);

      const startX = center.x + radius * Math.cos(startAngle);
      const startY = center.y + radius * Math.sin(startAngle);
      const endX = center.x + radius * Math.cos(endAngle);
      const endY = center.y + radius * Math.sin(endAngle);
      const uniqueColor = this.getColorForNoteIndex(
        i,
        sortedNotes.length,
        shapeColorScheme
      );

      // Draw the line within the chord group
      chordGroup
        .append("line")
        .attr("x1", startX)
        .attr("y1", startY)
        .attr("x2", endX)
        .attr("y2", endY)
        .attr("stroke", uniqueColor) // or any color you wish to use
        .attr("stroke-dasharray", style ? "4,4" : "none") // Adjusting for dotted lines
        .attr("stroke-width", 2); // adjust the width as necessary
    });
  }

  drawModes(key, mode) {
    const scaleIntervals = {
      Ionian: [2, 2, 1, 2, 2, 2, 1], // Major scale
      Dorian: [2, 1, 2, 2, 2, 1, 2],
      Phrygian: [1, 2, 2, 2, 1, 2, 2],
      Lydian: [2, 2, 2, 1, 2, 2, 1],
      Mixolydian: [2, 2, 1, 2, 2, 1, 2],
      Aeolian: [2, 1, 2, 2, 1, 2, 2], // Natural minor scale
      Locrian: [1, 2, 2, 1, 2, 2, 2],
    };
    const intervals = scaleIntervals[mode];
    const allNotes = Object.values(this.labels); // Get all notes based on enharmonic settings
    const notes = [key];
    let currentNoteIndex = allNotes.findIndex((note) => note === key);

    intervals.forEach((interval) => {
      currentNoteIndex += interval;
      if (currentNoteIndex >= allNotes.length) {
        currentNoteIndex -= allNotes.length;
      }
      notes.push(allNotes[currentNoteIndex]);
    });

    return notes;
  }
}
