import { useState } from 'react';
import { Activity, BellRing, CheckCircle2, Clipboard, HeartPulse, Moon, Plus, Syringe, X, Clock, Utensils, Droplet } from 'lucide-react';
import { useAppStore } from '../store';
import { api } from '../services/api';

export default function Planner() {
  const {
    reminders,
    addReminder,
    toggleReminder,
    logs,
    addLog,
  } = useAppStore();

  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderCategory, setNewReminderCategory] = useState('general');
  const [newReminderTime, setNewReminderTime] = useState('');

  const [showLogModal, setShowLogModal] = useState(false);
  const [logType, setLogType] = useState<'feeding' | 'sleep' | 'medicine' | 'diaper'>('feeding');
  const [logDetails, setLogDetails] = useState('');

  const getLastLog = (type: string) => {
    const log = logs.filter(l => l.type === type).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    if (!log) return 'No records yet';
    const diff = Date.now() - new Date(log.timestamp).getTime();
    const mins = Math.round(diff / 60000);
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hours > 0) return `${hours}h ${remMins}m ago (${log.details})`;
    return `${mins}m ago (${log.details})`;
  };

  const handleAddReminder = async () => {
    if (!newReminderText.trim()) return;
    const reminder = {
      id: Date.now().toString(),
      text: newReminderText,
      category: newReminderCategory,
      time: newReminderTime || 'Today',
      createdAt: new Date().toISOString(),
      done: false,
    };
    addReminder(reminder);
    api.createReminder(reminder.text, reminder.category, reminder.time).catch(() => {});
    setNewReminderText('');
    setNewReminderTime('');
    setShowAddReminder(false);
  };

  const handleLogActivity = async () => {
    const details = logDetails.trim() || getDefaultDetails(logType);
    const log = {
      id: Date.now().toString(),
      type: logType,
      details,
      timestamp: new Date().toISOString(),
    };
    addLog(log);
    api.createLog(logType, details).catch(() => {});
    setLogDetails('');
    setShowLogModal(false);
  };

  const getDefaultDetails = (type: string) => {
    switch (type) {
      case 'feeding': return 'Breastfed';
      case 'sleep': return 'Started nap';
      case 'medicine': return 'Dose given';
      case 'diaper': return 'Changed';
      default: return '';
    }
  };

  const openLogModal = (type: 'feeding' | 'sleep' | 'medicine' | 'diaper') => {
    setLogType(type);
    setLogDetails('');
    setShowLogModal(true);
  };

  const activeReminders = reminders.filter(r => !r.done);
  const completedReminders = reminders.filter(r => r.done);

  const feedingLogs = logs.filter(l => l.type === 'feeding');
  const sleepLogs = logs.filter(l => l.type === 'sleep');

  return (
    <div className="pb-32 pt-24 px-6 md:px-16 max-w-[800px] mx-auto min-h-screen space-y-8 animate-fade-in">
      <section>
        <h2 className="font-display text-3xl font-semibold text-on-surface mb-2">Planner</h2>
        <p className="text-on-surface-variant">Your baby's rhythm, organized with care.</p>
      </section>

      {/* Quick Log Buttons */}
      <section>
        <h3 className="font-display text-lg font-medium text-on-surface mb-4">Quick Log</h3>
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => openLogModal('feeding')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-secondary-container/30 border border-secondary/10 hover:bg-secondary-container/50 transition-all active:scale-95"
          >
            <Utensils className="w-6 h-6 text-secondary" />
            <span className="text-xs font-medium text-on-surface">Feed</span>
          </button>
          <button
            onClick={() => openLogModal('sleep')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-tertiary-container/30 border border-tertiary/10 hover:bg-tertiary-container/50 transition-all active:scale-95"
          >
            <Moon className="w-6 h-6 text-tertiary" />
            <span className="text-xs font-medium text-on-surface">Sleep</span>
          </button>
          <button
            onClick={() => openLogModal('medicine')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-primary-container/30 border border-primary/10 hover:bg-primary-container/50 transition-all active:scale-95"
          >
            <HeartPulse className="w-6 h-6 text-primary" />
            <span className="text-xs font-medium text-on-surface">Medicine</span>
          </button>
          <button
            onClick={() => openLogModal('diaper')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-orange-100 border border-orange-200 hover:bg-orange-200 transition-all active:scale-95"
          >
            <Droplet className="w-6 h-6 text-orange-700" />
            <span className="text-xs font-medium text-on-surface">Diaper</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Feeding Card */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[180px]">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                <Clipboard className="w-6 h-6 text-on-secondary-container" />
              </div>
              <h3 className="font-display text-xl font-medium text-on-surface">Feeding</h3>
            </div>
            <p className="text-on-surface-variant mb-4">Last feed: {getLastLog('feeding')}</p>
            {feedingLogs.length > 0 && (
              <p className="text-xs text-outline">Total today: {feedingLogs.filter(l => {
                const d = new Date(l.timestamp);
                const today = new Date();
                return d.toDateString() === today.toDateString();
              }).length} feeds</p>
            )}
          </div>
          <button 
            onClick={() => openLogModal('feeding')}
            className="w-full bg-primary text-on-primary font-medium py-3 rounded-full hover:opacity-90 transition-opacity active:scale-95 mt-4"
          >
            Log Feed
          </button>
        </div>

        {/* Sleep Card */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[180px]">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center">
                <Moon className="w-6 h-6 text-on-tertiary-container" />
              </div>
              <h3 className="font-display text-xl font-medium text-on-surface">Sleep</h3>
            </div>
            <p className="text-on-surface-variant mb-4">Last nap: {getLastLog('sleep')}</p>
            {sleepLogs.length > 0 && (
              <p className="text-xs text-outline">Total today: {sleepLogs.filter(l => {
                const d = new Date(l.timestamp);
                const today = new Date();
                return d.toDateString() === today.toDateString();
              }).length} naps</p>
            )}
          </div>
          <button 
            onClick={() => openLogModal('sleep')}
            className="w-full bg-primary-container text-on-primary-container font-medium py-3 rounded-full hover:opacity-90 transition-opacity active:scale-95 mt-4"
          >
            Log Sleep
          </button>
        </div>

        {/* Medicine Card */}
        <div className="md:col-span-2 glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-container/50 flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-on-primary-container" />
              </div>
              <h3 className="font-display text-xl font-medium text-on-surface">Medicine</h3>
            </div>
            <button 
              onClick={() => openLogModal('medicine')}
              className="text-primary font-medium text-sm flex items-center gap-1 hover:underline"
            >
              <Plus className="w-4 h-4" /> Log Dose
            </button>
          </div>
          <div className="space-y-3">
            <p className="text-on-surface-variant">Last dose: {getLastLog('medicine')}</p>
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
              <div className="flex flex-col">
                <span className="font-medium text-on-surface text-base">Vitamin D Drops</span>
                <span className="text-sm text-on-surface-variant mt-0.5">Daily • Next: 8:00 AM Tomorrow</span>
              </div>
              <CheckCircle2 className="w-6 h-6 text-on-surface-variant" />
            </div>
          </div>
        </div>

        {/* Vaccination */}
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-secondary-container/50 flex items-center justify-center">
              <Syringe className="w-6 h-6 text-on-secondary-container" />
            </div>
            <h3 className="font-display text-xl font-medium text-on-surface">Vaccination</h3>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-on-surface-variant">6 Month Milestones</span>
              <span className="text-primary">75%</span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary-container rounded-full transition-all" style={{ width: '75%' }}></div>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant">Next: 9-month checkup (3 weeks left)</p>
        </div>

        {/* Reminders */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <BellRing className="w-6 h-6 text-orange-800" />
              </div>
              <h3 className="font-display text-xl font-medium text-on-surface">Reminders</h3>
            </div>
            <button 
              onClick={() => setShowAddReminder(true)}
              className="text-primary font-medium text-sm flex items-center gap-1 hover:underline"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <ul className="space-y-4">
            {activeReminders.length === 0 && (
              <li className="text-on-surface-variant text-center py-4">No active reminders</li>
            )}
            {activeReminders.slice(0, 5).map((reminder) => (
              <li key={reminder.id} className="flex gap-4 items-start group">
                <button
                  onClick={() => toggleReminder(reminder.id)}
                  className="w-5 h-5 rounded-full border-2 border-primary mt-1 shrink-0 hover:bg-primary-container transition-colors flex items-center justify-center"
                >
                  {reminder.done && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </button>
                <div className="flex flex-col flex-1">
                  <span className="font-medium text-on-surface">{reminder.text}</span>
                  <span className="text-sm text-on-surface-variant mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {reminder.time}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Activity Log */}
      <section>
        <h3 className="font-display text-xl font-medium text-on-surface mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {logs.slice(0, 8).map((log) => (
            <div key={log.id} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                log.type === 'feeding' ? 'bg-secondary-container/50' :
                log.type === 'sleep' ? 'bg-tertiary-container/50' :
                log.type === 'medicine' ? 'bg-primary-container/50' :
                'bg-orange-100'
              }`}>
                {log.type === 'feeding' && <Utensils className="w-5 h-5 text-secondary" />}
                {log.type === 'sleep' && <Moon className="w-5 h-5 text-tertiary" />}
                {log.type === 'medicine' && <HeartPulse className="w-5 h-5 text-primary" />}
                {log.type === 'diaper' && <Droplet className="w-5 h-5 text-orange-700" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-on-surface capitalize">{log.type}</p>
                <p className="text-sm text-on-surface-variant truncate">{log.details}</p>
              </div>
              <span className="text-xs text-outline shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-center text-on-surface-variant py-8">No activity logged yet. Use the quick log buttons above!</p>
          )}
        </div>
      </section>

      {/* Inspirational footer */}
      <section className="py-4">
        <div className="w-full h-48 rounded-3xl overflow-hidden relative shadow-lg bg-gradient-to-br from-primary to-secondary">
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <p className="text-white font-display text-3xl font-medium drop-shadow-sm text-center">Routine creates comfort. 💜</p>
          </div>
        </div>
      </section>

      {/* Add Reminder Modal */}
      {showAddReminder && (
        <div className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-surface rounded-3xl p-8 shadow-2xl border border-primary/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-on-surface">Add Reminder</h3>
              <button onClick={() => setShowAddReminder(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-on-surface-variant block mb-1">What to remember?</label>
                <input
                  type="text"
                  value={newReminderText}
                  onChange={(e) => setNewReminderText(e.target.value)}
                  placeholder="e.g., Give medicine at 7 PM"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-primary/10 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant block mb-1">When?</label>
                <input
                  type="text"
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                  placeholder="e.g., Today 7:00 PM"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-primary/10 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant block mb-2">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {['general', 'feeding', 'medicine', 'activity'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewReminderCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                        newReminderCategory === cat
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddReminder}
                disabled={!newReminderText.trim()}
                className="w-full py-4 bg-primary text-on-primary rounded-full font-medium text-lg disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all mt-4"
              >
                Add Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Activity Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-surface rounded-3xl p-8 shadow-2xl border border-primary/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-on-surface capitalize">Log {logType}</h3>
              <button onClick={() => setShowLogModal(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-on-surface-variant block mb-1">Details (optional)</label>
                <input
                  type="text"
                  value={logDetails}
                  onChange={(e) => setLogDetails(e.target.value)}
                  placeholder={`e.g., ${logType === 'feeding' ? 'Left side, 15 mins' : logType === 'sleep' ? 'Started nap' : logType === 'medicine' ? 'Vitamin D drops' : 'Wet diaper'}`}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-primary/10 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {logType === 'feeding' && (
                <div className="flex gap-2">
                  {['Left Side', 'Right Side', 'Bottle', 'Solid Food'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setLogDetails(opt)}
                      className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                        logDetails === opt ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={handleLogActivity}
                className="w-full py-4 bg-primary text-on-primary rounded-full font-medium text-lg hover:opacity-90 active:scale-95 transition-all mt-4"
              >
                Log {logType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
