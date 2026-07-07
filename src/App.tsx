import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  X
} from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

// Interfaces
interface MenuItem {
  id: string;
  title: string;
  titleEn: string;
  category: 'snacks' | 'menus';
  price: number;
  description: string;
  descriptionEn: string;
  image: string;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

type AppView = 'home' | 'success' | 'cancel';

// Constants
const DELIVERY_FEE = 3.90;

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'rissol-leitao',
    title: 'Rissol de Leitão',
    titleEn: 'Suckling Pig Rissol',
    category: 'snacks',
    price: 3.90,
    description: 'Salgado tradicional crocante com recheio cremoso e intenso de leitão assado.',
    descriptionEn: 'Traditional crispy savory pastry with a creamy and intense roasted suckling pig filling.',
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'croquete-vitela',
    title: 'Croquete de Vitela',
    titleEn: 'Veal Croquette',
    category: 'snacks',
    price: 1.90,
    description: 'Croquete artesanal feito com carne de vitela selecionada e frito na perfeição.',
    descriptionEn: 'Artisanal croquette made with selected veal meat and fried to golden perfection.',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'prego-pao',
    title: 'Prego no Pão c/ Picles',
    titleEn: 'Prego Steak Sandwich with Pickles',
    category: 'snacks',
    price: 4.90,
    description: 'Prego de carne tenra em pão tipicamente português, acompanhado com picles estaladiços.',
    descriptionEn: 'Tender beef steak sandwich in traditional Portuguese bread, served with crunchy pickles.',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'bifana-portuguesa',
    title: 'Bifana à Portuguesa no Pão',
    titleEn: 'Portuguese Bifana Pork Sandwich',
    category: 'snacks',
    price: 3.90,
    description: 'A clássica bifana de porco marinada em vinagre, alho e especiarias, servida quente no pão.',
    descriptionEn: 'The classic Portuguese pork sandwich marinated in garlic, wine, and spices, served hot.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-summer',
    title: 'Menu Verão',
    titleEn: 'Summer Menu',
    category: 'menus',
    price: 9.90,
    description: 'Opção leve e refrescante ideal para as manhãs quentes e radiantes de Lisboa.',
    descriptionEn: 'A light and refreshing option ideal for Lisbon\'s warm and radiant mornings.',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-brunch',
    title: 'Menu Brunch',
    titleEn: 'Brunch Menu',
    category: 'menus',
    price: 14.90,
    description: 'Um brunch completo e reforçado com uma excelente seleção para o teu meio-dia.',
    descriptionEn: 'A complete and hearty brunch featuring an excellent selection for your midday experience.',
    image: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-portugues',
    title: 'Menu Português',
    titleEn: 'Portuguese Menu',
    category: 'menus',
    price: 8.90,
    description: 'A simbiose perfeita dos sabores tradicionais portugueses num pequeno-almoço autêntico.',
    descriptionEn: 'The perfect symbiosis of traditional Portuguese flavors in an authentic breakfast.',
    image: 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-vitamina-c',
    title: 'Menu Vitamina C',
    titleEn: 'Vitamin C Menu',
    category: 'menus',
    price: 9.90,
    description: 'Uma opção energética, sumarenta e fresca rica em vitamina C, perfeita para começar o dia.',
    descriptionEn: 'An energizing, juicy, and fresh choice packed with vitamin C, perfect to kickstart your day.',
    image: 'https://images.unsplash.com/photo-1621510456681-23a23cfb5f57?w=600&auto=format&fit=crop&q=80'
  }
];

const App = () => {
  // Estados necessários
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

  // Efeitos para persistência e redirecionamento
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

  // Funções do carrinho
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

  const getCartSubtotal = () => {
    return cart.reduce((acc: number, current: CartItem) => acc + (current.menuItem.price * current.quantity), 0);
  };

  const getCartTotal = () => {
    return getCartSubtotal() + DELIVERY_FEE;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    const bookingData = {
      clientName,
      clientEmail,
      clientPhone,
      airbnbAddress,
      deliveryDate,
      deliveryTime,
      deliveryNotes: deliveryNotes || '',
      items: cart.map((c: CartItem) => ({
        id: c.menuItem.id,
        title: lang === 'pt' ? c.menuItem.title : c.menuItem.titleEn,
        quantity: c.quantity,
        price: c.menuItem.price
      })),
      subtotal: getCartSubtotal(),
      deliveryFee: DELIVERY_FEE,
      totalPrice: getCartTotal(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      // Gravar no Firebase
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      const bookingId = docRef.id;

      // Criar Checkout no Stripe
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          items: cart.map((c: CartItem) => ({
            name: lang === 'pt' ? c.menuItem.title : c.menuItem.titleEn,
            price: Math.round(c.menuItem.price * 100),
            quantity: c.quantity
          })),
          deliveryFee: Math.round(DELIVERY_FEE * 100),
          clientEmail,
          clientName
        })
      });

      if (!response.ok) throw new Error('Erro na API');

      const { url } = await response.json();
      if (url) window.location.href = url;
      
    } catch (err) {
      console.error(err);
      setSubmitError(lang === 'pt' ? 'Erro ao conectar. Tente novamente.' : 'Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = activeCategory === 'all' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter((item: MenuItem) => item.category === activeCategory);

  // Renderização das Vistas
  if (view === 'success') {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">{lang === 'pt' ? 'Obrigado!' : 'Thank You!'}</h1>
          <p className="mb-6">{lang === 'pt' ? 'Pagamento confirmado.' : 'Payment confirmed.'}</p>
          <button onClick={() => setView('home')} className="px-6 py-2 bg-amber-600 text-white rounded-xl">
            {lang === 'pt' ? 'Voltar' : 'Back'}
          </button>
        </div>
      </div>
    );
  }

  if (view === 'cancel') {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
        <div className="text-center">
          <X className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">{lang === 'pt' ? 'Cancelado' : 'Canceled'}</h1>
          <button onClick={() => setView('home')} className="px-6 py-2 bg-amber-600 text-white rounded-xl">
            {lang === 'pt' ? 'Tentar novamente' : 'Try again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col antialiased">
      {/* Header com Idioma */}
      <div className="bg-[#1F1916] text-[#F9F6F0] py-2 px-4 text-xs flex justify-between items-center z-40">
        <span>☀️ {lang === 'pt' ? 'Entrega em Lisboa' : 'Lisbon Delivery'}</span>
        <div className="flex gap-4">
          <button onClick={() => setLang('pt')} className={lang === 'pt' ? 'text-amber-400 font-bold' : ''}>PT</button>
          <button onClick={() => setLang('en')} className={lang === 'en' ? 'text-amber-400 font-bold' : ''}>EN</button>
        </div>
      </div>

      {/* Hero */}
      <section className="h-[400px] flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=1600')" }}>
        <h1 className="text-4xl md:text-6xl font-bold text-white font-serif">Breakfast in Bed</h1>
      </section>

      {/* Categorias */}
      <div className="flex justify-center gap-4 my-8">
        <button onClick={() => setActiveCategory('all')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeCategory === 'all' ? 'bg-amber-600 text-white' : 'bg-white border'}`}>TUDO</button>
        <button onClick={() => setActiveCategory('menus')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeCategory === 'menus' ? 'bg-amber-600 text-white' : 'bg-white border'}`}>MENUS</button>
        <button onClick={() => setActiveCategory('snacks')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeCategory === 'snacks' ? 'bg-amber-600 text-white' : 'bg-white border'}`}>SNACKS</button>
      </div>

      {/* Grelha de Produtos */}
      <section className="py-8 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item: MenuItem) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden border flex flex-col shadow-sm">
              <img src={item.image} alt={item.title} className="h-48 w-full object-cover" />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg">{lang === 'pt' ? item.title : item.titleEn}</h3>
                  <p className="text-sm text-neutral-500 mb-2">{item.price.toFixed(2)}€</p>
                </div>
                <button onClick={() => addToCart(item)} className="w-full py-2 bg-[#1F1916] text-white rounded-xl font-bold uppercase text-xs">
                  {lang === 'pt' ? 'Adicionar' : 'Add to Order'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Botão Flutuante do Carrinho */}
      {cart.length > 0 && (
        <button onClick={() => setIsCartOpen(true)} className="fixed bottom-6 right-6 z-40 bg-amber-600 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold">
          <ShoppingBag className="w-5 h-5" />
          <span>{getCartTotal().toFixed(2)}€</span>
        </button>
      )}

      {/* Drawer do Carrinho */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{lang === 'pt' ? 'O Teu Pedido' : 'Your Order'}</h3>
              <button onClick={() => setIsCartOpen(false)}><X /></button>
            </div>

            {cart.map((item: CartItem) => (
              <div key={item.menuItem.id} className="flex justify-between items-center mb-4 p-3 bg-neutral-50 rounded-xl">
                <div>
                  <p className="font-bold text-sm">{lang === 'pt' ? item.menuItem.title : item.menuItem.titleEn}</p>
                  <p className="text-xs text-amber-700">{item.menuItem.price.toFixed(2)}€</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item.menuItem.id, -1)} className="p-1"><Minus size={14}/></button>
                  <span className="font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.menuItem.id, 1)} className="p-1"><Plus size={14}/></button>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total:</span>
                <span className="text-amber-700">{getCartTotal().toFixed(2)}€</span>
              </div>

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
                    <option value="09:00 - 09:30">09:00 - 09:30</option>
                  </select>
                </div>
                <textarea placeholder="Notas (opcional)" value={deliveryNotes} onChange={e => setDeliveryNotes(e.target.value)} className="border p-3 rounded-xl text-sm h-20 resize-none" />
                
                {submitError && <p className="text-red-500 text-xs font-bold">{submitError}</p>}
                
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-amber-600 text-white font-bold rounded-xl uppercase tracking-wider">
                  {isSubmitting ? 'A processar...' : 'Pagar Agora'}
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
