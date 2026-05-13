import { create } from 'zustand';

// ─── TYPES ──────────────────────────────────────────────────────────────

export interface Reminder {
  id: string;
  text: string;
  category: string;
  time: string;
  createdAt: string;
  done: boolean;
}

export interface LogEntry {
  id: string;
  type: 'feeding' | 'sleep' | 'medicine' | 'diaper';
  details: string;
  timestamp: string;
}

export interface MonitoringAlert {
  id: string;
  type: 'cry_detected' | 'motion_detected' | 'baby_awake' | 'silence_detected' | 'room_alert';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TimelineEvent {
  id: string;
  type: 'cry' | 'motion' | 'wakeup' | 'sleep';
  title: string;
  description: string;
  time: string;
  timestamp: string;
}

export interface LullabyTrack {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  category: string;
  duration: string;
}

// ─── APP STORE ──────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  babyName: string;
  babyDob: string;
}

interface AppState {
  // Auth
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (user: UserProfile) => void;
  clearUser: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Voice
  micActive: boolean;
  setMicActive: (active: boolean) => void;
  voiceState: 'idle' | 'listening' | 'processing' | 'speaking';
  setVoiceState: (state: 'idle' | 'listening' | 'processing' | 'speaking') => void;
  lastTranscript: string;
  setLastTranscript: (text: string) => void;
  lastResponse: string;
  setLastResponse: (text: string) => void;
  conversationLog: Array<{ role: 'user' | 'assistant'; text: string; timestamp: string }>;
  addConversation: (role: 'user' | 'assistant', text: string) => void;

  // Monitoring
  monitoringActive: boolean;
  setMonitoringActive: (active: boolean) => void;
  babyStatus: 'sleeping' | 'awake' | 'crying' | 'moving';
  setBabyStatus: (status: 'sleeping' | 'awake' | 'crying' | 'moving') => void;
  cryLevel: number;
  setCryLevel: (level: number) => void;
  motionLevel: number;
  setMotionLevel: (level: number) => void;
  alerts: MonitoringAlert[];
  addAlert: (alert: MonitoringAlert) => void;
  timeline: TimelineEvent[];
  addTimelineEvent: (event: TimelineEvent) => void;
  webcamActive: boolean;
  setWebcamActive: (active: boolean) => void;

  // Planner
  reminders: Reminder[];
  setReminders: (reminders: Reminder[]) => void;
  addReminder: (reminder: Reminder) => void;
  toggleReminder: (id: string) => void;
  logs: LogEntry[];
  setLogs: (logs: LogEntry[]) => void;
  addLog: (log: LogEntry) => void;

  // Stories & Lullabies
  currentStory: string | null;
  setCurrentStory: (story: string | null) => void;
  storyCategory: string;
  setStoryCategory: (category: string) => void;
  isStoryLoading: boolean;
  setIsStoryLoading: (loading: boolean) => void;
  lullabies: LullabyTrack[];
  setLullabies: (tracks: LullabyTrack[]) => void;
  currentTrack: LullabyTrack | null;
  setCurrentTrack: (track: LullabyTrack | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  showStoryModal: boolean;
  setShowStoryModal: (show: boolean) => void;
  playerCategory: string;
  setPlayerCategory: (cat: string) => void;

  // WebSocket
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  showAuthModal: false,
  setShowAuthModal: (show) => set({ showAuthModal: show }),

  // Navigation
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Voice
  micActive: false,
  setMicActive: (active) => set({ micActive: active }),
  voiceState: 'idle',
  setVoiceState: (state) => set({ voiceState: state }),
  lastTranscript: '',
  setLastTranscript: (text) => set({ lastTranscript: text }),
  lastResponse: '',
  setLastResponse: (text) => set({ lastResponse: text }),
  conversationLog: [],
  addConversation: (role, text) =>
    set((state) => ({
      conversationLog: [...state.conversationLog.slice(-20), { role, text, timestamp: new Date().toISOString() }],
    })),

  // Monitoring
  monitoringActive: false,
  setMonitoringActive: (active) => set({ monitoringActive: active }),
  babyStatus: 'sleeping',
  setBabyStatus: (status) => set({ babyStatus: status }),
  cryLevel: 20,
  setCryLevel: (level) => set({ cryLevel: level }),
  motionLevel: 15,
  setMotionLevel: (level) => set({ motionLevel: level }),
  alerts: [
    {
      id: '1',
      type: 'room_alert',
      message: 'Nursery temperature has risen to 24°C. Consider adjusting the thermostat.',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      severity: 'medium',
    },
  ],
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 20),
    })),
  timeline: [
    { id: '1', type: 'wakeup', title: 'Aarav woke up', description: 'Soft stirring detected for 45 seconds.', time: '08:14 AM', timestamp: new Date().toISOString() },
    { id: '2', type: 'motion', title: 'Movement detected', description: 'Roll-over motion detected in center of crib.', time: '07:52 AM', timestamp: new Date().toISOString() },
    { id: '3', type: 'cry', title: 'Cry alert', description: 'Level 2 fussiness detected. Resolved within 3 minutes.', time: '06:30 AM', timestamp: new Date().toISOString() },
  ],
  addTimelineEvent: (event) =>
    set((state) => ({
      timeline: [event, ...state.timeline].slice(0, 30),
    })),
  webcamActive: false,
  setWebcamActive: (active) => set({ webcamActive: active }),

  // Planner
  reminders: [
    { id: '1', text: 'Order more diapers', category: 'general', time: 'Today, 5:00 PM', createdAt: new Date().toISOString(), done: false },
    { id: '2', text: 'Tummy time session', category: 'activity', time: 'Tomorrow, 10:00 AM', createdAt: new Date().toISOString(), done: false },
  ],
  setReminders: (reminders) => set({ reminders }),
  addReminder: (reminder) =>
    set((state) => ({
      reminders: [...state.reminders, reminder],
    })),
  toggleReminder: (id) =>
    set((state) => ({
      reminders: state.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)),
    })),
  logs: [
    { id: '1', type: 'feeding', details: 'Left Side', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: '2', type: 'sleep', details: 'Napping', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  ],
  setLogs: (logs) => set({ logs }),
  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs],
    })),

  // Stories & Lullabies
  currentStory: null,
  setCurrentStory: (story) => set({ currentStory: story }),
  storyCategory: 'bedtime',
  setStoryCategory: (category) => set({ storyCategory: category }),
  isStoryLoading: false,
  setIsStoryLoading: (loading) => set({ isStoryLoading: loading }),
  lullabies: [],
  setLullabies: (tracks) => set({ lullabies: tracks }),
  currentTrack: null,
  setCurrentTrack: (track) => set({ currentTrack: track }),
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  showStoryModal: false,
  setShowStoryModal: (show) => set({ showStoryModal: show }),
  playerCategory: 'lullaby',
  setPlayerCategory: (cat) => set({ playerCategory: cat }),

  // WebSocket
  wsConnected: false,
  setWsConnected: (connected) => set({ wsConnected: connected }),
}));
