import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { promotions } from '../data/promotions';
import { Megaphone } from 'lucide-react';

const PromoSection: React.FC = () => {
  const { t, language } = useLanguage();
  const activePromos = promotions.filter(p => p.active);

  if (activePromos.length === 0) return null;

  return (
    <section className="py-20 bg-brand-beige">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-3 bg-brand-terracotta/10 rounded-2xl">
            <Megaphone className="w-6 h-6 text-brand-terracotta" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl">{t.promo.title}</h2>
            <p className="text-brand-dark/40 text-sm mt-1 uppercase tracking-widest">{t.promo.stayTuned}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activePromos.map((promo) => (
            <motion.div 
              key={promo.id}
              whileHover={{ y: -5 }}
              className="relative overflow-hidden p-8 rounded-[2.5rem] bg-white shadow-sm flex flex-col justify-between min-h-[220px]"
            >
              {/* Decorative Circle */}
              <div 
                className="absolute top-[-20%] right-[-10%] w-48 h-48 rounded-full opacity-10 pointer-events-none" 
                style={{ backgroundColor: promo.color }}
              />
              
              <div>
                <span 
                  className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white mb-6 inline-block"
                  style={{ backgroundColor: promo.color }}
                >
                  Promo
                </span>
                <h3 className="text-2xl mb-3 text-brand-dark">{promo.title[language]}</h3>
                <p className="text-brand-dark/60 font-serif text-lg leading-relaxed">{promo.description[language]}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
