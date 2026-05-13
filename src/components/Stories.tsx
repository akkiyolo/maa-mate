import { useState, useRef } from 'react';
import { BookOpen, Heart, Music, PlayCircle, Repeat, Volume2, Pause, X, Loader2, CloudRain, Waves, Radio, HeartPulse, Sparkles } from 'lucide-react';
import { useAppStore } from '../store';
import { api } from '../services/api';

const STORY_CATEGORIES = [
  { id: 'bedtime', label: 'Bedtime Stories', emoji: '🌙', color: 'bg-primary-container/30 border-primary/20' },
  { id: 'panchatantra', label: 'Panchatantra', emoji: '🦊', color: 'bg-secondary-container/30 border-secondary/20' },
  { id: 'animal', label: 'Animal Stories', emoji: '🐾', color: 'bg-tertiary-container/30 border-tertiary/20' },
  { id: 'akbar-birbal', label: 'Akbar & Birbal', emoji: '👑', color: 'bg-orange-100 border-orange-200' },
];

const SOUND_CATEGORIES = [
  { id: 'lullaby', label: 'Lullabies', icon: Music, color: 'text-primary' },
  { id: 'rain', label: 'Rain', icon: CloudRain, color: 'text-tertiary' },
  { id: 'ocean', label: 'Ocean', icon: Waves, color: 'text-blue-500' },
  { id: 'whitenoise', label: 'White Noise', icon: Radio, color: 'text-outline' },
  { id: 'heartbeat', label: 'Heartbeat', icon: HeartPulse, color: 'text-secondary' },
];

export default function Stories() {
  const {
    lullabies,
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    playerCategory,
    setPlayerCategory,
    currentStory,
    setCurrentStory,
    storyCategory,
    setStoryCategory,
    isStoryLoading,
    setIsStoryLoading,
  } = useAppStore();

  const [showStoryModal, setShowStoryModal] = useState(false);
  const [isSpeakingStory, setIsSpeakingStory] = useState(false);

  const filteredTracks = lullabies.filter(l => l.category === playerCategory);

  const handlePlayTrack = (track: typeof lullabies[0]) => {
    if (currentTrack?.id === track.id && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleGenerateStory = async (category: string) => {
    setStoryCategory(category);
    setIsStoryLoading(true);
    setShowStoryModal(true);

    try {
      const result = await api.generateStory(category);
      setCurrentStory(result.story);
    } catch {
      setCurrentStory(`Once upon a time, in a beautiful land far away, there lived a kind little creature who loved to help everyone they met. Every night, under a blanket of twinkling stars, they would share stories of friendship and love...\n\n(AI story generation requires the backend server to be running. Start it with: npx tsx server.ts)`);
    }
    setIsStoryLoading(false);
  };

  const storyAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleNarrateStory = async () => {
    if (!currentStory) return;

    if (isSpeakingStory) {
      // Stop narration
      if (storyAudioRef.current) {
        storyAudioRef.current.pause();
        storyAudioRef.current = null;
      }
      window.speechSynthesis?.cancel();
      setIsSpeakingStory(false);
      return;
    }

    setIsSpeakingStory(true);
    
    try {
      // Use ElevenLabs for narration via backend
      const audioBlob = await api.textToSpeech(currentStory.slice(0, 5000), 'story_narrator');
      
      if (audioBlob && audioBlob.size > 0) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        storyAudioRef.current = audio;
        
        audio.onended = () => {
          setIsSpeakingStory(false);
          URL.revokeObjectURL(audioUrl);
          storyAudioRef.current = null;
        };
        audio.onerror = () => {
          setIsSpeakingStory(false);
          URL.revokeObjectURL(audioUrl);
          storyAudioRef.current = null;
        };
        await audio.play();
      } else {
        // Fallback to browser TTS
        const utterance = new SpeechSynthesisUtterance(currentStory);
        utterance.rate = 0.85;
        utterance.pitch = 1.1;
        utterance.onend = () => setIsSpeakingStory(false);
        utterance.onerror = () => setIsSpeakingStory(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setIsSpeakingStory(false);
    }
  };

  return (
    <div className="pb-32 pt-24 px-6 md:px-16 max-w-[800px] mx-auto min-h-screen space-y-10 animate-fade-in">

      {/* YouTube Player - Fixed at top when playing */}
      {currentTrack && (
        <section className="relative">
          <div className="glass-card rounded-3xl overflow-hidden">
            {/* YouTube Embed */}
            <div className="aspect-video w-full bg-black rounded-t-3xl overflow-hidden relative">
              {isPlaying ? (
                <iframe
                  key={currentTrack.youtubeId}
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1&loop=1&playlist=${currentTrack.youtubeId}&rel=0`}
                  title={currentTrack.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary-container/30">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="w-20 h-20 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                  >
                    <PlayCircle className="w-10 h-10" />
                  </button>
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-on-surface">{currentTrack.title}</h3>
                <p className="text-on-surface-variant text-sm">{currentTrack.artist} • {currentTrack.duration}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => { setCurrentTrack(null); setIsPlaying(false); }}
                  className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-colors active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sound Categories */}
      <section>
        <h3 className="font-display text-xl font-medium text-primary mb-4 px-2">🎵 Calming Sounds</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {SOUND_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setPlayerCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
                playerCategory === cat.id
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Track List */}
        <div className="mt-4 space-y-3">
          {filteredTracks.map((track) => (
            <div
              key={track.id}
              onClick={() => handlePlayTrack(track)}
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${
                currentTrack?.id === track.id
                  ? 'bg-primary-container/30 border border-primary/20'
                  : 'bg-surface-container-low hover:bg-surface-container'
              }`}
            >
              <div className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center ${
                currentTrack?.id === track.id && isPlaying
                  ? 'bg-primary text-on-primary'
                  : 'bg-primary-container/50'
              }`}>
                {currentTrack?.id === track.id && isPlaying ? (
                  <div className="flex items-end gap-0.5 h-6">
                    <div className="w-1 bg-on-primary rounded-full animate-[bounce_0.6s_infinite]" style={{ height: '60%' }} />
                    <div className="w-1 bg-on-primary rounded-full animate-[bounce_0.8s_infinite]" style={{ height: '100%' }} />
                    <div className="w-1 bg-on-primary rounded-full animate-[bounce_0.7s_infinite]" style={{ height: '40%' }} />
                    <div className="w-1 bg-on-primary rounded-full animate-[bounce_0.9s_infinite]" style={{ height: '80%' }} />
                  </div>
                ) : (
                  <Music className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-on-surface truncate">{track.title}</h4>
                <p className="text-sm text-on-surface-variant truncate">{track.artist} • {track.duration}</p>
              </div>
              <button className="text-primary">
                {currentTrack?.id === track.id && isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <PlayCircle className="w-8 h-8" />
                )}
              </button>
            </div>
          ))}
          {filteredTracks.length === 0 && (
            <div className="text-center py-8 text-on-surface-variant">
              <Music className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No tracks in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* AI Stories Section */}
      <section>
        <h3 className="font-display text-xl font-medium text-primary mb-4 px-2">📖 AI Stories</h3>
        <p className="text-on-surface-variant text-sm mb-6 px-2">
          Let MaaMate generate and narrate a personalized bedtime story for your little one.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {STORY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleGenerateStory(cat.id)}
              className={`group flex flex-col items-center p-6 rounded-3xl border transition-all hover:-translate-y-1 hover:shadow-md active:scale-95 ${cat.color}`}
            >
              <span className="text-4xl mb-3">{cat.emoji}</span>
              <span className="text-sm font-semibold text-on-surface">{cat.label}</span>
              <span className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Generated
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Story Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-xl overflow-y-auto">
          <div className="max-w-[700px] mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-primary font-medium">
                  {STORY_CATEGORIES.find(c => c.id === storyCategory)?.emoji} {STORY_CATEGORIES.find(c => c.id === storyCategory)?.label}
                </p>
                <h2 className="font-display text-2xl font-semibold text-on-surface">AI Generated Story</h2>
              </div>
              <button
                onClick={() => {
                  setShowStoryModal(false);
                  if (storyAudioRef.current) {
                    storyAudioRef.current.pause();
                    storyAudioRef.current = null;
                  }
                  window.speechSynthesis?.cancel();
                  setIsSpeakingStory(false);
                }}
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isStoryLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-on-surface-variant font-medium">Creating a magical story...</p>
                <p className="text-sm text-outline mt-1">Powered by Groq AI + ElevenLabs Voice</p>
              </div>
            ) : (
              <>
                <div className="prose prose-lg max-w-none mb-8">
                  <div className="bg-surface p-8 rounded-3xl border border-primary/10 shadow-sm leading-relaxed text-on-surface whitespace-pre-wrap font-sans">
                    {currentStory}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handleNarrateStory}
                    className={`px-8 py-4 rounded-full font-medium text-lg flex items-center gap-3 transition-all active:scale-95 shadow-lg ${
                      isSpeakingStory
                        ? 'bg-secondary text-on-primary animate-pulse'
                        : 'bg-primary text-on-primary hover:opacity-90'
                    }`}
                  >
                    {isSpeakingStory ? (
                      <>
                        <Pause className="w-5 h-5" />
                        Stop Narrating
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5" />
                        Narrate Story
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleGenerateStory(storyCategory)}
                    className="px-8 py-4 bg-surface-container text-primary rounded-full font-medium text-lg flex items-center gap-3 hover:bg-surface-container-high transition-all active:scale-95"
                  >
                    <Repeat className="w-5 h-5" />
                    New Story
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
