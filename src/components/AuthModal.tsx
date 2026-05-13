import { useState } from 'react';
import { X, Loader2, Heart, Baby, Mail, Lock, User } from 'lucide-react';
import { useAppStore } from '../store';
import { api } from '../services/api';

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, setUser } = useAppStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [babyName, setBabyName] = useState('');

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (mode === 'register') {
        result = await api.register(name, email, password, babyName);
      } else {
        result = await api.login(email, password);
      }

      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        setUser(result.user);
        setShowAuthModal(false);
        setName(''); setEmail(''); setPassword(''); setBabyName('');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-md bg-surface rounded-3xl p-8 shadow-2xl border border-primary/10 relative">
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-primary via-primary-container to-secondary-container flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-on-primary" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-on-surface">
            {mode === 'login' ? 'Welcome Back' : 'Join MaaMate'}
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            {mode === 'login' ? 'Sign in to access your data' : 'Create your parenting companion'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container-low border border-primary/10 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30" required />
              </div>
              <div className="relative">
                <Baby className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input type="text" value={babyName} onChange={e => setBabyName(e.target.value)} placeholder="Baby's name (optional)"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container-low border border-primary/10 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container-low border border-primary/10 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30" required />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container-low border border-primary/10 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30" required minLength={6} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-medium text-lg disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-primary text-sm font-medium hover:underline"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        <button
          onClick={() => setShowAuthModal(false)}
          className="w-full mt-3 text-center text-xs text-outline hover:text-on-surface-variant transition-colors"
        >
          Continue without signing in
        </button>
      </div>
    </div>
  );
}
