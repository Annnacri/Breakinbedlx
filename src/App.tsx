import { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, Check, Plus, Minus, X } from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { MenuItem, CartItem, AppView, DELIVERY_FEE, MENU_ITEMS } from './types';

const App = () => {
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'snacks' | 'menus'>('all');
  const [view, setView] = useState<AppView>('home');
  
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [airbnbAddress, setAirbnbAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('08:30 - 09:00');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setView('success');
      setCart([]);
      localStorage.removeItem('breakinbed_cart');
    } else if (params.get('canceled') === 'true') {
      setView('cancel');
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('breakinbed_cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao restaurar carrinho:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('breakinbed_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: MenuItem) => {
    const existing = cart.find((c: CartItem) => c.menuItem.id === item.id);
    if (existing) {
      setCart(cart.map((c: CartItem) => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { menuItem: item, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, amount: number) => {
    const updated = cart.map((c: CartItem) => {
      if (c.menuItem.id === itemId) {
        const newQty = c.quantity + amount;
        return newQty > 0 ? { ...c, quantity: newQty } : null;
      }
      return c;
    }).filter((c: CartItem | null): c is CartItem => c !== null);
    setCart(updated);
  };

  const getCartSubtotal = () => cart.reduce((acc, curr) => acc + (curr.menuItem.price * curr.quantity), 0);
  const getCartTotal = () => getCartSubtotal() + DELIVERY_FEE;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const bookingData = {
        clientName, clientEmail, clientPhone, airbnbAddress, deliveryDate, deliveryTime,
        deliveryNotes: deliveryNotes || '',
        items: cart.map(c => ({ id: c.menuItem.id, title: lang === 'pt' ? c.menuItem.title : c.menuItem.titleEn, quantity: c.quantity, price: c.menuItem.price })),
        subtotal: getCartSubtotal(), deliveryFee: DELIVERY_FEE, totalPrice: getCartTotal(),
        status: 'pending', createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: docRef.id,
          items: cart.map(c => ({ name: lang === 'pt' ? c.menuItem.title : c.menuItem.titleEn, price: Math.round(c.menuItem.price * 100), quantity: c.quantity })),
          deliveryFee: Math.round(DELIVERY_FEE * 100), clientEmail, clientName
        })
      });

      if (!response.ok) throw new Error('Erro na API');
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (err) {
      setSubmitError(lang === 'pt' ? 'Erro ao conectar.' : 'Connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = activeCategory === 'all' ? MENU_ITEMS : MENU_ITEMS.filter(item => item.category === activeCategory);

  if (view === 'success') return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4 text-center">
      <Check className="w-16 h-16 text-green-600 mb-4" />
      <h1 className="text-2xl font-bold mb-4">{lang === 'pt' ? 'Obrigado!' : 'Thank You!'}</h1>
      <button onClick={() => setView('home')} className="bg-amber-600 text-white px-6 py-2 rounded-xl">Voltar</button>
    </div>
  );

  if (view === 'cancel') return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4 text-center">
      <X className="w-16 h-16 text-red-600 mb-4" />
      <h1 className="text-2xl font-bold mb-4">{lang === 'pt' ? 'Cancelado' : 'Canceled'}</h1>
      <button onClick={() => setView('home')} className="bg-amber-600 text-white px-6 py-2 rounded-xl">Tentar Novamente</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="bg-[#1F1916] text-white py-2 px-4 text-xs flex justify-between items-center">
        <span>☀️ Breakfast in Bed Lisbon</span>
        <div className="flex gap-4">
          <button onClick={() => setLang('pt')} className={lang === 'pt' ? 'text-amber-400' : ''}>PT</button>
          <button onClick={() => setLang('en')} className={lang === 'en' ? 'text-amber-400' : ''}>EN</button>
        </div>
      </div>

      <section className="h-64 flex items-center justify-center bg-neutral-900 text-white text-3xl font-serif">
        Breakfast in Bed
      </section>

      <div className="flex justify-center gap-4 my-8">
        {['all', 'menus', 'snacks'].map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat as any)} className={`px-4 py-2 rounded-xl text-xs font-bold border ${activeCategory === cat ? 'bg-amber-600 text-white' : 'bg-white'}`}>
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 max-w-7xl mx-auto mb-12">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border overflow-hidden shadow-sm flex flex-col">
            <img src={item.image} alt={item.title} className="h-40 w-full object-cover" />
            <div className="p-4 flex-1 flex flex-col justify-between">
              <h3 className="font-bold">{lang === 'pt' ? item.title : item.titleEn}</h3>
              <p className="text-amber-700 font-bold mb-4">{item.price.toFixed(2)}€</p>
              <button onClick={() => addToCart(item)} className="w-full py-2 bg-[#1F1916] text-white rounded-xl text-xs font-bold">ADD TO CART</button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <button onClick={() => setIsCartOpen(true)} className="fixed bottom-6 right-6 bg-amber-600 text-white px-6 py-4 rounded-full shadow-xl font-bold flex items-center gap-2">
          <ShoppingBag size={20} /> {getCartTotal().toFixed(2)}€
        </button>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Pedido</h2>
              <button onClick={() => setIsCartOpen(false)}><X /></button>
            </div>
            {cart.map(item => (
              <div key={item.menuItem.id} className="flex justify-between items-center mb-4 bg-neutral-50 p-3 rounded-xl">
                <span className="text-sm font-bold">{lang === 'pt' ? item.menuItem.title : item.menuItem.titleEn}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.menuItem.id, -1)}><Minus size={14}/></button>
                  <span className="text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.menuItem.id, 1)}><Plus size={14}/></button>
                </div>
              </div>
            ))}
            <div className="border-t pt-4 mt-4">
              <p className="text-right font-bold text-lg mb-6">Total: <span className="text-amber-700">{getCartTotal().toFixed(2)}€</span></p>
              <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-3">
                <input required placeholder="Nome" value={clientName} onChange={e => setClientName(e.target.value)} className="border p-3 rounded-xl text-sm" />
                <input required type="email" placeholder="Email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="border p-3 rounded-xl text-sm" />
                <input required placeholder="Telefone" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="border p-3 rounded-xl text-sm" />
                <input required placeholder="Morada Airbnb" value={airbnbAddress} onChange={e => setAirbnbAddress(e.target.value)} className="border p-3 rounded-xl text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input required type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="border p-3 rounded-xl text-sm" />
                  <select value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="border p-3 rounded-xl text-sm bg-white">
                    <option value="08:00 - 08:30">08:00 - 08:30</option>
                    <option value="08:30 - 09:00">08:30 - 09:00</option>
                  </select>
                </div>
                <textarea placeholder="Notas" value={deliveryNotes} onChange={e => setDeliveryNotes(e.target.value)} className="border p-3 rounded-xl text-sm h-20" />
                <button type="submit" disabled={isSubmitting} className="bg-amber-600 text-white py-4 rounded-xl font-bold uppercase">
                  {isSubmitting ? 'Processando...' : 'Pagar Agora'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
