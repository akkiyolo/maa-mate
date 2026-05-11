import { BookOpen, Heart, Music, PlayCircle, Repeat, SkipBack, SkipForward, Volume2, Pause } from 'lucide-react';

export default function Stories() {
  return (
    <div className="pb-32 pt-24 px-6 md:px-16 max-w-[800px] mx-auto min-h-screen space-y-10 animate-fade-in">
      <section>
        <div className="relative overflow-hidden rounded-3xl glass-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden shadow-lg border border-white/40">
            <img 
              alt="Panchatantra Tale Illustration" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpLtV4P_xLTqM3RkBLIYV_CjIeb-fCVWiDfMpyd1gKO93R6DJyCoi2b5CezV2ej5gafPrCbwz1GnPEqtlwPOgvNKeCJ1z2UmGjbVrK01xPHkH4Wx6tL5vkG1Bu2_Dh-XSdnUi9hSe4bLSt-pSGqgfloxksbMh62Ju8vJaMycskuWk7y_wTsG14IYwTt9hKUKLWSVpkXl9JPth3irwG9RIzWF0uG7lEgOMVKHhGNzC4ir7uHmIENlP7cM0-eVh3Jsi6qLpzX5C67Ik2"
            />
          </div>
          <div className="flex-1 text-center md:text-left w-full">
            <span className="inline-block px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-medium text-xs mb-3">Now Narrating</span>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-2">The Wise Panchatantra</h2>
            <p className="text-on-surface-variant text-sm mb-6">A timeless tale about friendship and wisdom, narrated in a soft, maternal tone.</p>
            
            <div className="p-6 rounded-2xl bg-surface-container-low shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-xs font-medium text-on-surface-variant">2:45</span>
                <div className="flex-1 h-2 bg-outline-variant rounded-full relative">
                  <div className="absolute left-0 top-0 h-full w-[40%] bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                  <div className="absolute left-[40%] -top-1.5 w-5 h-5 bg-primary rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <span className="text-xs font-medium text-on-surface-variant">10:00</span>
              </div>
              <div className="flex items-center justify-center gap-6 md:gap-8">
                <button className="text-primary hover:scale-110 transition-transform active:scale-95"><Repeat className="w-5 h-5" /></button>
                <button className="text-primary hover:scale-110 transition-transform active:scale-95"><SkipBack className="w-6 h-6 fill-current" /></button>
                <button className="w-16 h-16 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95">
                  <Pause className="w-7 h-7 fill-current" />
                </button>
                <button className="text-primary hover:scale-110 transition-transform active:scale-95"><SkipForward className="w-6 h-6 fill-current" /></button>
                <button className="text-primary hover:scale-110 transition-transform active:scale-95"><Volume2 className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-display text-xl font-medium text-primary mb-4 px-2">Explore Stories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="group flex flex-col items-center p-4 rounded-3xl glass-card transition-all hover:-translate-y-1 hover:shadow-md active:scale-95">
            <div className="w-full aspect-square rounded-2xl mb-3 overflow-hidden">
              <img alt="Bedtime Stories" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSW16P8ll34bKsnJXUHU4Myy-TR_-_VB8SQZP43B-25nUDskD4aExJj0RV6eaCFMTQIOugrzqZm6fw2GEyVgvLPmnBNvfQ5lM7hYfEnwCNpnj9jb2D9yZGDBTD4-nabukg-hHHM5kAoO7E1SMjLXcsMUBmJVHMyRRDN2-tTmU3B8RjSdEc6wXWyk_SN1EwUpfpn_pRtlR315bDRasd6ld0V5UuKsJjFb8_kDPobOBIwKKxbVwo89MWxc6gWW-Q_EfGAkjCv0nL9oMe"/>
            </div>
            <span className="text-sm font-medium text-on-surface">Bedtime Stories</span>
          </button>
          
          <button className="group flex flex-col items-center p-4 rounded-3xl bg-primary-container/30 border border-primary/20 transition-all hover:-translate-y-1 hover:shadow-md active:scale-95">
            <div className="w-full aspect-square rounded-2xl mb-3 overflow-hidden">
              <img alt="Panchatantra" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPwtxq7KQdgK3VFecvuvFQfzHbnCc2YcB1DN2B7z-X0jIR6IO3n9DvMN6JnxWSmOqyYp-VC1hE8ZNQ4L65NV8TsNPsYRyHun1fKbQ5UtD0k00WGRCe6ZjGXyqXiTgPcZ2IOj9DZQh3zZCFfGTqwLsI7wo0pgI_Cu9DVvRTA777HKvs6n4ld0CYnsFRsk02m1d1XpKk6XWiyPJNOrz-5zyxaYHdKk8DSFnbWVs8mdcj8R4VUt84XmnRfv7li7We7CX8pk82Qvk_3g05"/>
            </div>
            <span className="text-sm font-medium text-primary font-bold">Panchatantra</span>
          </button>
          
          <button className="group flex flex-col items-center p-4 rounded-3xl glass-card transition-all hover:-translate-y-1 hover:shadow-md active:scale-95">
            <div className="w-full aspect-square rounded-2xl mb-3 overflow-hidden">
              <img alt="Animal Stories" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFdedVV_59obaKWvlsLaGXoIxSF680SsHkgAQkCnlKAzyxxP0v3-bfsH1M_8iOG2LSNahgx4R2Brf7lmGdnOijEfx1hY6hC7NTCKKe_pAJ9YcluXq07l2xapiKgwkCcsEyZmeKOkoZTOuoxsfzA7pLM7K_8H7EgmoCZngOpcQPpi3DoSnyZphFh1WNKzetvrZ7_q54DaVzoYl4g0RXmmR9KtT6ZFmyZt3JZfu0DidncTwqS7AedCDqI_WCpniV3JbSBH33l-qqcY89"/>
            </div>
            <span className="text-sm font-medium text-on-surface">Animal Stories</span>
          </button>
          
          <button className="group flex flex-col items-center p-4 rounded-3xl glass-card transition-all hover:-translate-y-1 hover:shadow-md active:scale-95">
            <div className="w-full aspect-square rounded-2xl mb-3 overflow-hidden">
              <img alt="White Noise" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB05Z6ARCypLn5XomUUkww_6ERaVokAKYte_20Dx1bRLFbUfWb2pFcVVnTGu8HM0Jk8Eb1OfXLinWohnotlJgoWg3sHOhy9-1c5M5cPde2YLOlA_DeJbWIqhvBMomzHDqlzlUi-iR9agEZBFLgcRp6BKFuKWnz3Yzoi-kZ6AsC8ZPMQT6T7j4WOEkhO0zLPdZwSP2GcxX_JVarHFjHddA9fKsKwyLAFnDJYEnRimqEX6MTNkF4poj4b5wf_SWAwhZpgQNH54WPGGjH5"/>
            </div>
            <span className="text-sm font-medium text-on-surface">Lullabies</span>
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-display text-xl font-medium text-primary">Your Favorites</h3>
          <button className="text-primary text-sm font-medium hover:underline">View All</button>
        </div>
        <div className="space-y-4">
          {[
            { title: "Ocean Waves Lullaby", cat: "White Noise • 45 min", icon: Music, color: "bg-tertiary-container/50", text: "text-tertiary" },
            { title: "The Rabbit & The Tortoise", cat: "Animal Stories • 12 min", icon: BookOpen, color: "bg-secondary-container/50", text: "text-secondary" },
            { title: "Moonlit Adventure", cat: "Bedtime Stories • 20 min", icon: Heart, color: "bg-primary-container/50", text: "text-primary" }
          ].map((fav, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors group cursor-pointer active:scale-[0.98]">
              <div className={`w-14 h-14 shrink-0 rounded-xl ${fav.color} flex items-center justify-center`}>
                <fav.icon className={`w-6 h-6 ${fav.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-on-surface truncate">{fav.title}</h4>
                <p className="text-sm text-on-surface-variant truncate">{fav.cat}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-outline group-hover:text-primary transition-colors"><Heart className="w-5 h-5" /></button>
                <button className="text-primary"><PlayCircle className="w-10 h-10" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
