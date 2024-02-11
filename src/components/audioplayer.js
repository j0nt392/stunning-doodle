import React, { useRef, useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

const DefaultWaveform = ({ audioUrl }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false); // State to track play status

  // Effect for initializing WaveSurfer
  useEffect(() => {
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'violet',
      progressColor: 'purple',
      cursorColor: 'transparent',
      barWidth: 2,
      responsive: true, // Ensure it is responsive
      height: 150 // Set the height of the waveform
    });

    // Load the audio file when the URL is set
    if (audioUrl) {
      wavesurfer.current.load(audioUrl);
    }

    // Add listeners for play and pause events to update the isPlaying state
    wavesurfer.current.on('play', () => setIsPlaying(true));
    wavesurfer.current.on('pause', () => setIsPlaying(false));
    wavesurfer.current.on('finish', () => setIsPlaying(false));

    // Cleanup function to destroy wavesurfer instance on unmount
    return () => wavesurfer.current.destroy();
  }, [audioUrl]);

  // Function to handle the play/pause action
  const handlePlayPause = () => {
    wavesurfer.current.playPause();
  };

  return (
    <div className="wavesurfer">
      <button className="playbutton" onClick={handlePlayPause}>
      {isPlaying ? <i className="fa fa-pause"></i> : <i className="fa fa-play"></i>}
      </button>
      <div ref={waveformRef} style={{ width: '100px', height: '150px', backgroundColor: '#f3f3f3' }}></div>
    </div>
  );
};

export default DefaultWaveform;
