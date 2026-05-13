import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store';
import { api } from '../services/api';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    setWsConnected,
    addAlert,
    addTimelineEvent,
    addReminder,
    addLog,
    setBabyStatus,
    setCryLevel,
    setMotionLevel,
    setMonitoringActive,
    setIsPlaying,
    setCurrentTrack,
    lullabies,
    setActiveTab,
  } = useAppStore();

  const connect = useCallback(() => {
    try {
      const ws = api.createWebSocket();

      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (e) {}
      };

      ws.onclose = () => {
        setWsConnected(false);
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch (e) {
      // Server might not be running, retry
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    }
  }, [setWsConnected]);

  const handleMessage = useCallback((message: any) => {
    const { type, data } = message;

    switch (type) {
      case 'cry_detected':
        setBabyStatus('crying');
        setCryLevel(data.cryLevel || 60);
        addAlert({
          id: Date.now().toString(),
          type: 'cry_detected',
          message: data.details || 'Crying detected!',
          timestamp: new Date().toISOString(),
          severity: 'high',
        });
        addTimelineEvent({
          id: Date.now().toString(),
          type: 'cry',
          title: 'Cry alert',
          description: data.details || 'Crying detected',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date().toISOString(),
        });
        setActiveTab('monitor');
        break;

      case 'motion_detected':
        setBabyStatus('moving');
        setMotionLevel(data.motionLevel || 50);
        addTimelineEvent({
          id: Date.now().toString(),
          type: 'motion',
          title: 'Movement detected',
          description: data.details || 'Motion detected',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date().toISOString(),
        });
        break;

      case 'monitoring_started':
        setMonitoringActive(true);
        break;

      case 'monitoring_stopped':
        setMonitoringActive(false);
        break;

      case 'monitoring_update':
        if (data.babyStatus) setBabyStatus(data.babyStatus);
        if (data.cryLevel !== undefined) setCryLevel(data.cryLevel);
        if (data.motionLevel !== undefined) setMotionLevel(data.motionLevel);
        break;

      case 'reminder_created':
        addReminder(data);
        break;

      case 'log_created':
        addLog(data);
        break;
      case 'play_lullaby': {
        const tracks = lullabies.filter((l) => l.category === (data.soundType || 'lullaby'));
        if (tracks.length > 0) {
          setCurrentTrack(tracks[0]);
          setIsPlaying(true);
          setActiveTab('stories');
        }
        break;
      }
      case 'navigate':
        if (data.tab) setActiveTab(data.tab);
        break;
    }
  }, [setBabyStatus, setCryLevel, setMotionLevel, addAlert, addTimelineEvent, setMonitoringActive, addReminder, addLog, setIsPlaying, setCurrentTrack, lullabies]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  return { wsRef };
}
