import { useCallback, useRef } from 'react';
import { useAppStore } from '../store';
import { api } from '../services/api';

interface SpeechRecognitionEvent { results: SpeechRecognitionResultList; resultIndex: number; }
interface SpeechRecognitionErrorEvent { error: string; }
declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; } }

export function useVoiceAssistant() {
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    setVoiceState, setLastTranscript, setLastResponse, addConversation,
    setMicActive, setMonitoringActive, setIsPlaying, setCurrentTrack,
    setStoryCategory, setCurrentStory, setIsStoryLoading, setActiveTab,
    setWebcamActive,
  } = useAppStore();

  // ─── ElevenLabs TTS ────────────────────────────────────────────────
  const speak = useCallback(async (text: string, voiceType: string = 'calm_mother') => {
    setVoiceState('speaking');
    try {
      const audioBlob = await api.textToSpeech(text, voiceType);
      if (audioBlob && audioBlob.size > 0) {
        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        return new Promise<void>((resolve) => {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.onended = () => { setVoiceState('idle'); URL.revokeObjectURL(audioUrl); audioRef.current = null; resolve(); };
          audio.onerror = () => { setVoiceState('idle'); URL.revokeObjectURL(audioUrl); audioRef.current = null; fallbackSpeak(text).then(resolve); };
          audio.play().catch(() => fallbackSpeak(text).then(resolve));
        });
      } else { return fallbackSpeak(text); }
    } catch { return fallbackSpeak(text); }
  }, [setVoiceState]);

  const fallbackSpeak = useCallback((text: string) => {
    return new Promise<void>((resolve) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.9; u.pitch = 1.1; u.volume = 0.9;
        const voices = window.speechSynthesis.getVoices();
        const pv = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google UK English Female') || v.name.includes('Zira') || v.lang.startsWith('en'));
        if (pv) u.voice = pv;
        u.onend = () => { setVoiceState('idle'); resolve(); };
        u.onerror = () => { setVoiceState('idle'); resolve(); };
        window.speechSynthesis.speak(u);
      } else { setVoiceState('idle'); resolve(); }
    });
  }, [setVoiceState]);

  // ─── Execute ALL intents with auto-navigation ──────────────────────
  const executeIntent = useCallback(async (intent: string, params: any) => {
    const state = useAppStore.getState();
    console.log('🎯 Executing intent:', intent, params);

    switch (intent) {
      // ── Monitoring ─────────────────────────────────
      case 'start_monitoring':
        setMonitoringActive(true);
        setWebcamActive(true);
        setActiveTab('monitor');
        api.startMonitoring().catch(() => {});
        setTimeout(() => setMicActive(false), 1500);
        break;

      case 'stop_monitoring':
        setMonitoringActive(false);
        setWebcamActive(false);
        api.stopMonitoring().catch(() => {});
        break;

      case 'check_baby':
        setActiveTab('monitor');
        setTimeout(() => setMicActive(false), 1500);
        break;

      // ── Lullabies & Sounds ─────────────────────────
      case 'play_lullaby': {
        const lullabies = state.lullabies;
        const type = params?.type || 'lullaby';
        let tracks = lullabies.filter(l => l.category === type);
        if (tracks.length === 0) tracks = lullabies.filter(l => l.category === 'lullaby');
        if (tracks.length > 0) {
          const pick = tracks[Math.floor(Math.random() * tracks.length)];
          setCurrentTrack(pick);
          setIsPlaying(true);
          setActiveTab('stories');
          console.log('🎵 Playing:', pick.title);
        }
        setTimeout(() => setMicActive(false), 1500);
        break;
      }

      case 'stop_lullaby':
        setIsPlaying(false);
        setCurrentTrack(null);
        break;

      // ── Stories ─────────────────────────────────────
      case 'tell_story': {
        const cat = params?.category || 'bedtime';
        setStoryCategory(cat);
        setIsStoryLoading(true);
        setActiveTab('stories');
        setTimeout(() => setMicActive(false), 1500);
        try {
          const r = await api.generateStory(cat);
          setCurrentStory(r.story);
          // Auto-open the story modal
          state.setShowStoryModal?.(true);
        } catch {
          setCurrentStory('Once upon a time, in a beautiful garden...');
        }
        setIsStoryLoading(false);
        break;
      }

      // ── Logging ────────────────────────────────────
      case 'log_feeding':
        state.addLog({ id: Date.now().toString(), type: 'feeding', details: params?.details || 'Fed via voice', timestamp: new Date().toISOString() });
        api.createLog('feeding', params?.details || 'Fed via voice').catch(() => {});
        setActiveTab('planner');
        setTimeout(() => setMicActive(false), 2000);
        break;

      case 'log_sleep':
        state.addLog({ id: Date.now().toString(), type: 'sleep', details: params?.details || 'Sleep logged via voice', timestamp: new Date().toISOString() });
        api.createLog('sleep', params?.details || 'Sleep logged via voice').catch(() => {});
        setActiveTab('planner');
        setTimeout(() => setMicActive(false), 2000);
        break;

      case 'log_medicine':
        state.addLog({ id: Date.now().toString(), type: 'medicine', details: params?.details || 'Medicine via voice', timestamp: new Date().toISOString() });
        api.createLog('medicine', params?.details || 'Medicine via voice').catch(() => {});
        setActiveTab('planner');
        setTimeout(() => setMicActive(false), 2000);
        break;

      case 'log_diaper':
        state.addLog({ id: Date.now().toString(), type: 'diaper', details: params?.details || 'Diaper changed via voice', timestamp: new Date().toISOString() });
        api.createLog('diaper', params?.details || 'Diaper changed via voice').catch(() => {});
        setActiveTab('planner');
        setTimeout(() => setMicActive(false), 2000);
        break;

      // ── Reminders ──────────────────────────────────
      case 'create_reminder': {
        const rem = { id: Date.now().toString(), text: params?.text || 'Voice reminder', category: params?.category || 'general', time: params?.time || 'Soon', createdAt: new Date().toISOString(), done: false };
        state.addReminder(rem);
        api.createReminder(rem.text, rem.category, rem.time).catch(() => {});
        setActiveTab('planner');
        setTimeout(() => setMicActive(false), 2000);
        break;
      }

      // ── Navigation ─────────────────────────────────
      case 'navigate':
        if (params?.tab) setActiveTab(params.tab);
        setTimeout(() => setMicActive(false), 1000);
        break;

      // ── Emotional support & chat ───────────────────
      case 'emotional_support':
      case 'chat':
        // Just speak the response, no navigation
        break;

      default:
        console.log('Unknown intent:', intent);
        break;
    }
  }, [setMonitoringActive, setWebcamActive, setActiveTab, setMicActive, setCurrentTrack, setIsPlaying, setStoryCategory, setIsStoryLoading, setCurrentStory]);

  // ─── Process voice with AI ─────────────────────────────────────────
  const processWithAI = useCallback(async (text: string) => {
    setVoiceState('processing');
    setLastTranscript(text);
    addConversation('user', text);
    console.log('🎤 Processing:', text);

    try {
      const result = await api.processVoice(text);
      const response = result.response || "I'm here for you. Can you say that again?";
      console.log('🤖 Response:', response, '| Intent:', result.intent);
      setLastResponse(response);
      addConversation('assistant', response);

      // Execute intent FIRST (navigate/action), then speak
      if (result.intent && result.intent.intent) {
        await executeIntent(result.intent.intent, result.intent.params);
      }

      // Speak response
      await speak(response, 'calm_mother');

      // After speaking, auto-restart listening if mic is still active
      // This enables continuous, hands-free conversation
      const { micActive, voiceState } = useAppStore.getState();
      if (micActive && voiceState === 'idle') {
        setTimeout(() => {
          const stillActive = useAppStore.getState().micActive;
          if (stillActive) startListeningInternal();
        }, 300);
      }
    } catch (error) {
      console.error('Voice error:', error);
      const fb = "I'm having a little trouble right now, but I'm still here!";
      setLastResponse(fb);
      addConversation('assistant', fb);
      await speak(fb);
    }
  }, [speak, executeIntent, setVoiceState, setLastTranscript, setLastResponse, addConversation]);

  // ─── Internal start listening (no state toggle) ────────────────────
  const startListeningInternal = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch {} }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { console.log('🎤 Listening...'); setVoiceState('listening'); };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalT = '', interimT = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalT += t; else interimT += t;
      }
      if (interimT) setLastTranscript(interimT);
      if (finalT) { console.log('🎤 Heard:', finalT); processWithAI(finalT); }
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech error:', event.error);
      if (event.error === 'no-speech') setLastResponse("I didn't hear anything. Tap the mic to try again!");
      else if (event.error !== 'aborted') setLastResponse("I had trouble hearing. Let's try again!");
      setVoiceState('idle');
    };
    recognition.onend = () => { if (useAppStore.getState().voiceState === 'listening') setVoiceState('idle'); };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) {
      console.error('Mic start failed:', e);
      setLastResponse("Microphone access needed. Allow it in browser settings.");
      setVoiceState('idle');
    }
  }, [processWithAI, setVoiceState, setLastTranscript, setLastResponse]);

  // ─── Public start/stop/toggle ──────────────────────────────────────
  const startListening = useCallback(() => { startListeningInternal(); }, [startListeningInternal]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch {} recognitionRef.current = null; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    window.speechSynthesis?.cancel();
    setVoiceState('idle');
    setMicActive(false);
  }, [setVoiceState, setMicActive]);

  const toggleMic = useCallback(() => {
    const { micActive } = useAppStore.getState();
    if (micActive) { stopListening(); } else { setMicActive(true); startListening(); }
  }, [startListening, stopListening, setMicActive]);

  return { startListening, stopListening, toggleMic, speak, processWithAI };
}
