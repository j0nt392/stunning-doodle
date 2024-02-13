import React, { useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';

const LiveWaveform = ({ deviceId }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  let record;

  useEffect(() => {
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#87B1B0',
      progressColor: '#87B1B0',
    });

    record = wavesurfer.current.registerPlugin(RecordPlugin.create());
    record.startRecording({ deviceId });

    return () => {
      record.stopRecording();
      wavesurfer.current.destroy();
    };
  }, [deviceId]);

  return <div className="w-[500px]" ref={waveformRef} ></div>
};

export default LiveWaveform;
