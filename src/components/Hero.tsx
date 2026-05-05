import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Star } from 'lucide-react';

const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] aspect-square bg-brand-sage/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] aspect-square bg-brand-terracotta/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-brand-terracotta">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">
              Lisbon's Premium Choice
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-serif text-brand-dark leading-[1.1] mb-6">
            {t.hero.title} <br/>
            <span className="text-brand-terracotta italic font-normal">Lisboa</span>
          </h1>

          <p className="text-xl md:text-2xl text-brand-dark/60 font-serif leading-relaxed mb-8 max-w-lg">
            {t.hero.subtitle}
          </p>

          <p className="text-lg text-brand-dark/40 mb-10 max-w-sm">
            {t.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
              className="premium-btn premium-btn-primary flex items-center justify-center gap-2 group"
            >
              {t.nav.order}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="premium-btn border border-brand-dark/10 text-brand-dark hover:bg-brand-dark/5"
            >
              {t.nav.about}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative order-first lg:order-last"
        >
          <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=1200" 
              alt="Luxury breakfast in bed" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Overlay badge */}
            <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/20 max-w-[200px]">
              <span className="block text-brand-terracotta text-sm font-bold uppercase tracking-widest mb-1">
                {t.benefits.fresh}
              </span>
              <span className="block text-brand-dark/60 text-xs">
                {t.benefits.silent}
              </span>
            </div>
          </div>
          
          {/* Accent Shapes */}
          <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-brand-sage/20 rounded-full -z-10" />
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-terracotta/10 rounded-full blur-2xl -z-10" />
        </motion.div>
      </div>

      {/* Floating Benefits Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-brand-dark text-white/80 py-6 overflow-hidden hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center whitespace-nowrap">
          {[t.benefits.time, t.benefits.fresh, t.benefits.silent].map((benefit, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 bg-brand-terracotta rounded-full" />
              <span className="text-xs uppercase tracking-[0.2em]">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
