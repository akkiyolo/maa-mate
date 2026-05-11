import { Activity, Baby, Droplets, Moon, Music, SettingsRemote, Thermometer, TriangleAlert, Video, Volume2 } from 'lucide-react';

export default function Monitor() {
  return (
    <div className="pb-32 pt-24 px-6 md:px-16 max-w-[800px] mx-auto space-y-10 animate-fade-in">
      <section className="space-y-4">
        <div className="relative group">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-surface-container-high relative border border-primary/10">
            <img 
              className="w-full h-full object-cover opacity-90" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtluy_oY66Wo7CdMbDEfs2v31G1k70dTSPG_4JBrTbn3qQIa-GL6WyBz53ue6UBjwvRMuakP-y9SdeW8uRtjnaqKw_mMFcp941wk3zro83ZN_5v-zkjrbSTnfRx8U8rbwC26PbtURM2aVNkozXCYMGgu3bqaoEzT6MPMIwdfPcdBJHNeV4fRQUlOs_vnWaXOK0wQX-YQWJMiqkGu2QCeogSpAgTWG8ikiAKYO8AT-ADSqkZ_6pgegcb6iuMRRvdw39qjL-1rGXE8uC"
              alt="Live Feed"
            />
            
            <div className="absolute top-4 left-4 bg-surface/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              <span className="text-sm font-medium text-on-surface">Live Feed</span>
            </div>
            
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button className="p-2.5 bg-surface/80 backdrop-blur-md rounded-full text-primary hover:bg-primary-container transition-colors active:scale-95">
                <Volume2 className="w-5 h-5" />
              </button>
              <button className="p-2.5 bg-surface/80 backdrop-blur-md rounded-full text-primary hover:bg-primary-container transition-colors active:scale-95">
                <Video className="w-5 h-5" />
              </button>
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-3 w-32 p-3 bg-surface/60 backdrop-blur-lg rounded-xl border border-white/30">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Cry</span>
                  <span className="text-[10px] font-bold text-secondary">Low</span>
                </div>
                <div className="h-1.5 w-full bg-white/40 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-container w-[20%]"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Motion</span>
                  <span className="text-[10px] font-bold text-tertiary">Active</span>
                </div>
                <div className="h-1.5 w-full bg-white/40 rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary-container w-[65%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-medium text-on-surface flex items-center gap-2">
          <TriangleAlert className="text-secondary w-6 h-6" />
          Alert Feed
        </h2>
        <div className="bg-secondary-container/20 border border-secondary/10 p-5 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-secondary-container rounded-full text-on-secondary-container">
            <TriangleAlert className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <p className="font-display text-lg font-medium text-on-surface">Room Temp Alert</p>
              <span className="text-sm font-medium text-on-surface-variant">2 mins ago</span>
            </div>
            <p className="text-on-surface-variant opacity-90 mt-1">Nursery temperature has risen to 24°C. Consider adjusting the thermostat.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-display text-xl font-medium text-on-surface px-1">Activity Timeline</h2>
          <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-primary/10 pl-2">
            
            <div className="relative flex items-start gap-4 pl-8 group">
              <div className="absolute left-[-2px] w-10 h-10 rounded-full bg-surface-container-high border-4 border-background flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                <Baby className="text-primary w-5 h-5" />
              </div>
              <div className="flex-1 bg-surface border border-primary/5 p-4 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
                  <span className="font-semibold text-on-surface">Aarav woke up</span>
                  <span className="text-sm text-on-surface-variant">08:14 AM</span>
                </div>
                <p className="text-sm text-on-surface-variant">Soft stirring detected for 45 seconds.</p>
              </div>
            </div>

            <div className="relative flex items-start gap-4 pl-8 group">
              <div className="absolute left-[-2px] w-10 h-10 rounded-full bg-surface-container-high border-4 border-background flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                <Activity className="text-tertiary w-5 h-5" />
              </div>
              <div className="flex-1 bg-surface border border-primary/5 p-4 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
                  <span className="font-semibold text-on-surface">Movement detected</span>
                  <span className="text-sm text-on-surface-variant">07:52 AM</span>
                </div>
                <p className="text-sm text-on-surface-variant">Roll-over motion detected in center of crib.</p>
              </div>
            </div>

            <div className="relative flex items-start gap-4 pl-8 group">
              <div className="absolute left-[-2px] w-10 h-10 rounded-full bg-surface-container-high border-4 border-background flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                <Volume2 className="text-secondary w-5 h-5" />
              </div>
              <div className="flex-1 bg-surface border border-primary/5 p-4 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
                  <span className="font-semibold text-on-surface">Cry alert</span>
                  <span className="text-sm text-on-surface-variant">06:30 AM</span>
                </div>
                <p className="text-sm text-on-surface-variant">Level 2 fussiness detected. Resolved within 3 minutes.</p>
              </div>
            </div>

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
            <button className="w-full py-3 bg-primary text-on-primary rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
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
