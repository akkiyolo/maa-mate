import express from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { User, Log, Reminder, Alert, Conversation } from './models';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

// ─── CONFIG ────────────────────────────────────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || 'maamate-secret-key-2026';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/maamate';

const ELEVENLABS_VOICES: Record<string, string> = {
  calm_mother: 'EXAVITQu4vr4xnSDxMaL',
  ai_grandma: '21m00Tcm4TlvDq8ikWAM',
  story_narrator: 'MF3mGyEYCl7XYWbV9V6O',
};

// ─── MONGODB ───────────────────────────────────────────────────────────
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(MONGO_URI);
    console.log('   MongoDB: Connected ✓');
  } catch (err: any) {
    console.error('   MongoDB: Connection failed —', err.message);
  }
}

// ─── AUTH MIDDLEWARE ────────────────────────────────────────────────────
interface AuthRequest extends express.Request {
  userId?: string;
  userName?: string;
}

function authMiddleware(req: AuthRequest, _res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string };
      req.userId = decoded.id;
      req.userName = decoded.name;
    } catch {}
  }
  next(); // Always continue — endpoints handle missing userId gracefully
}

app.use(authMiddleware);

// ─── MONITORING (in-memory, per-session) ──────────────────────────────
let monitoring = { active: false, babyStatus: 'sleeping' as string, cryLevel: 20, motionLevel: 15, lastAlert: '' };
const conversationCache: Record<string, Array<{ role: 'user' | 'assistant' | 'system'; content: string }>> = {};

function broadcast(data: any) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((c) => { if (c.readyState === WebSocket.OPEN) c.send(msg); });
}

// ─── AUTH ENDPOINTS ────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, babyName, babyDob } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({ name, email: email.toLowerCase(), password, babyName: babyName || '', babyDob: babyDob || '' });
    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '30d' });

    // Seed default reminders
    await Reminder.create([
      { userId: user._id, text: 'Order more diapers', category: 'general', time: 'Today, 5:00 PM' },
      { userId: user._id, text: 'Tummy time session', category: 'activity', time: 'Tomorrow, 10:00 AM' },
    ]);

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, babyName: user.babyName, babyDob: user.babyDob } });
  } catch (err: any) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, babyName: user.babyName, babyDob: user.babyDob } });
  } catch (err: any) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const user = await User.findById(req.userId).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user._id, name: user.name, email: user.email, babyName: user.babyName, babyDob: user.babyDob });
});

app.patch('/api/auth/profile', async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const { name, babyName, babyDob } = req.body;
  const user = await User.findByIdAndUpdate(req.userId, { name, babyName, babyDob }, { new: true }).select('-password');
  res.json(user);
});

const SYSTEM_PROMPT = `You are MaaMate AI, a warm, emotionally supportive voice-first AI parenting assistant for Indian mothers.
You speak in a gentle, caring, concise tone (2-3 sentences max). You help hands-free — the mother should NEVER need to touch the screen.

CRITICAL: You MUST detect user intent and ALWAYS include the intent JSON block at the END of your response.

## INTENT FORMAT
[INTENT]{"intent":"action_name","params":{...}}[/INTENT]

## INTENT MAPPING — detect these from natural speech:

### Baby Monitoring
- "monitor baby" / "watch baby" / "start camera" / "check on baby" / "is baby ok" → start_monitoring
- "stop monitoring" / "turn off camera" → stop_monitoring
- "how is baby" / "baby status" / "check baby" → check_baby

### Lullabies & Sounds
- "play lullaby" / "play music" / "play song" / "sing" → play_lullaby {"type":"lullaby"}
- "play rain" / "rain sounds" → play_lullaby {"type":"rain"}
- "play ocean" / "waves" / "sea sounds" → play_lullaby {"type":"ocean"}
- "white noise" / "fan sound" / "shushing" → play_lullaby {"type":"whitenoise"}
- "heartbeat" / "womb sounds" → play_lullaby {"type":"heartbeat"}
- "stop music" / "stop playing" / "pause" → stop_lullaby

### Stories
- "tell story" / "bedtime story" / "tell me a story" → tell_story {"category":"bedtime"}
- "panchatantra" → tell_story {"category":"panchatantra"}
- "animal story" → tell_story {"category":"animal"}
- "akbar birbal" → tell_story {"category":"akbar-birbal"}

### Logging
- "log feed" / "baby fed" / "just fed" / "breastfed" / "bottle" → log_feeding {"details":"..."}
- "baby sleeping" / "put to sleep" / "nap time" / "log sleep" → log_sleep {"details":"..."}
- "gave medicine" / "vitamin drops" / "log medicine" → log_medicine {"details":"..."}
- "diaper change" / "changed diaper" / "log diaper" → log_diaper {"details":"..."}

### Reminders
- "remind me" / "set reminder" / "don't forget" → create_reminder {"text":"...","time":"...","category":"..."}

### Navigation
- "go to planner" / "open planner" / "show schedule" → navigate {"tab":"planner"}
- "go home" / "home page" → navigate {"tab":"home"}
- "show stories" / "go to stories" → navigate {"tab":"stories"}

### Emotional Support
- "I'm tired" / "exhausted" / "stressed" / "overwhelmed" / "scared" → emotional_support

ALWAYS include an intent. If the user is just chatting or asking a question, use: [INTENT]{"intent":"chat","params":{}}[/INTENT]
Context: Baby status is {babyStatus}, Monitoring is {monitoringActive}, Time: {time}`;

app.post('/api/voice/process', async (req: AuthRequest, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text' });

    const uid = req.userId || 'anonymous';
    if (!conversationCache[uid]) conversationCache[uid] = [];
    conversationCache[uid].push({ role: 'user', content: text });
    if (conversationCache[uid].length > 20) conversationCache[uid] = conversationCache[uid].slice(-20);

    // Save to DB if authenticated
    if (req.userId) Conversation.create({ userId: req.userId, role: 'user', text }).catch(() => {});

    const filledPrompt = SYSTEM_PROMPT
      .replace('{babyStatus}', monitoring.babyStatus)
      .replace('{monitoringActive}', monitoring.active ? 'ON' : 'OFF')
      .replace('{time}', new Date().toLocaleTimeString());
    const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
      { role: 'system', content: filledPrompt },
      ...conversationCache[uid],
    ];

    const completion = await groq.chat.completions.create({ messages, model: 'llama-3.3-70b-versatile', temperature: 0.7, max_tokens: 1024 });
    const aiText = completion.choices[0]?.message?.content || "I'm here for you. Can you say that again?";

    let intent = null;
    const m = aiText.match(/\[INTENT\](.*?)\[\/INTENT\]/s);
    if (m) { try { intent = JSON.parse(m[1]); } catch {} }
    const cleanResponse = aiText.replace(/\[INTENT\].*?\[\/INTENT\]/s, '').trim();

    conversationCache[uid].push({ role: 'assistant', content: cleanResponse });
    if (req.userId) {
      Conversation.create({ userId: req.userId, role: 'assistant', text: cleanResponse, intent: intent?.intent }).catch(() => {});
      if (intent) executeIntent(intent, req.userId);
    }

    res.json({ response: cleanResponse, intent, babyStatus: monitoring.babyStatus, monitoring: monitoring.active });
  } catch (err: any) {
    console.error('Voice error:', err.message);
    res.json({ response: "I'm having a small hiccup, but I'm still here for you.", intent: null });
  }
});

async function executeIntent(intent: any, userId: string) {
  switch (intent.intent) {
    case 'create_reminder':
      Reminder.create({ userId, text: intent.params?.text || 'Reminder', category: intent.params?.category || 'general', time: intent.params?.time || 'Soon' }).catch(() => {});
      break;
    case 'log_feeding':
      Log.create({ userId, type: 'feeding', details: intent.params?.details || 'Logged via voice' }).catch(() => {});
      break;
    case 'log_sleep':
      Log.create({ userId, type: 'sleep', details: intent.params?.details || 'Logged via voice' }).catch(() => {});
      break;
    case 'log_medicine':
      Log.create({ userId, type: 'medicine', details: intent.params?.details || 'Logged via voice' }).catch(() => {});
      break;
    case 'log_diaper':
      Log.create({ userId, type: 'diaper', details: intent.params?.details || 'Logged via voice' }).catch(() => {});
      break;
    case 'start_monitoring':
      monitoring.active = true;
      broadcast({ type: 'monitoring_started', data: monitoring });
      break;
    case 'stop_monitoring':
      monitoring.active = false;
      broadcast({ type: 'monitoring_stopped', data: monitoring });
      break;
    case 'play_lullaby':
      broadcast({ type: 'play_lullaby', data: { soundType: intent.params?.type || 'lullaby' } });
      break;
    case 'tell_story':
      broadcast({ type: 'tell_story', data: { category: intent.params?.category || 'bedtime' } });
      break;
    case 'navigate':
      broadcast({ type: 'navigate', data: { tab: intent.params?.tab || 'home' } });
      break;
  }
}

// ─── ELEVENLABS TTS ────────────────────────────────────────────────────

app.post('/api/voice/tts', async (req, res) => {
  try {
    const { text, voiceType } = req.body;
    if (!text) return res.status(400).json({ error: 'No text' });
    const voiceId = ELEVENLABS_VOICES[voiceType] || ELEVENLABS_VOICES.calm_mother;
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'Accept': 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': ELEVENLABS_API_KEY },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.75, similarity_boost: 0.75, style: 0.5, use_speaker_boost: true } }),
    });
    if (!r.ok) return res.status(r.status).json({ error: 'TTS failed' });
    const buf = await r.arrayBuffer();
    res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': buf.byteLength.toString() });
    res.send(Buffer.from(buf));
  } catch (err: any) {
    res.status(500).json({ error: 'TTS error' });
  }
});

app.post('/api/voice/tts/stream', async (req, res) => {
  try {
    const { text, voiceType } = req.body;
    if (!text) return res.status(400).json({ error: 'No text' });
    const voiceId = ELEVENLABS_VOICES[voiceType] || ELEVENLABS_VOICES.calm_mother;
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: { 'Accept': 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': ELEVENLABS_API_KEY },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.75, similarity_boost: 0.75, style: 0.5, use_speaker_boost: true } }),
    });
    if (!r.ok || !r.body) return res.status(500).json({ error: 'Stream failed' });
    res.set({ 'Content-Type': 'audio/mpeg', 'Transfer-Encoding': 'chunked' });
    const reader = r.body.getReader();
    while (true) { const { done, value } = await reader.read(); if (done) break; res.write(Buffer.from(value)); }
    res.end();
  } catch { res.status(500).json({ error: 'Stream error' }); }
});

// ─── STORY GENERATION ──────────────────────────────────────────────────

app.post('/api/stories/generate', async (_req, res) => {
  try {
    const { category } = _req.body;
    const prompts: Record<string, string> = {
      panchatantra: 'Tell a short Panchatantra story for children (3-5 min read). Engaging with a moral.',
      bedtime: 'Tell a gentle bedtime story for a toddler (3-5 min). Calming with moonlight/stars.',
      animal: 'Tell a fun animal story for young children (3-5 min). Include animal sounds.',
      'akbar-birbal': 'Tell a child-friendly Akbar-Birbal story (3-5 min). Gentle humor.',
    };
    const c = await groq.chat.completions.create({
      messages: [{ role: 'system', content: 'You are a warm storyteller for children.' }, { role: 'user', content: prompts[category] || prompts.bedtime }],
      model: 'llama-3.3-70b-versatile', temperature: 0.8, max_tokens: 2048,
    });
    res.json({ story: c.choices[0]?.message?.content || 'Once upon a time...' });
  } catch { res.json({ story: 'Once upon a time, in a beautiful forest...' }); }
});

// ─── MONITORING ────────────────────────────────────────────────────────

app.post('/api/monitoring/start', (_req, res) => { monitoring.active = true; broadcast({ type: 'monitoring_started', data: monitoring }); res.json({ status: 'started', monitoring }); });
app.post('/api/monitoring/stop', (_req, res) => { monitoring.active = false; broadcast({ type: 'monitoring_stopped', data: monitoring }); res.json({ status: 'stopped', monitoring }); });
app.get('/api/monitoring/status', (_req, res) => { res.json(monitoring); });
app.post('/api/monitoring/alert', (req, res) => {
  const { type, details } = req.body;
  if (type === 'cry_detected') { monitoring.babyStatus = 'crying'; monitoring.cryLevel = Math.min(100, monitoring.cryLevel + 20); }
  else if (type === 'motion_detected') { monitoring.babyStatus = 'moving'; monitoring.motionLevel = Math.min(100, monitoring.motionLevel + 15); }
  else if (type === 'silence_detected') { monitoring.babyStatus = 'sleeping'; monitoring.cryLevel = Math.max(0, monitoring.cryLevel - 10); monitoring.motionLevel = Math.max(0, monitoring.motionLevel - 10); }
  monitoring.lastAlert = details || type;
  broadcast({ type, data: { ...monitoring, details } });
  res.json(monitoring);
});

// ─── PLANNER (DB-backed) ──────────────────────────────────────────────

app.get('/api/planner/reminders', async (req: AuthRequest, res) => {
  if (!req.userId) return res.json([]);
  const items = await Reminder.find({ userId: req.userId, done: false }).sort({ createdAt: -1 }).limit(50);
  res.json(items.map(r => ({ id: r._id, text: r.text, category: r.category, time: r.time, createdAt: r.createdAt, done: r.done })));
});

app.post('/api/planner/reminders', async (req: AuthRequest, res) => {
  const { text, category, time } = req.body;
  if (req.userId) {
    const r = await Reminder.create({ userId: req.userId, text, category: category || 'general', time: time || 'Soon' });
    broadcast({ type: 'reminder_created', data: { id: r._id, text: r.text, category: r.category, time: r.time, createdAt: r.createdAt, done: false } });
    return res.json({ id: r._id, text: r.text, category: r.category, time: r.time, createdAt: r.createdAt, done: false });
  }
  res.json({ id: Date.now().toString(), text, category, time, createdAt: new Date().toISOString(), done: false });
});

app.patch('/api/planner/reminders/:id', async (req: AuthRequest, res) => {
  if (req.userId) {
    const r = await Reminder.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
    return res.json(r || {});
  }
  res.json({ id: req.params.id, ...req.body });
});

app.get('/api/planner/logs', async (req: AuthRequest, res) => {
  if (!req.userId) return res.json([]);
  const items = await Log.find({ userId: req.userId }).sort({ timestamp: -1 }).limit(50);
  res.json(items.map(l => ({ id: l._id, type: l.type, details: l.details, timestamp: l.timestamp })));
});

app.post('/api/planner/logs', async (req: AuthRequest, res) => {
  const { type, details } = req.body;
  if (req.userId) {
    const l = await Log.create({ userId: req.userId, type, details: details || '' });
    broadcast({ type: 'log_created', data: { id: l._id, type: l.type, details: l.details, timestamp: l.timestamp } });
    return res.json({ id: l._id, type: l.type, details: l.details, timestamp: l.timestamp });
  }
  res.json({ id: Date.now().toString(), type, details, timestamp: new Date().toISOString() });
});

// ─── LULLABIES ─────────────────────────────────────────────────────────

const lullabies = [
  { id: 'lullaby-1', title: 'Twinkle Twinkle Little Star', artist: 'Classic Lullaby', youtubeId: 'yCjJyiqpAuU', category: 'lullaby', duration: '3:20' },
  { id: 'lullaby-2', title: 'Rock-a-bye Baby', artist: 'Soothing Melodies', youtubeId: 'jTFGaki-GXo', category: 'lullaby', duration: '4:15' },
  { id: 'lullaby-3', title: 'Hush Little Baby', artist: 'Classic Lullaby', youtubeId: 'x-KUBY5OVgA', category: 'lullaby', duration: '3:50' },
  { id: 'lullaby-4', title: 'Brahms Lullaby', artist: 'Classical', youtubeId: 't894eGoals8', category: 'lullaby', duration: '5:00' },
  { id: 'lullaby-5', title: 'Mozarts Lullaby', artist: 'Classical', youtubeId: 'S-Xm7s9eGxU', category: 'lullaby', duration: '4:30' },
  { id: 'lullaby-6', title: 'Somewhere Over The Rainbow', artist: 'Baby Lullaby', youtubeId: 'V1bFr2SWP1I', category: 'lullaby', duration: '3:45' },
  { id: 'lullaby-7', title: 'Baby Mine (Dumbo)', artist: 'Disney Lullaby', youtubeId: 'c9a1UxVb3J4', category: 'lullaby', duration: '3:10' },
  { id: 'lullaby-8', title: 'You Are My Sunshine', artist: 'Lullaby Version', youtubeId: 'cGa3zFRqjpM', category: 'lullaby', duration: '3:30' },
  { id: 'lullaby-9', title: '2 Hours Relaxing Baby Music', artist: 'Baby Relax', youtubeId: 'uxnDUoOKaEE', category: 'lullaby', duration: '120:00' },
  { id: 'lullaby-10', title: 'Baby Sleep Music', artist: 'Relaxing Music', youtubeId: 'H6qoHMWhsnw', category: 'lullaby', duration: '60:00' },
  { id: 'hindi-1', title: 'Lakdi Ki Kathi', artist: 'Hindi Lullaby', youtubeId: 'aDRSQFlfmFo', category: 'lullaby', duration: '3:30' },
  { id: 'hindi-2', title: 'Chanda Mama Door Ke', artist: 'Hindi Lullaby', youtubeId: 'Q8TXgNw5JhQ', category: 'lullaby', duration: '4:00' },
  { id: 'hindi-3', title: 'Nanha Munna Rahi Hoon', artist: 'Hindi Classic', youtubeId: 'DsGKQR4tlEg', category: 'lullaby', duration: '3:40' },
  { id: 'hindi-4', title: 'Machli Jal Ki Rani Hai', artist: 'Hindi Nursery', youtubeId: 'cCMC1nUXyY0', category: 'lullaby', duration: '2:30' },
  { id: 'rain-1', title: 'Gentle Rain Sounds', artist: 'Nature', youtubeId: 'mPZkdNFkNps', category: 'rain', duration: '60:00' },
  { id: 'rain-2', title: 'Rain On Window', artist: 'Relaxing', youtubeId: 'q76bMs-NwRk', category: 'rain', duration: '120:00' },
  { id: 'rain-3', title: 'Thunderstorm Sleep', artist: 'Nature', youtubeId: 'nDq6TstdEI8', category: 'rain', duration: '180:00' },
  { id: 'rain-4', title: 'Soft Rain For Sleeping', artist: 'Sleep', youtubeId: '8plwv25NYRo', category: 'rain', duration: '60:00' },
  { id: 'ocean-1', title: 'Ocean Waves', artist: 'Nature', youtubeId: 'bn9F19Hi1Lk', category: 'ocean', duration: '60:00' },
  { id: 'ocean-2', title: 'Calm Sea Sounds', artist: 'Ocean', youtubeId: 'f77SKdyn-1Y', category: 'ocean', duration: '120:00' },
  { id: 'ocean-3', title: 'Beach Waves', artist: 'Nature', youtubeId: 'WHPEKLQID4U', category: 'ocean', duration: '180:00' },
  { id: 'whitenoise-1', title: 'White Noise For Baby', artist: 'Sleep', youtubeId: 'nMfPqeZjc2c', category: 'whitenoise', duration: '60:00' },
  { id: 'whitenoise-2', title: 'Fan White Noise', artist: 'Fan', youtubeId: 'oAMmTiaBsEE', category: 'whitenoise', duration: '600:00' },
  { id: 'whitenoise-3', title: 'Womb Sounds', artist: 'Baby', youtubeId: 'jc_rrN5lcr4', category: 'whitenoise', duration: '120:00' },
  { id: 'whitenoise-4', title: 'Shushing Sound', artist: 'Baby', youtubeId: 'LBfJY3QITNI', category: 'whitenoise', duration: '60:00' },
  { id: 'heartbeat-1', title: 'Heartbeat Sounds', artist: 'Calming', youtubeId: 'dNJdJIwCF_Y', category: 'heartbeat', duration: '60:00' },
  { id: 'heartbeat-2', title: 'Womb Heartbeat', artist: 'Newborn', youtubeId: 'LHhkraMcSZY', category: 'heartbeat', duration: '120:00' },
  { id: 'heartbeat-3', title: 'Mothers Heartbeat', artist: 'Calming', youtubeId: 'eDpBqz2dCkI', category: 'heartbeat', duration: '60:00' },
];

app.get('/api/lullabies', (_req, res) => res.json(lullabies));
app.get('/api/lullabies/:category', (req, res) => {
  const f = lullabies.filter(l => l.category === req.params.category);
  res.json(f.length > 0 ? f : lullabies);
});

// ─── WEBSOCKET ─────────────────────────────────────────────────────────

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.send(JSON.stringify({ type: 'connected', data: { monitoring } }));
  ws.on('message', (msg) => { try { const d = JSON.parse(msg.toString()); if (d.type === 'monitoring_update') { monitoring = { ...monitoring, ...d.data }; broadcast({ type: 'monitoring_update', data: monitoring }); } } catch {} });
  ws.on('close', () => console.log('WebSocket client disconnected'));
});

setInterval(() => {
  if (monitoring.active) {
    monitoring.cryLevel = Math.max(0, monitoring.cryLevel - 2);
    monitoring.motionLevel = Math.max(0, monitoring.motionLevel - 1);
    if (monitoring.cryLevel < 10 && monitoring.motionLevel < 10) monitoring.babyStatus = 'sleeping';
    else if (monitoring.cryLevel > 50) monitoring.babyStatus = 'crying';
    else if (monitoring.motionLevel > 40) monitoring.babyStatus = 'awake';
  }
}, 5000);

// ─── HEALTH ────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ai: 'groq', tts: 'elevenlabs', db: mongoose.connection.readyState === 1 ? 'mongodb' : 'in-memory', model: 'llama-3.3-70b-versatile' });
});

// ─── START ─────────────────────────────────────────────────────────────

// ─── START ─────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '3001', 10);

// For local running
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  // Try connecting but start server regardless
  connectDB().catch(() => console.log('Starting without DB persistence'));
  
  httpServer.listen(PORT, () => {
    console.log(`\n✨ MaaMate Backend running on http://localhost:${PORT}`);
    console.log(`   AI: Groq (llama-3.3-70b-versatile)`);
    console.log(`   TTS: ElevenLabs`);
    console.log(`   WebSocket: ws://localhost:${PORT}/ws\n`);
  });
} else {
  // On Vercel, we still need to connect to DB for the serverless function
  connectDB();
}

export default app;
