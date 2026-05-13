import { useEffect } from 'react';
import { Home as HomeIcon, Radio, BookOpen, Calendar, UserCircle, Mic, LogOut } from 'lucide-react';
import Home from './components/Home';
import Monitor from './components/Monitor';
import Stories from './components/Stories';
import Planner from './components/Planner';
import AuthModal from './components/AuthModal';
import { AnimatePresence, motion } from 'motion/react';
import { useAppStore } from './store';
import { useVoiceAssistant } from './hooks/useVoiceAssistant';
import { useWebSocket } from './hooks/useWebSocket';
import { api } from './services/api';

export default function App() {
  const {
    activeTab,
    setActiveTab,
    micActive,
    setMicActive,
    voiceState,
    lastTranscript,
    lastResponse,
    setLullabies,
    user,
    isAuthenticated,
    setUser,
    clearUser,
    setShowAuthModal,
    setLogs,
    setReminders,
  } = useAppStore();

  const { toggleMic, stopListening, startListening } = useVoiceAssistant();
  useWebSocket();

  // Load lullabies on mount — set fallback immediately, then try API
  useEffect(() => {
    const fallbackLullabies = [
      { id: 'lullaby-1', title: 'Twinkle Twinkle Little Star', artist: 'Classic Lullaby', youtubeId: 'yCjJyiqpAuU', category: 'lullaby', duration: '3:20' },
      { id: 'lullaby-2', title: 'Rock-a-bye Baby', artist: 'Soothing Melodies', youtubeId: 'jTFGaki-GXo', category: 'lullaby', duration: '4:15' },
      { id: 'lullaby-3', title: 'Hush Little Baby', artist: 'Classic Lullaby', youtubeId: 'x-KUBY5OVgA', category: 'lullaby', duration: '3:50' },
      { id: 'lullaby-4', title: 'Brahms Lullaby', artist: 'Classical', youtubeId: 't894eGoals8', category: 'lullaby', duration: '5:00' },
      { id: 'lullaby-5', title: 'Mozarts Lullaby', artist: 'Classical', youtubeId: 'S-Xm7s9eGxU', category: 'lullaby', duration: '4:30' },
      { id: 'lullaby-6', title: 'You Are My Sunshine', artist: 'Lullaby Version', youtubeId: 'cGa3zFRqjpM', category: 'lullaby', duration: '3:30' },
      { id: 'hindi-1', title: 'Lakdi Ki Kathi', artist: 'Hindi Lullaby', youtubeId: 'aDRSQFlfmFo', category: 'lullaby', duration: '3:30' },
      { id: 'hindi-2', title: 'Chanda Mama Door Ke', artist: 'Hindi Lullaby', youtubeId: 'Q8TXgNw5JhQ', category: 'lullaby', duration: '4:00' },
      { id: 'rain-1', title: 'Gentle Rain Sounds', artist: 'Nature Sounds', youtubeId: 'mPZkdNFkNps', category: 'rain', duration: '60:00' },
      { id: 'rain-2', title: 'Rain On Window', artist: 'Relaxing Sounds', youtubeId: 'q76bMs-NwRk', category: 'rain', duration: '120:00' },
      { id: 'ocean-1', title: 'Ocean Waves For Sleeping', artist: 'Nature Sounds', youtubeId: 'bn9F19Hi1Lk', category: 'ocean', duration: '60:00' },
      { id: 'ocean-2', title: 'Calm Sea Sounds', artist: 'Ocean Therapy', youtubeId: 'f77SKdyn-1Y', category: 'ocean', duration: '120:00' },
      { id: 'whitenoise-1', title: 'White Noise For Baby Sleep', artist: 'Sleep Sounds', youtubeId: 'nMfPqeZjc2c', category: 'whitenoise', duration: '60:00' },
      { id: 'whitenoise-2', title: 'Womb Sounds For Newborn', artist: 'Baby Comfort', youtubeId: 'jc_rrN5lcr4', category: 'whitenoise', duration: '120:00' },
      { id: 'heartbeat-1', title: 'Heartbeat Sounds For Baby', artist: 'Calming Sounds', youtubeId: 'dNJdJIwCF_Y', category: 'heartbeat', duration: '60:00' },
      { id: 'heartbeat-2', title: 'Womb Heartbeat', artist: 'Newborn Comfort', youtubeId: 'LHhkraMcSZY', category: 'heartbeat', duration: '120:00' },
    ];

    // Set fallback immediately so voice commands work right away
    setLullabies(fallbackLullabies);

    // Then try to fetch full list from API
    api.getLullabies()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLullabies(data);
        }
      })
      .catch(() => {
        console.log('Using fallback lullabies — backend not reachable');
      });

    // Load voices early
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Auto-login if token exists
  useEffect(() => {
    if (api.isLoggedIn()) {
      api.getMe()
        .then((data) => {
          if (data && data.id) {
            setUser(data);
            // Load user data from DB
            api.getLogs().then((logs) => { if (Array.isArray(logs)) setLogs(logs); }).catch(() => {});
            api.getReminders().then((r) => { if (Array.isArray(r)) setReminders(r); }).catch(() => {});
          }
        })
        .catch(() => { api.logout(); });
    }
  }, []);

  const handleMicToggle = () => {
    if (micActive) {
      stopListening();
      setMicActive(false);
    } else {
      setMicActive(true);
      startListening();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onActivateMic={() => { setMicActive(true); startListening(); }} onNavigate={setActiveTab} />;
      case 'monitor':
        return <Monitor />;
      case 'stories':
        return <Stories />;
      case 'planner':
        return <Planner />;
      default:
        return <Home onActivateMic={() => { setMicActive(true); startListening(); }} onNavigate={setActiveTab} />;
    }
  };

  const voiceStateLabel = () => {
    switch (voiceState) {
      case 'listening': return 'Listening...';
      case 'processing': return 'Thinking...';
      case 'speaking': return 'Speaking...';
      default: return 'Tap to speak';
    }
  };

  const orbAnimation = () => {
    if (voiceState === 'listening') return 'animate-pulse shadow-[0_0_60px_rgba(100,84,149,0.5)]';
    if (voiceState === 'processing') return 'animate-spin shadow-[0_0_40px_rgba(126,82,98,0.4)]';
    if (voiceState === 'speaking') return 'shadow-[0_0_80px_rgba(100,84,149,0.6)]';
    return 'shadow-lg';
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-sans selection:bg-primary-container selection:text-on-primary-container relative">
      
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-xl">
        <div className="flex justify-between items-center w-full px-6 md:px-16 py-4 max-w-[800px] mx-auto">
          <h1 className="font-display text-2xl font-bold tracking-tight text-primary">MaaMate AI</h1>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${voiceState !== 'idle' ? 'bg-green-400 animate-pulse' : 'bg-outline-variant'}`} title={voiceState} />
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button onClick={() => { clearUser(); api.logout(); }} className="text-outline hover:text-primary transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="text-primary hover:opacity-80 transition-opacity active:scale-95" title="Sign In">
                <UserCircle className="w-8 h-8" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.main
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.main>
      </AnimatePresence>

      {/* Global Voice Orb - Expanded overlay when active */}
      <div className={`fixed inset-0 z-[60] flex items-center justify-center transition-all duration-500 ease-in-out pointer-events-none ${micActive ? 'bg-background/90 backdrop-blur-xl pointer-events-auto' : 'bg-transparent'}`}>
        
      {micActive && (
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 text-center animate-fade-in w-full px-6">
            <p className={`text-sm font-medium mb-3 ${voiceState === 'listening' ? 'text-green-500' : voiceState === 'processing' ? 'text-amber-500' : voiceState === 'speaking' ? 'text-primary' : 'text-outline'}`}>
              {voiceStateLabel()}
            </p>

            {/* Show transcript when user is speaking or AI is processing */}
            {lastTranscript && (voiceState === 'listening' || voiceState === 'processing') && (
              <p className="text-on-surface-variant text-lg italic mb-4">"{lastTranscript}"</p>
            )}

            {/* Show AI response when speaking or after finished */}
            {lastResponse && (voiceState === 'speaking' || voiceState === 'processing' || voiceState === 'idle') && (
              <div className="max-w-md mx-auto">
                <p className="text-on-surface text-lg leading-relaxed bg-surface/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-sm">
                  {lastResponse}
                </p>
              </div>
            )}

            {voiceState === 'idle' && !lastResponse && (
              <h2 className="font-display text-3xl font-semibold text-on-surface">How can I help you today?</h2>
            )}
          </div>
        )}
        
        <div className={`absolute transition-all duration-500 ease-in-out flex flex-col items-center justify-center pointer-events-auto ${micActive ? 'top-[55%] left-[50%] -translate-x-1/2 -translate-y-1/2' : 'bottom-[7rem] left-[50%] -translate-x-1/2'}`}>
           <button 
             onClick={handleMicToggle}
             className={`rounded-full flex items-center justify-center transition-all active:scale-95 z-20 bg-gradient-to-tr from-primary via-primary-container to-secondary-container voice-orb-glow hover:scale-105 ${
               micActive 
                 ? `w-24 h-24 ${orbAnimation()}`
                 : 'w-16 h-16 animate-pulse shadow-lg'
             }`}
           >
             <Mic className={`text-on-primary ${micActive ? 'w-10 h-10' : 'w-8 h-8'}`} />
           </button>
        </div>
        
        {micActive && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-4">
            {voiceState === 'idle' && (
              <button 
                onClick={startListening}
                className="px-8 py-3 bg-primary text-on-primary rounded-full shadow-lg font-bold text-sm active:scale-95 pointer-events-auto"
              >
                Listen Again
              </button>
            )}
            <button 
               onClick={() => { stopListening(); setMicActive(false); }}
               className="px-8 py-3 bg-surface text-primary rounded-full shadow-lg font-bold text-sm active:scale-95 pointer-events-auto border border-primary/20"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-surface/80 backdrop-blur-xl border-t border-primary/5">
        <NavButton 
          icon={<HomeIcon className="w-6 h-6" />} 
          label="Home" 
          isActive={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
        />
        <NavButton 
          icon={<Radio className="w-6 h-6" />} 
          label="Monitor" 
          isActive={activeTab === 'monitor'} 
          onClick={() => setActiveTab('monitor')} 
        />
        <NavButton 
          icon={<BookOpen className="w-6 h-6" />} 
          label="Stories" 
          isActive={activeTab === 'stories'} 
          onClick={() => setActiveTab('stories')} 
        />
        <NavButton 
          icon={<Calendar className="w-6 h-6" />} 
          label="Planner" 
          isActive={activeTab === 'planner'} 
          onClick={() => setActiveTab('planner')} 
        />
      </nav>

      {/* Auth Modal */}
      <AuthModal />
    </div>
  );
}

function NavButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center px-5 py-2 transition-all active:scale-90 duration-300 ${
        isActive 
          ? 'bg-primary-container/30 text-primary font-semibold rounded-full' 
          : 'text-outline hover:bg-surface-variant/50 hover:text-on-surface-variant rounded-full'
      }`}
    >
      <div className="mb-1">
         {icon}
      </div>
      <span className="text-[12px] font-medium leading-none">{label}</span>
    </button>
  );
}
