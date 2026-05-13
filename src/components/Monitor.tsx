import { Activity, Baby, Droplets, Moon, Music, Thermometer, TriangleAlert, Video, Volume2, VideoOff, Shield, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store';
import { useBabyMonitor } from '../hooks/useBabyMonitor';
import { api } from '../services/api';

export default function Monitor() {
  const {
    monitoringActive,
    setMonitoringActive,
    babyStatus,
    cryLevel,
    motionLevel,
    alerts,
    timeline,
    webcamActive,
    lullabies,
    setCurrentTrack,
    setIsPlaying,
  } = useAppStore();

  const { videoRef, canvasRef, startWebcam, stopWebcam } = useBabyMonitor();

  const handleToggleMonitoring = async () => {
    if (monitoringActive) {
      stopWebcam();
      setMonitoringActive(false);
      api.stopMonitoring().catch(() => {});
    } else {
      await startWebcam();
      setMonitoringActive(true);
      api.startMonitoring().catch(() => {});
    }
  };

  const handlePlayLullaby = () => {
    const lullabyTracks = lullabies.filter(l => l.category === 'lullaby');
    if (lullabyTracks.length > 0) {
      setCurrentTrack(lullabyTracks[0]);
      setIsPlaying(true);
    }
  };

  const statusConfig: Record<string, { color: string; label: string; emoji: string }> = {
    sleeping: { color: 'text-tertiary', label: 'Sleeping', emoji: '😴' },
    awake: { color: 'text-primary', label: 'Awake', emoji: '👶' },
    crying: { color: 'text-error', label: 'Crying', emoji: '😢' },
    moving: { color: 'text-secondary', label: 'Moving', emoji: '🤸' },
  };

  const status = statusConfig[babyStatus] || statusConfig.sleeping;

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'cry': return <Volume2 className="text-secondary w-5 h-5" />;
      case 'motion': return <Activity className="text-tertiary w-5 h-5" />;
      case 'wakeup': return <Baby className="text-primary w-5 h-5" />;
      case 'sleep': return <Moon className="text-tertiary w-5 h-5" />;
      default: return <Activity className="text-outline w-5 h-5" />;
    }
  };

  const formatAlertTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1 min ago';
    if (mins < 60) return `${mins} mins ago`;
    return `${Math.round(mins / 60)}h ago`;
  };

  return (
    <div className="pb-32 pt-24 px-6 md:px-16 max-w-[800px] mx-auto space-y-10 animate-fade-in">
      {/* Webcam Feed */}
      <section className="space-y-4">
        <div className="relative group">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-surface-container-high relative border border-primary/10">
            {/* Live Video */}
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${webcamActive ? '' : 'hidden'}`}
              autoPlay
              muted
              playsInline
            />
            
            {/* Hidden canvas for motion detection */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Placeholder when camera is off */}
            {!webcamActive && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-container to-surface-container-high">
                <Video className="w-16 h-16 text-outline-variant mb-4" />
                <p className="text-on-surface-variant font-medium">Camera is off</p>
                <p className="text-sm text-outline mt-1">Start monitoring to activate</p>
              </div>
            )}
            
            {/* Live indicator */}
            {webcamActive && (
              <div className="absolute top-4 left-4 bg-surface/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                <span className="text-sm font-medium text-on-surface">Live Feed</span>
              </div>
            )}

            {/* Baby Status Badge */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
              <span className="text-lg">{status.emoji}</span>
              <span className={`text-sm font-bold ${status.color}`}>{status.label}</span>
            </div>
            
            {/* Camera controls */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button 
                onClick={handleToggleMonitoring}
                className={`p-2.5 backdrop-blur-md rounded-full transition-colors active:scale-95 ${
                  monitoringActive 
                    ? 'bg-error/80 text-white hover:bg-error' 
                    : 'bg-surface/80 text-primary hover:bg-primary-container'
                }`}
              >
                {monitoringActive ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            </div>

            {/* Level indicators */}
            <div className="absolute top-4 right-4 flex flex-col gap-3 w-32 p-3 bg-surface/60 backdrop-blur-lg rounded-xl border border-white/30">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Cry</span>
                  <span className={`text-[10px] font-bold ${cryLevel > 50 ? 'text-error' : cryLevel > 25 ? 'text-secondary' : 'text-tertiary'}`}>
                    {cryLevel > 50 ? 'High' : cryLevel > 25 ? 'Med' : 'Low'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/40 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${cryLevel > 50 ? 'bg-error' : 'bg-secondary-container'}`} 
                    style={{ width: `${cryLevel}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Motion</span>
                  <span className={`text-[10px] font-bold ${motionLevel > 50 ? 'text-primary' : 'text-tertiary'}`}>
                    {motionLevel > 50 ? 'Active' : motionLevel > 20 ? 'Some' : 'Calm'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-tertiary-container transition-all duration-300 rounded-full" 
                    style={{ width: `${motionLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Start Monitoring Button (when not active) */}
          {!monitoringActive && (
            <button
              onClick={handleToggleMonitoring}
              className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl transition-opacity hover:bg-black/30 group"
            >
              <div className="bg-primary text-on-primary px-8 py-4 rounded-full font-medium text-lg shadow-xl flex items-center gap-3 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
                Start Monitoring
              </div>
            </button>
          )}
        </div>
      </section>

      {/* Alert Feed */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-medium text-on-surface flex items-center gap-2">
          <TriangleAlert className="text-secondary w-6 h-6" />
          Alert Feed
          {alerts.length > 0 && (
            <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold">
              {alerts.length}
            </span>
          )}
        </h2>
        {alerts.length === 0 ? (
          <div className="bg-surface-container-low p-6 rounded-2xl text-center">
            <Shield className="w-10 h-10 text-outline-variant mx-auto mb-2" />
            <p className="text-on-surface-variant">No alerts yet. Start monitoring to receive alerts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`p-5 rounded-2xl flex items-start gap-4 ${
                alert.severity === 'high' 
                  ? 'bg-error/10 border border-error/20' 
                  : 'bg-secondary-container/20 border border-secondary/10'
              }`}>
                <div className={`p-3 rounded-full ${
                  alert.severity === 'high' ? 'bg-error/20 text-error' : 'bg-secondary-container text-on-secondary-container'
                }`}>
                  <TriangleAlert className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-display text-lg font-medium text-on-surface">
                      {alert.type === 'cry_detected' ? '🍼 Cry Alert' : 
                       alert.type === 'motion_detected' ? '👶 Motion Alert' : 
                       '⚠️ Alert'}
                    </p>
                    <span className="text-sm font-medium text-on-surface-variant">{formatAlertTime(alert.timestamp)}</span>
                  </div>
                  <p className="text-on-surface-variant opacity-90 mt-1">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Activity Timeline & Health */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-display text-xl font-medium text-on-surface px-1">Activity Timeline</h2>
          <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-primary/10 pl-2">
            {timeline.slice(0, 6).map((event) => (
              <div key={event.id} className="relative flex items-start gap-4 pl-8 group">
                <div className="absolute left-[-2px] w-10 h-10 rounded-full bg-surface-container-high border-4 border-background flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                  {getTimelineIcon(event.type)}
                </div>
                <div className="flex-1 bg-surface border border-primary/5 p-4 rounded-xl shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
                    <span className="font-semibold text-on-surface">{event.title}</span>
                    <span className="text-sm text-on-surface-variant">{event.time}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary-container/20 p-6 rounded-2xl border border-primary/10">
            <h3 className="font-display text-lg font-medium text-primary mb-4">Health Snapshot</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Thermometer className="text-primary w-5 h-5" />
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-tight">Room Temp</p>
                  <p className="font-bold text-on-surface text-lg">22.5°C</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Droplets className="text-primary w-5 h-5" />
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-tight">Humidity</p>
                  <p className="font-bold text-on-surface text-lg">48%</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl space-y-4">
            <h3 className="font-display text-base font-medium text-on-surface">Quick Controls</h3>
            <button 
              onClick={handlePlayLullaby}
              className="w-full py-3 bg-primary text-on-primary rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            >
              <Music className="w-4 h-4" />
              Play Lullaby
            </button>
            <button className="w-full py-3 bg-surface text-primary border border-primary/20 rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary-container/30 transition-all active:scale-95">
              <Moon className="w-4 h-4" />
              Night Mode
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
