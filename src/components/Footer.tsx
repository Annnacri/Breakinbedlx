import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, MapPin, Instagram, Facebook, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  const areas = ['Penha de França', 'Graça', 'São Vicente', 'Alfama', 'Santa Clara'];

  return (
    <footer className="bg-brand-dark text-white pt-32 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-24">
          <div>
            <span className="text-3xl font-serif font-bold text-white mb-8 block">
              Breakfast in Bed <span className="text-brand-terracotta italic font-normal">Lisboa</span>
            </span>
            <p className="text-white/40 font-serif text-lg leading-relaxed mb-12 max-w-md">
              Bringing the boutique hotel experience to your Lisbon accommodation. Handcrafted, artisanal, and delivered with care.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div id="contact" className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-colors group-hover:border-brand-terracotta">
                    <Mail className="w-4 h-4 text-white/40 group-hover:text-brand-terracotta" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-white/20 mb-1">Email</span>
                    <a href="mailto:info@breakfasinbedlx.com" className="text-sm hover:text-brand-terracotta transition-colors">info@breakfasinbedlx.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-colors group-hover:border-brand-terracotta">
                    <Phone className="w-4 h-4 text-white/40 group-hover:text-brand-terracotta" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-white/20 mb-1">WhatsApp</span>
                    <a href="https://wa.me/351964423221" className="text-sm hover:text-brand-terracotta transition-colors">+351 964 423 221</a>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-colors group-hover:border-brand-terracotta">
                    <MapPin className="w-4 h-4 text-white/40 group-hover:text-brand-terracotta" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-white/20 mb-1">Location</span>
                    <span className="text-sm">Lisbon, Portugal</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-colors group-hover:border-brand-terracotta">
                    <Clock className="w-4 h-4 text-white/40 group-hover:text-brand-terracotta" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-white/20 mb-1">Serving Hours</span>
                    <span className="text-sm block">08:00 – 13:00</span>
                  </div>
                </div>
                {/* Socials */}
                <div className="flex gap-4 pt-4">
                  {[Instagram, Facebook].map((Icon, i) => (
                    <a 
                      key={i} 
                      href="#" 
                      className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:border-brand-terracotta hover:text-brand-terracotta transition-all"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Delivery Areas Section */}
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 relative overflow-hidden backdrop-blur-sm">
              <h3 className="text-2xl mb-8 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-brand-terracotta" />
                {t.areas.title}
              </h3>
              <div className="flex flex-wrap gap-3 mb-10">
                {areas.map((area) => (
                  <span key={area} className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm hover:border-brand-terracotta transition-colors cursor-default">
                    {area}
                  </span>
                ))}
              </div>
              <p className="text-white/30 text-xs italic">
                {t.areas.hours}
              </p>
              
              {/* Lisbon Map Outline Decor */}
              <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
                <MapPin className="w-64 h-64 text-white fill-current" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">
          <p>© 2026 breakfasinbedlx.com. All Rights Reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
