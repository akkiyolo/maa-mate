import { Activity, BellRing, CheckCircle2, Clipboard, HeartPulse, Moon, Plus, Syringe } from 'lucide-react';

export default function Planner() {
  return (
    <div className="pb-32 pt-24 px-6 md:px-16 max-w-[800px] mx-auto min-h-screen space-y-8 animate-fade-in">
      <section>
        <h2 className="font-display text-3xl font-semibold text-on-surface mb-2">Planner</h2>
        <p className="text-on-surface-variant">Your baby's rhythm, organized with care.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[180px]">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                <Clipboard className="w-6 h-6 text-on-secondary-container" />
              </div>
              <h3 className="font-display text-xl font-medium text-on-surface">Feeding</h3>
            </div>
            <p className="text-on-surface-variant mb-6">Last feed: 2h 15m ago (Left Side)</p>
          </div>
          <button className="w-full bg-primary text-on-primary font-medium py-3 rounded-full hover:opacity-90 transition-opacity active:scale-95">Log Feed</button>
        </div>

        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[180px]">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center">
                <Moon className="w-6 h-6 text-on-tertiary-container" />
              </div>
              <h3 className="font-display text-xl font-medium text-on-surface">Sleep</h3>
            </div>
            <p className="text-on-surface-variant mb-6">Current session: 45m (Napping)</p>
          </div>
          <button className="w-full bg-primary-container text-on-primary-container font-medium py-3 rounded-full hover:opacity-90 transition-opacity active:scale-95">Wake Up</button>
        </div>

        <div className="md:col-span-2 glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-container/50 flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-on-primary-container" />
              </div>
              <h3 className="font-display text-xl font-medium text-on-surface">Medicine</h3>
            </div>
            <button className="text-primary font-medium text-sm flex items-center gap-1 hover:underline">
              <Plus className="w-4 h-4" /> Add Dose
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
              <div className="flex flex-col">
                <span className="font-medium text-on-surface text-base">Vitamin D Drops</span>
                <span className="text-sm text-on-surface-variant mt-0.5">Daily • Next: 8:00 AM Tomorrow</span>
              </div>
              <CheckCircle2 className="w-6 h-6 text-on-surface-variant" />
            </div>
            <div className="flex items-center justify-between p-4 bg-primary-fixed-dim/20 rounded-2xl border border-primary/10">
              <div className="flex flex-col">
                <span className="font-medium text-on-surface text-base">Paracetamol</span>
                <span className="text-sm text-on-surface-variant mt-0.5">Every 6 hours • Due in 12 mins</span>
              </div>
              <button className="bg-primary text-on-primary px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 active:scale-95">Log Now</button>
            </div>
          </div>
        </div>

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
              <div className="h-full bg-gradient-to-r from-primary to-secondary-container rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant">Next: 9-month checkup (3 weeks left)</p>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <BellRing className="w-6 h-6 text-orange-800" />
            </div>
            <h3 className="font-display text-xl font-medium text-on-surface">Reminders</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-4 items-start">
              <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0"></div>
              <div className="flex flex-col">
                <span className="font-medium text-on-surface">Order more diapers</span>
                <span className="text-sm text-on-surface-variant mt-0.5">Today, 5:00 PM</span>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-outline-variant mt-2 shrink-0"></div>
              <div className="flex flex-col">
                <span className="font-medium text-on-surface">Tummy time session</span>
                <span className="text-sm text-on-surface-variant mt-0.5">Tomorrow, 10:00 AM</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <section className="py-4">
        <div className="w-full h-48 rounded-3xl overflow-hidden relative shadow-lg">
          <img alt="Peaceful nursery" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn5ntCtTfM0aHoQ3GGzUsINXqXqSAOwlQs440CgCm7tuzAE9nR0qIKapiGjgiRhEOF8_bdjGV_T2DZwlRzTFLTmLYQycK7osEWFo5wOw-vdXj-yiqLZxDBK2kuKAR08jO2LQl3DnXEDXDOpouvL-P94e09klagFADWpDgLSAxmF6S1KDXYkhcKTi8VlkQXiBU5cizlP_2xLa8u6pwZde3KWvXQb7hFbPeNyt9xQ2BdsjI2kT_RrQYNGFJJq1VX9GXwkFBf0-y8l_tJ"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
            <p className="text-white font-display text-3xl font-medium drop-shadow-sm">Routine creates comfort.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
