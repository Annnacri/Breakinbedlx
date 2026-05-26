import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { MenuItem, menus, extras } from '../data/menu';
import { Plus, Minus, Lock } from 'lucide-react';

const MenuItemCard = ({ item, quantity, isLocked, addItem, removeItem, language, addToCartText }: { 
  item: MenuItem; 
  quantity: number; 
  isLocked: boolean;
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  language: string;
  addToCartText: string;
  key?: React.Key;
}) => {
  const lockLabels: { [key: string]: string } = {
    pt: 'Apenas com Menu',
    en: 'With Menu Only',
    es: 'Solo con Menú',
    fr: 'Avec Menu',
    de: 'Nur mit Menü',
    it: 'Solo con Menu'
  };

  const currentLockLabel = lockLabels[language] || 'With Menu Only';

  return (
    <div className="hygge-card p-6 flex flex-col">
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-6">
        <img 
          src={item.image} 
          alt={item.name[language]} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
          <span className="text-sm font-bold text-brand-dark">€{item.price.toFixed(2)}</span>
        </div>
        {isLocked && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-sm border border-black/5 flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-brand-terracotta" />
          </div>
        )}
      </div>

      <h3 className="text-xl mb-2">{item.name[language]}</h3>
      <p className="text-sm text-brand-dark/50 font-serif leading-relaxed mb-8 flex-grow">
        {item.description[language]}
      </p>

      <div className="mt-auto">
        {quantity > 0 ? (
          <div className="flex items-center justify-between bg-brand-beige rounded-full p-1 border border-brand-dark/5">
            <button 
              onClick={() => removeItem(item.id)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white text-brand-dark transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm w-12 text-center">{quantity}</span>
            <button 
              onClick={() => addItem(item)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white text-brand-dark transition-colors"
              disabled={isLocked}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => addItem(item)}
            disabled={isLocked}
            className={`w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
              isLocked 
                ? 'bg-brand-dark/5 text-brand-dark/30 border border-brand-dark/10' 
                : 'bg-brand-terracotta text-white hover:bg-brand-terracotta/90'
            }`}
          >
            {isLocked && <Lock className="w-3 h-3 text-brand-dark/20" />}
            <span>{isLocked ? currentLockLabel : addToCartText}</span>
          </button>
        )}
      </div>
    </div>
  );
};

const MenuSection: React.FC = () => {
  const { t, language } = useLanguage();
  const { addItem, removeItem, items, hasMainItem } = useCart();

  const getItemQuantity = (id: string) => {
    return items.find(i => i.id === id)?.quantity || 0;
  };

  return (
    <section id="menu" className="py-32 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-brand-terracotta text-sm font-bold uppercase tracking-widest block mb-4">Handcrafted daily</span>
          <h2 className="text-5xl md:text-6xl mb-6">{t.menu.title}</h2>
          <div className="w-24 h-1 bg-brand-terracotta/20 mx-auto rounded-full" />
        </motion.div>

        {/* Main Menus */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-32">
          {menus.map((item) => (
            <MenuItemCard 
              key={item.id} 
              item={item} 
              quantity={getItemQuantity(item.id)}
              isLocked={false}
              addItem={addItem}
              removeItem={removeItem}
              language={language}
              addToCartText={t.menu.addToCart}
            />
          ))}
        </div>

        {/* Extras Section */}
        <div className="bg-brand-beige/50 border border-brand-dark/5 rounded-[4rem] p-12 md:p-20">
          <div className="max-w-2xl text-center mx-auto mb-16">
            <h2 className="text-4xl mb-4">{t.menu.extras}</h2>
            <p className="text-brand-dark/40 font-serif italic text-lg leading-relaxed">
              {t.menu.extrasNote}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {extras.map((item) => (
              <MenuItemCard 
                key={item.id} 
                item={item} 
                quantity={getItemQuantity(item.id)}
                isLocked={!hasMainItem}
                addItem={addItem}
                removeItem={removeItem}
                language={language}
                addToCartText={t.menu.addToCart}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
