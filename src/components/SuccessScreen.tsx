import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, Calendar, Clock, MapPin, Package, ChevronRight, Home } from 'lucide-react';

interface SuccessScreenProps {
  sessionId: string;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ sessionId }) => {
  const { t } = useLanguage();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/order-details/${sessionId}`);
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchOrderDetails();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-terracotta/20 border-t-brand-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const metadata = order.metadata || {};

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-brand-dark p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-terracotta blur-3xl" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-sage blur-3xl" />
            </div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
              className="relative z-10 w-20 h-20 bg-brand-terracotta rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-serif mb-4 relative z-10">{t.success.title}</h1>
            <p className="text-white/60 font-serif italic relative z-10">{t.success.thankYou}</p>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-dark/40 border-b border-black/5 pb-2">
                  {t.success.delivery}
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-brand-beige rounded-xl flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-brand-terracotta" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-widest text-brand-dark/40 mb-0.5">{t.cart.deliveryDate}</span>
                      <span className="font-serif text-lg">{metadata.deliveryDate}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-brand-beige rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-brand-terracotta" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-widest text-brand-dark/40 mb-0.5">{t.success.deliveryTime}</span>
                      <span className="font-serif text-lg">{metadata.deliveryTime}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-brand-beige rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-brand-terracotta" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-widest text-brand-dark/40 mb-0.5">{t.cart.address}</span>
                      <span className="font-serif text-lg leading-snug">{metadata.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-dark/40 border-b border-black/5 pb-2">
                  {t.success.summary}
                </h3>
                <div className="space-y-4">
                  {order.line_items?.data.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-beige rounded-lg flex items-center justify-center text-[10px] font-bold">
                          {item.quantity}x
                        </div>
                        <span className="font-medium">{item.description}</span>
                      </div>
                      <span className="font-serif">€{(item.amount_total / 100).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-4 mt-4 border-t border-black/5 flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-dark/40">{t.cart.total}</span>
                    <span className="text-2xl font-serif text-brand-terracotta">€{(order.amount_total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="pt-8 text-center">
              <a 
                href="/" 
                className="inline-flex items-center gap-3 bg-brand-dark text-white px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-dark/95 transition-all group scale-100 hover:scale-[1.02] active:scale-95 shadow-xl"
              >
                <Home className="w-4 h-4" />
                {t.success.backToHome}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SuccessScreen;
