import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Menu, X, Globe } from 'lucide-react';
import { Language } from '../data/translations';

const Header: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { items } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const languages: { code: Language; label: string }[] = [
    { code: 'pt', label: 'PT' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'fr', label: 'FR' },
    { code: 'de', label: 'DE' },
    { code: 'it', label: 'IT' }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <span className="text-2xl font-serif font-bold tracking-tight text-brand-dark">
            Breakfast in Bed <span className="text-brand-terracotta">Lisboa</span>
          </span>
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {['menu', 'about', 'contact'].map((key) => (
            <a 
              key={key} 
              href={`#${key}`}
              className="text-sm font-medium text-brand-dark/70 hover:text-brand-terracotta transition-colors uppercase tracking-widest"
            >
              {t.nav[key as keyof typeof t.nav]}
            </a>
          ))}
          
          <div className="h-4 w-px bg-brand-dark/10 mx-2" />

          {/* Language Switcher */}
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-brand-dark/40" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-xs font-bold border-none focus:ring-0 cursor-pointer uppercase text-brand-dark"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>

          <button className="relative p-2 text-brand-dark hover:text-brand-terracotta transition-colors">
            <ShoppingBag className="w-6 h-6" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-brand-terracotta text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </nav>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <button className="relative p-2" onClick={() => setIsMobileMenuOpen(true)}>
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-terracotta text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-8 h-8 text-brand-dark" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed inset-0 bg-brand-cream z-[60] flex flex-col items-center justify-center gap-8 p-6"
          >
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-brand-dark"
            >
              <X className="w-8 h-8" />
            </button>

            <span className="text-2xl font-serif font-bold text-center mb-8">
              Breakfast in Bed <br/> <span className="text-brand-terracotta">Lisboa</span>
            </span>

            {['menu', 'about', 'contact'].map((key) => (
              <a 
                key={key} 
                href={`#${key}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-serif text-brand-dark"
              >
                {t.nav[key as keyof typeof t.nav]}
              </a>
            ))}

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {languages.map(lang => (
                <button 
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setIsMobileMenuOpen(false); }}
                  className={`px-4 py-2 rounded-full text-xs font-bold border ${language === lang.code ? 'bg-brand-terracotta border-brand-terracotta text-white' : 'border-brand-dark/10 text-brand-dark'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
