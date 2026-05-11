import { useState } from 'react';
import { Home as HomeIcon, Radio, BookOpen, Calendar, UserCircle, Mic } from 'lucide-react';
import Home from './components/Home';
import Monitor from './components/Monitor';
import Stories from './components/Stories';
import Planner from './components/Planner';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [micActive, setMicActive] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onActivateMic={() => setMicActive(true)} onNavigate={setActiveTab} />;
      case 'monitor':
        return <Monitor />;
      case 'stories':
        return <Stories />;
      case 'planner':
        return <Planner />;
      default:
        return <Home onActivateMic={() => setMicActive(true)} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-sans selection:bg-primary-container selection:text-on-primary-container relative">
      
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-xl">
        <div className="flex justify-between items-center w-full px-6 md:px-16 py-4 max-w-[800px] mx-auto">
          <h1 className="font-display text-2xl font-bold tracking-tight text-primary">MaaMate AI</h1>
          <div className="flex items-center gap-4">
            <button className="text-primary hover:opacity-80 transition-opacity active:scale-95">
              <UserCircle className="w-8 h-8" />
            </button>
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

      {/* Global Voice Orb - shown if not actively taking full screen */}
      <div className={`fixed inset-0 z-[60] flex items-center justify-center transition-all duration-500 ease-in-out pointer-events-none ${micActive ? 'bg-background/90 backdrop-blur-xl pointer-events-auto' : 'bg-transparent'}`}>
        
        {micActive && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center animate-fade-in w-full px-6">
             <p className="text-primary font-medium mb-2 opacity-80 animate-pulse">Listening for your command...</p>
             <h2 className="font-display text-3xl font-semibold text-on-surface">How can I help you today?</h2>
          </div>
        )}
        
        <div className={`absolute transition-all duration-500 ease-in-out flex flex-col items-center justify-center pointer-events-auto ${micActive ? 'top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2' : 'bottom-[7rem] left-[50%] -translate-x-1/2'}`}>
           <button 
             onClick={() => setMicActive(!micActive)}
             className={`rounded-full flex items-center justify-center transition-all active:scale-95 z-20 ${
               micActive 
                 ? 'w-24 h-24 bg-gradient-to-tr from-primary via-primary-container to-secondary-container voice-orb-glow animate-ping shadow-[0_0_60px_rgba(100,84,149,0.4)]'
                 : 'w-16 h-16 bg-gradient-to-tr from-primary via-primary-container to-secondary-container voice-orb-glow hover:scale-105 animate-pulse shadow-lg'
             }`}
           >
             <Mic className={`text-on-primary ${micActive ? 'w-10 h-10' : 'w-8 h-8'}`} />
           </button>
           
           {!micActive && activeTab === 'planner' && (
             <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-primary/10 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-sm font-medium text-primary">"Log feeding"</span>
             </div>
           )}
        </div>
        
        {micActive && (
          <button 
             onClick={() => setMicActive(false)}
             className="absolute bottom-32 left-1/2 -translate-x-1/2 px-8 py-3 bg-surface text-primary rounded-full shadow-lg font-bold text-sm active:scale-95 pointer-events-auto"
          >
            Cancel
          </button>
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
