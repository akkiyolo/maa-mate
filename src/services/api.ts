const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('maamate_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export const api = {
  // ─── AUTH ──────────────────────────────────────────────────────────
  async register(name: string, email: string, password: string, babyName?: string, babyDob?: string) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ name, email, password, babyName, babyDob }),
    });
    const data = await res.json();
    if (data.token) localStorage.setItem('maamate_token', data.token);
    return data;
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) localStorage.setItem('maamate_token', data.token);
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/api/auth/me`, { headers: getHeaders() });
    return res.json();
  },

  async updateProfile(data: { name?: string; babyName?: string; babyDob?: string }) {
    const res = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data),
    });
    return res.json();
  },

  logout() { localStorage.removeItem('maamate_token'); },
  isLoggedIn() { return !!localStorage.getItem('maamate_token'); },

  // ─── VOICE ─────────────────────────────────────────────────────────
  async processVoice(text: string) {
    const res = await fetch(`${API_BASE}/api/voice/process`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ text }),
    });
    return res.json();
  },

  async textToSpeech(text: string, voiceType: string = 'calm_mother'): Promise<Blob | null> {
    try {
      const res = await fetch(`${API_BASE}/api/voice/tts`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ text, voiceType }),
      });
      if (!res.ok) return null;
      return await res.blob();
    } catch { return null; }
  },

  async textToSpeechStream(text: string, voiceType: string = 'calm_mother'): Promise<Response | null> {
    try {
      const res = await fetch(`${API_BASE}/api/voice/tts/stream`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ text, voiceType }),
      });
      return res.ok ? res : null;
    } catch { return null; }
  },

  // ─── STORIES ───────────────────────────────────────────────────────
  async generateStory(category: string) {
    const res = await fetch(`${API_BASE}/api/stories/generate`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ category }),
    });
    return res.json();
  },

  // ─── MONITORING ────────────────────────────────────────────────────
  async startMonitoring() { return (await fetch(`${API_BASE}/api/monitoring/start`, { method: 'POST', headers: getHeaders() })).json(); },
  async stopMonitoring() { return (await fetch(`${API_BASE}/api/monitoring/stop`, { method: 'POST', headers: getHeaders() })).json(); },
  async getMonitoringStatus() { return (await fetch(`${API_BASE}/api/monitoring/status`, { headers: getHeaders() })).json(); },
  async sendMonitoringAlert(type: string, details: string) {
    return (await fetch(`${API_BASE}/api/monitoring/alert`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ type, details }),
    })).json();
  },

  // ─── PLANNER ───────────────────────────────────────────────────────
  async getReminders() { return (await fetch(`${API_BASE}/api/planner/reminders`, { headers: getHeaders() })).json(); },
  async createReminder(text: string, category: string, time: string) {
    return (await fetch(`${API_BASE}/api/planner/reminders`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ text, category, time }),
    })).json();
  },
  async toggleReminder(id: string, done: boolean) {
    return (await fetch(`${API_BASE}/api/planner/reminders/${id}`, {
      method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ done }),
    })).json();
  },
  async getLogs() { return (await fetch(`${API_BASE}/api/planner/logs`, { headers: getHeaders() })).json(); },
  async createLog(type: string, details: string) {
    return (await fetch(`${API_BASE}/api/planner/logs`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ type, details }),
    })).json();
  },

  // ─── LULLABIES ─────────────────────────────────────────────────────
  async getLullabies() { return (await fetch(`${API_BASE}/api/lullabies`)).json(); },
  async getLullabiesByCategory(cat: string) { return (await fetch(`${API_BASE}/api/lullabies/${cat}`)).json(); },

  // ─── HEALTH ────────────────────────────────────────────────────────
  async healthCheck() { return (await fetch(`${API_BASE}/api/health`)).json(); },

  // ─── WEBSOCKET ─────────────────────────────────────────────────────
  createWebSocket(): WebSocket {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = API_BASE ? API_BASE.replace('http', 'ws') : `${protocol}//${window.location.host}`;
    return new WebSocket(`${host}/ws`);
  },
};
