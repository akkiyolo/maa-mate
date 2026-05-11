import { Calendar, Heart, BookOpen, Radio } from 'lucide-react';

export default function Home({ onActivateMic, onNavigate }: { onActivateMic: () => void, onNavigate: (tab: string) => void }) {
  return (
    <div className="pb-32 pt-24 px-6 md:px-16 max-w-[800px] mx-auto animate-fade-in">
      <section className="text-center py-16">
        <div className="relative mb-12 flex justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-0 voice-orb-glow animate-pulse rounded-full opacity-50"></div>
            <div 
              className="absolute inset-4 bg-gradient-to-tr from-primary via-primary-container to-secondary-container rounded-full shadow-[0_0_40px_rgba(100,84,149,0.3)] animate-pulse hover:scale-105 transition-transform cursor-pointer"
              onClick={onActivateMic}
            ></div>
            <div className="relative z-10 text-white pointer-events-none">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            </div>
          </div>
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4 text-on-surface">
          Your AI parenting companion.
        </h2>
        <p className="text-lg text-on-surface-variant mb-10 max-w-[500px] mx-auto">
          Hands-free assistance for every nap, every feeding, and every milestone. Because being a mom is a superpower, and every hero needs a mate.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
          <button 
            onClick={() => onNavigate('monitor')}
            className="w-full sm:w-auto px-10 py-4 bg-primary text-on-primary rounded-full font-medium text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            Start Monitoring
          </button>
          <button 
            onClick={onActivateMic}
            className="w-full sm:w-auto px-10 py-4 bg-surface-container-high text-primary rounded-full font-medium text-lg hover:bg-surface-container transition-all active:scale-95"
          >
            Talk to MaaMate
          </button>
        </div>
      </section>

      <section className="py-10">
        <h3 className="font-display text-2xl font-semibold text-center mb-10 text-on-surface">Care for them, and you.</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => onNavigate('monitor')}
            className="glass-card p-8 rounded-2xl col-span-1 md:col-span-2 overflow-hidden relative group cursor-pointer"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2">
                <Radio className="text-secondary w-10 h-10 mb-4" />
                <h4 className="font-display text-2xl font-medium mb-2 text-on-surface">Smart Baby Monitoring</h4>
                <p className="text-on-surface-variant">Real-time webcam and mic alerts that distinguish between a restless turn and a wake-up cry.</p>
              </div>
              <div className="w-full md:w-1/2 aspect-video rounded-xl bg-surface-container overflow-hidden">
                <img 
                  alt="Baby sleeping peacefully" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuVJuuJbT8fby0P-w8-5b8S99SELS9kH3KvHv92z_PWkqXTT9ZYBSM-4JlWnFHCgi9d-_mojFcpTe1dXHgJVJDylB1YiKCRNBQaTWm7GLWkMn2_q5GiawH5E_fM3mlLdmIO6fdOwye4Ix4j0UbPC5Mn6LWkROe8RpY756t-VMIFlVvFcHkP_c2ZcwwaDKzgnbVfOSAh_5REEeqToE1eM7CNxUMSNg2RfQsdQSzm4bW4rlx4ixBj8vCffazRB50kKGkUdQ6gBRzzNLB"
                />
              </div>
            </div>
          </div>

          <div 
            onClick={onActivateMic}
            className="glass-card p-8 rounded-2xl hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="bg-tertiary-container/30 w-12 h-12 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tertiary"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            </div>
            <h4 className="font-display text-xl font-medium mb-2 text-on-surface">Voice Assistant</h4>
            <p className="text-on-surface-variant">Hands-free interaction while your arms are full. Set timers, log feeds, and ask for advice.</p>
          </div>

          <div 
            onClick={() => onNavigate('planner')}
            className="glass-card p-8 rounded-2xl hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="bg-primary-container/30 w-12 h-12 rounded-full flex items-center justify-center mb-6">
              <Calendar className="text-primary w-6 h-6" />
            </div>
            <h4 className="font-display text-xl font-medium mb-2 text-on-surface">Parent Planner</h4>
            <p className="text-on-surface-variant">Automated scheduling for vaccinations, feeding cycles, and your own much-needed self-care breaks.</p>
          </div>

          <div 
             onClick={() => onNavigate('stories')}
             className="glass-card p-8 rounded-2xl hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="bg-secondary-container/30 w-12 h-12 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="text-secondary w-6 h-6" />
            </div>
            <h4 className="font-display text-xl font-medium mb-2 text-on-surface">AI Stories</h4>
            <p className="text-on-surface-variant">Personalized bedtime stories and lullabies narrated in a soothing AI voice to help your little one drift off.</p>
          </div>

          <div className="glass-card p-8 rounded-2xl hover:shadow-xl transition-shadow">
            <div className="bg-secondary-container/50 w-12 h-12 rounded-full flex items-center justify-center mb-6">
              <Heart className="text-secondary w-6 h-6" />
            </div>
            <h4 className="font-display text-xl font-medium mb-2 text-on-surface">Emotional Support</h4>
            <p className="text-on-surface-variant">Check-ins for your mental well-being, providing affirmations and breathing exercises when you need them most.</p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="bg-primary p-10 md:p-16 rounded-3xl text-on-primary text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary opacity-50"></div>
          <div className="relative z-10">
            <h3 className="font-display text-3xl font-semibold mb-4">Try it now</h3>
            <p className="mb-10 text-lg opacity-90">Say "Hey MaaMate, start a 2-hour sleep timer"</p>
            <div className="flex items-end justify-center gap-1 h-12 mb-10">
              <div className="w-1 bg-on-primary/30 rounded-full h-4 animate-[bounce_1s_infinite]"></div>
              <div className="w-1 bg-on-primary/50 rounded-full h-8 animate-[bounce_1.2s_infinite]"></div>
              <div className="w-1 bg-on-primary/80 rounded-full h-12 animate-[bounce_0.8s_infinite]"></div>
              <div className="w-1 bg-on-primary rounded-full h-6 animate-[bounce_1.5s_infinite]"></div>
              <div className="w-1 bg-on-primary/80 rounded-full h-10 animate-[bounce_1s_infinite]"></div>
              <div className="w-1 bg-on-primary/50 rounded-full h-5 animate-[bounce_1.3s_infinite]"></div>
              <div className="w-1 bg-on-primary/30 rounded-full h-8 animate-[bounce_0.9s_infinite]"></div>
            </div>
            <button 
              onClick={onActivateMic}
              className="px-8 py-3 bg-surface text-primary rounded-full font-bold text-sm tracking-wider hover:bg-white transition-colors active:scale-95"
            >
              ACTIVATE MIC
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
