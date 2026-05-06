/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import PromoSection from './components/PromoSection';
import MenuSection from './components/MenuSection';
import DeliveryMap from './components/DeliveryMap';
import Footer from './components/Footer';
import CheckoutFlow from './components/CheckoutFlow';
import SuccessScreen from './components/SuccessScreen';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from './context/CartContext';
import { useLanguage } from './context/LanguageContext';

const AppContent: React.FC = () => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { items, total, clearCart } = useCart();
  const { t } = useLanguage();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Simple routing
  const pathname = window.location.pathname;
  const isSuccessPage = pathname === '/order-success';
  const queryParams = new URLSearchParams(window.location.search);
  const sessionId = queryParams.get('session_id');

  useEffect(() => {
    if (isSuccessPage && sessionId) {
      clearCart();
    }
  }, [isSuccessPage, sessionId, clearCart]);

  if (isSuccessPage && sessionId) {
    return (
      <div className="min-h-screen bg-brand-cream selection:bg-brand-terracotta selection:text-white">
        <Header />
        <SuccessScreen sessionId={sessionId} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream selection:bg-brand-terracotta selection:text-white">
      <Header />
      
      <main>
        <Hero />
        <PromoSection />
        <MenuSection />
        <DeliveryMap />
        
        {/* About Section */}
        <section id="about" className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1590080875515-8a3a8dc2fe0a?auto=format&fit=crop&q=80&w=1200" 
                  alt="Portuguese artisanal food" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-brand-sage border-8 border-brand-cream rounded-full flex flex-col items-center justify-center text-white text-center p-6 shadow-xl">
                <span className="text-3xl font-serif font-bold">100%</span>
                <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Handmade Daily</span>
              </div>
            </div>
            
            <div className="space-y-8">
              <span className="text-brand-terracotta text-sm font-bold uppercase tracking-widest block">About Breakfast in Bed</span>
              <h2 className="text-5xl md:text-6xl leading-[1.1]">Luxury Tourism Experience in Lisbon</h2>
              <p className="text-xl text-brand-dark/60 font-serif leading-relaxed">
                We believe that the most important meal of the day should be an event. Our mission is to combine the warmth of a Portuguese home with the sophistication of a boutique hotel.
              </p>
              <div className="space-y-6 pt-4">
                <div className="flex gap-6 pb-6 border-b border-black/5">
                  <div className="w-12 h-12 bg-brand-terracotta/10 rounded-2xl flex items-center justify-center shrink-0">
                    <span className="text-brand-terracotta font-serif font-bold italic">01</span>
                  </div>
                  <div>
                    <h4 className="text-lg mb-1 font-serif underline decoration-brand-terracotta/20 underline-offset-8">Authentic Artisanal Food</h4>
                    <p className="text-sm text-brand-dark/40 italic">Fresh ingredients sourced daily from local Lisbon markets.</p>
                  </div>
                </div>
                <div className="flex gap-6 pb-6 border-b border-black/5">
                  <div className="w-12 h-12 bg-brand-sage/10 rounded-2xl flex items-center justify-center shrink-0">
                    <span className="text-brand-sage font-serif font-bold italic">02</span>
                  </div>
                  <div>
                    <h4 className="text-lg mb-1 font-serif underline decoration-brand-sage/20 underline-offset-8">Seamless Convenience</h4>
                    <p className="text-sm text-brand-dark/40 italic">Order from your phone and wake up to perfection.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating Cart Button (Mobile) */}
      {cartCount > 0 && !isCheckoutOpen && (
        <div className="fixed bottom-8 left-6 right-6 md:hidden z-40">
          <button 
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full bg-brand-dark text-white p-5 rounded-2xl shadow-2xl flex items-center justify-between group active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-brand-terracotta w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold">{cartCount}</span>
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">{t.cart.checkout}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif">€{total.toFixed(2)}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      )}

      {/* Checkout Sidebar/Modal */}
      <CheckoutFlow 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
      
      {/* Desktop Floating Cart Summary Toggle */}
      {!isCheckoutOpen && cartCount > 0 && (
         <button 
            onClick={() => setIsCheckoutOpen(true)}
            className="fixed bottom-10 right-10 z-40 hidden md:flex items-center gap-4 bg-brand-dark text-white pl-8 pr-4 py-4 rounded-full shadow-2xl hover:bg-brand-dark/95 transition-all group active:scale-95"
          >
            <span className="text-xs font-bold uppercase tracking-widest">{t.cart.checkout}</span>
            <div className="h-4 w-px bg-white/20" />
            <span className="font-serif">€{total.toFixed(2)}</span>
            <div className="w-10 h-10 bg-brand-terracotta rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
         </button>
      )}
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </CartProvider>
    </LanguageProvider>
  );
}

