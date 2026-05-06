import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { X, Calendar, Clock, MapPin, User, Mail, Phone, CreditCard, ChevronRight, ChevronLeft, ShoppingBag } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

// IMPORTANT: Do not put real keys in code. The system will prompt the user to add them.
// @ts-ignore
const stripePromise = loadStripe((import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const DELIVERY_FEE = 3.5;

interface CheckoutFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const { items, total, removeItem, addItem } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [delivery, setDelivery] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '',
    address: ''
  });
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const next7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Start from tomorrow ideally, or today if early
    return d;
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleCheckout = async () => {
    const publishableKey = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('Stripe Publishable Key is missing. Please add it to AI Studio Secrets.');
      alert('Stripe configuration missing. Please contact support.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            name: i.name[language],
            price: i.price,
            quantity: i.quantity,
            image: i.image,
            description: i.description[language]
          })),
          customer,
          delivery,
          deliveryFee: DELIVERY_FEE
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { id } = data;
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error } = await (stripe as any).redirectToCheckout({ sessionId: id });
        if (error) throw new Error(error.message);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Checkout Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-brand-dark/40 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-brand-cream w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Progress Sidebar (Desktop) */}
        <div className="w-full md:w-1/3 bg-brand-dark p-8 md:p-12 text-white flex flex-col">
          <div className="flex items-center gap-2 mb-12">
            <ShoppingBag className="w-5 h-5 text-brand-terracotta" />
            <span className="text-xs font-bold uppercase tracking-widest">{t.cart.title}</span>
          </div>

          <div className="flex-grow space-y-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className={`flex items-center gap-4 transition-opacity ${step < num ? 'opacity-30' : ''}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${step === num ? 'border-brand-terracotta bg-brand-terracotta' : 'border-white/20'}`}>
                  {num}
                </div>
                <span className="text-sm font-medium">
                  {num === 1 ? t.cart.title : num === 2 ? t.cart.deliveryInfo : t.cart.checkout}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-8 border-t border-white/10 space-y-4">
            <div className="space-y-2 opacity-60">
              <div className="flex justify-between items-center text-xs">
                <span>Subtotal</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>{t.cart.deliveryFee}</span>
                <span>€{DELIVERY_FEE.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-white/10 pt-4">
              <span className="text-xs uppercase tracking-widest text-white/40">{t.cart.total}</span>
              <span className="text-2xl font-serif">€{(total + DELIVERY_FEE).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow p-8 md:p-12 overflow-y-auto">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-brand-dark/40 hover:text-brand-dark">
            <X className="w-6 h-6" />
          </button>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <h2 className="text-3xl">{t.cart.title}</h2>
                <div className="space-y-4">
                  {items.length === 0 ? (
                    <p className="text-brand-dark/40 italic py-8">{t.cart.empty}</p>
                  ) : (
                    items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-black/5">
                        <div className="flex items-center gap-4">
                          <img src={item.image} alt={item.name[language]} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <h4 className="font-medium text-brand-dark">{item.name[language]}</h4>
                            <p className="text-xs text-brand-dark/40">€{item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-full border border-black/5 flex items-center justify-center hover:bg-brand-beige"><Minus className="w-3 h-3" /></button>
                          <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => addItem(item)} className="w-8 h-8 rounded-full border border-black/5 flex items-center justify-center hover:bg-brand-beige"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {items.length > 0 && (
                  <button onClick={nextStep} className="premium-btn premium-btn-primary w-full flex items-center justify-center gap-2">
                    {t.cart.deliveryInfo} <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <h2 className="text-3xl">{t.cart.deliveryInfo}</h2>
                <div className="space-y-4">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-dark/40 flex items-center gap-2 px-1">
                      <Calendar className="w-3 h-3" /> {t.cart.deliveryDate}
                    </label>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {next7Days.map((date) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const dayName = date.toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', { weekday: 'short' });
                        const dayNum = date.getDate();
                        const isSelected = delivery.date === dateStr;
                        
                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => setDelivery({...delivery, date: dateStr})}
                            className={`flex-shrink-0 w-20 py-4 rounded-[2rem] flex flex-col items-center justify-center transition-all border ${
                              isSelected 
                                ? 'bg-brand-dark text-white border-brand-dark shadow-xl' 
                                : 'bg-white text-brand-dark/40 border-black/5 hover:border-brand-terracotta/30'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-bold tracking-widest mb-1">{dayName}</span>
                            <span className="text-xl font-serif">{dayNum}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-dark/40 flex items-center gap-2 px-1">
                      <Clock className="w-3 h-3" /> {t.cart.deliveryTime}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00'].map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setDelivery({...delivery, time: slot})}
                          className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                            delivery.time === slot 
                              ? 'bg-brand-terracotta text-white border-brand-terracotta' 
                              : 'bg-white text-brand-dark/60 border-black/5 hover:border-brand-terracotta/30'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-dark/40 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> {t.cart.address}
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="E.g. Rua Augusta, 12, Floor 2, Lisbon..."
                    className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 focus:ring-1 focus:ring-brand-terracotta outline-none text-sm"
                    value={delivery.address}
                    onChange={e => setDelivery({...delivery, address: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={prevStep} className="premium-btn border border-black/10 flex items-center justify-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> {(t.cart as any).back}
                  </button>
                  <button 
                    disabled={!delivery.date || !delivery.time || !delivery.address}
                    onClick={nextStep} 
                    className="premium-btn premium-btn-primary flex-grow flex items-center justify-center gap-2"
                  >
                    {(t.cart as any).contactInfo} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl mb-4">{(t.cart as any).contactInfo}</h2>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-brand-dark/40 flex items-center gap-2">
                          <User className="w-3 h-3" /> {t.cart.name}
                        </label>
                        <input 
                          type="text" 
                          className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 focus:ring-1 focus:ring-brand-terracotta outline-none text-sm"
                          value={customer.name}
                          onChange={e => setCustomer({...customer, name: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-brand-dark/40 flex items-center gap-2">
                            <Mail className="w-3 h-3" /> {t.cart.email}
                          </label>
                          <input 
                            type="email" 
                            className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 focus:ring-1 focus:ring-brand-terracotta outline-none text-sm"
                            value={customer.email}
                            onChange={e => setCustomer({...customer, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-brand-dark/40 flex items-center gap-2">
                            <Phone className="w-3 h-3" /> {t.cart.phone}
                          </label>
                          <input 
                            type="tel" 
                            className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 focus:ring-1 focus:ring-brand-terracotta outline-none text-sm"
                            value={customer.phone}
                            onChange={e => setCustomer({...customer, phone: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-brand-beige/50 rounded-3xl p-6 space-y-4">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-dark/40 border-b border-black/5 pb-2">{(t.cart as any).orderDetails}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest text-brand-dark/30 mb-1">{t.cart.deliveryDate}</span>
                        <span className="text-sm font-medium">{delivery.date}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest text-brand-dark/30 mb-1">{t.cart.deliveryTime}</span>
                        <span className="text-sm font-medium">{delivery.time}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-widest text-brand-dark/30 mb-1">{t.cart.address}</span>
                      <span className="text-sm font-medium line-clamp-2">{delivery.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={prevStep} className="premium-btn border border-black/10 flex items-center justify-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> {(t.cart as any).back}
                  </button>
                  <button 
                    disabled={loading || !customer.name || !customer.email || !customer.phone}
                    onClick={handleCheckout} 
                    className="premium-btn premium-btn-primary flex-grow flex items-center justify-center gap-3 relative"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" /> {t.cart.pay}
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-brand-dark/30 text-center uppercase tracking-widest font-bold">Secure checkout powered by Stripe</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const Plus = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const Minus = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default CheckoutFlow;
