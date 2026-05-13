import { useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '../store';
import { api } from '../services/api';

export function useBabyMonitor() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const {
    monitoringActive,
    webcamActive,
    setWebcamActive,
    setBabyStatus,
    setCryLevel,
    setMotionLevel,
    addAlert,
    addTimelineEvent,
  } = useAppStore();

  // Start webcam
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Set up audio analysis for cry detection
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      setWebcamActive(true);
      startDetection();
    } catch (error) {
      console.error('Failed to start webcam:', error);
      addAlert({
        id: Date.now().toString(),
        type: 'room_alert',
        message: 'Unable to access camera/microphone. Please allow permissions.',
        timestamp: new Date().toISOString(),
        severity: 'high',
      });
    }
  }, [setWebcamActive, addAlert]);

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    prevFrameRef.current = null;
    setWebcamActive(false);
  }, [setWebcamActive]);

  // Cry detection via audio frequency analysis
  const detectCry = useCallback(() => {
    if (!analyserRef.current) return 0;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Baby cries are typically 300-600 Hz range
    // With fftSize=2048 and sampleRate=44100, each bin = ~21.5 Hz
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const binWidth = sampleRate / analyser.fftSize;
    const startBin = Math.floor(300 / binWidth);
    const endBin = Math.floor(600 / binWidth);

    let cryEnergy = 0;
    let totalEnergy = 0;

    for (let i = startBin; i <= endBin; i++) {
      cryEnergy += dataArray[i];
    }
    for (let i = 0; i < dataArray.length; i++) {
      totalEnergy += dataArray[i];
    }

    const avgCryEnergy = cryEnergy / (endBin - startBin + 1);
    const avgTotalEnergy = totalEnergy / dataArray.length;

    // Cry detection threshold: high energy in cry frequency range
    const cryLevel = Math.min(100, Math.round((avgCryEnergy / 255) * 100));
    return cryLevel;
  }, []);

  // Motion detection via frame differencing
  const detectMotion = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return 0;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    canvas.width = 160;
    canvas.height = 120;
    ctx.drawImage(video, 0, 0, 160, 120);

    const currentFrame = ctx.getImageData(0, 0, 160, 120);

    if (!prevFrameRef.current) {
      prevFrameRef.current = currentFrame;
      return 0;
    }

    let diffSum = 0;
    const prevData = prevFrameRef.current.data;
    const currData = currentFrame.data;
    const pixelCount = currData.length / 4;

    for (let i = 0; i < currData.length; i += 4) {
      const rDiff = Math.abs(currData[i] - prevData[i]);
      const gDiff = Math.abs(currData[i + 1] - prevData[i + 1]);
      const bDiff = Math.abs(currData[i + 2] - prevData[i + 2]);
      diffSum += (rDiff + gDiff + bDiff) / 3;
    }

    const motionLevel = Math.min(100, Math.round((diffSum / pixelCount / 255) * 100 * 5));
    prevFrameRef.current = currentFrame;
    return motionLevel;
  }, []);

  // Main detection loop
  let cryAccumulator = 0;
  let cryFrames = 0;
  let lastAlertTime = 0;

  const startDetection = useCallback(() => {
    let frameCount = 0;
    let cryAccum = 0;
    let lastCryAlert = 0;
    let lastMotionAlert = 0;

    const detect = () => {
      frameCount++;

      // Run detection every 10 frames (~3x per second at 30fps)
      if (frameCount % 10 === 0) {
        const cry = detectCry();
        const motion = detectMotion();

        setCryLevel(cry);
        setMotionLevel(motion);

        // Accumulate cry for sustained detection
        if (cry > 40) {
          cryAccum++;
        } else {
          cryAccum = Math.max(0, cryAccum - 1);
        }

        const now = Date.now();

        // Alert on sustained crying (>3 consecutive detections, not more than once per 30s)
        if (cryAccum > 3 && now - lastCryAlert > 30000) {
          lastCryAlert = now;
          setBabyStatus('crying');
          const alertMsg = `Baby has been crying for about ${cryAccum * 3} seconds.`;

          addAlert({
            id: now.toString(),
            type: 'cry_detected',
            message: alertMsg,
            timestamp: new Date().toISOString(),
            severity: 'high',
          });

          addTimelineEvent({
            id: now.toString(),
            type: 'cry',
            title: 'Cry alert',
            description: alertMsg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date().toISOString(),
          });

          // Send to backend
          api.sendMonitoringAlert('cry_detected', alertMsg).catch(() => {});

          // Browser notification
          if (Notification.permission === 'granted') {
            new Notification('MaaMate Alert 🍼', { body: alertMsg, icon: '/favicon.ico' });
          }
        }

        // Motion alert (not more than once per 60s)
        if (motion > 50 && now - lastMotionAlert > 60000) {
          lastMotionAlert = now;
          setBabyStatus('moving');
          const motionMsg = 'Significant movement detected near the crib.';

          addAlert({
            id: now.toString(),
            type: 'motion_detected',
            message: motionMsg,
            timestamp: new Date().toISOString(),
            severity: 'medium',
          });

          addTimelineEvent({
            id: now.toString(),
            type: 'motion',
            title: 'Movement detected',
            description: motionMsg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date().toISOString(),
          });

          api.sendMonitoringAlert('motion_detected', motionMsg).catch(() => {});
        }

        // If quiet
        if (cry < 15 && motion < 15) {
          setBabyStatus('sleeping');
          cryAccum = 0;
        } else if (cry < 30 && motion > 20) {
          setBabyStatus('awake');
        }
      }

      animFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  }, [detectCry, detectMotion, setCryLevel, setMotionLevel, setBabyStatus, addAlert, addTimelineEvent]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return {
    videoRef,
    canvasRef,
    startWebcam,
    stopWebcam,
  };
}
