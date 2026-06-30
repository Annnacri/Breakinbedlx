import { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  X, 
  Sparkles
} from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

// 1. DICIONÁRIO DE LINKS DE PAGAMENTO REAIS DO STRIPE
const STRIPE_PAYMENT_LINKS: Record<string, string> = {
  'rissol-leitao': 'https://buy.stripe.com/9B63cw2eybqibrB7dG5gc0a',
  'croquete-vitela': 'https://buy.stripe.com/eVq6oIf1k3XQanxeG85gc0b',
  'prego-pao': 'https://buy.stripe.com/8x214odXgbqi53deG85gc0c',
  'bifana-portuguesa': 'https://buy.stripe.com/00w3cw7yS51U7bldC45gc0d',
  'menu-summer': 'https://buy.stripe.com/00w7sM4mGameeDN1Tm5gc0e',
  'menu-brunch': 'https://buy.stripe.com/00wcN62eydyqcvF9lO5gc0f',
  'menu-portugues': 'https://buy.stripe.com/aFa4gA6uOcum67hcy05gc0j',
  'menu-vitamina-c': 'https://buy.stripe.com/bJeaEY1audyq7bl0Pi5gc0l',
};

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

export default function App() {
  // Estados da Aplicação
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'snacks' | 'menus'>('all');
  
  // Estados do Formulário do Cliente
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [airbnbAddress, setAirbnbAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('08:30 - 09:00');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  
  // Estados de Carregamento e Erro
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Lista dos 8 produtos reais
  const menuItems: MenuItem[] = [
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
      descriptionEn: 'A light and refreshing option ideal for Lisbon’s warm and radiant mornings.',
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

  // Funções do Carrinho
  const addToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.menuItem.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { menuItem: item, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, amount: number) => {
    const updated = cart.map(c => {
      if (c.menuItem.id === itemId) {
        const newQty = c.quantity + amount;
        return newQty > 0 ? { ...c, quantity: newQty } : null;
      }
      return c;
    }).filter((c): c is CartItem => c !== null);
    
    setCart(updated);
  };

  const getCartTotal = () => {
    return cart.reduce((acc, current) => acc + (current.menuItem.price * current.quantity), 0);
  };

  // FUNÇÃO DE SUBMIT CORRIGIDA COM TIPAGEM EXPLICITA
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    const selectedItemId = cart[0]?.menuItem.id;
    const stripeCheckoutUrl = STRIPE_PAYMENT_LINKS[selectedItemId];

    if (!stripeCheckoutUrl) {
      setSubmitError(lang === 'pt' 
        ? 'Link de pagamento não configurado para este produto.' 
        : 'Payment link not configured for this product.');
      setIsSubmitting(false);
      return;
    }

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
      totalPrice: getCartTotal(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      try {
        await addDoc(collection(db, 'bookings'), bookingData);
      } catch (firebaseErr) {
        console.error("Aviso do Firebase:", firebaseErr);
      }

      setCart([]);
      setIsCartOpen(false);
      window.location.assign(stripeCheckoutUrl);
      
    } catch (err) {
      console.error("Erro geral no checkout:", err);
      setSubmitError(lang === 'pt' ? 'Erro ao conectar ao sistema.' : 'Error connecting to the system.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 flex flex-col antialiased">
      
      {/* Top Banner */}
      <div className="bg-[#1F1916] text-[#F9F6F0] py-2 px-4 text-xs font-semibold flex justify-between items-center z-40">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>☀️ {lang === 'pt' ? 'Entrega garantida no seu Airbnb em Lisboa' : 'Guaranteed delivery to your Airbnb in Lisbon'}</span>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setLang('pt')} className={`transition-colors py-0.5 px-2 rounded-md ${lang === 'pt' ? 'bg-amber-600 text-white' : 'hover:text-amber-300'}`}>Português</button>
          <button type="button" onClick={() => setLang('en')} className={`transition-colors py-0.5 px-2 rounded-md ${lang === 'en' ? 'bg-amber-600 text-white' : 'hover:text-amber-300'}`}>English</button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center text-center px-4 bg-cover bg-center overflow-hidden" style={{ backgroundImage: "linear-gradient(rgba(10, 8, 6, 0.6), rgba(10, 8, 8, 0.9)), url('https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=1600&auto=format&fit=crop&q=80')" }}>
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-5 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-amber-400/30 bg-[#251D18]/80 text-amber-300 text-xs tracking-[0.2em] uppercase rounded-full font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Lisbon Local Flavors</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-[#F9F6F0] tracking-tight font-serif">
            Breakfast in Bed
            <span className="block mt-1 text-amber-500 font-serif italic text-2xl md:text-5xl font-normal tracking-wide">Lisbon Experience</span>
          </h1>
          <p className="text-sm md:text-lg text-neutral-300 max-w-2xl font-light">
            {lang === 'pt' ? 'Pequenos-almoços e petiscos tradicionais entregues diretamente na porta do teu alojamento.' : 'Traditional breakfasts and savory snacks delivered right to your accommodation doorstep.'}
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div className="flex justify-center gap-4 mt-12">
        <button onClick={() => setActiveCategory('all')} className={`px-4 py-2 rounded-xl text-xs uppercase font-bold transition-all ${activeCategory === 'all' ? 'bg-amber-600 text-white' : 'bg-white border border-neutral-200 text-neutral-600'}`}>
          {lang === 'pt' ? 'Tudo' : 'All'}
        </button>
        <button onClick={() => setActiveCategory('menus')} className={`px-4 py-2 rounded-xl text-xs uppercase font-bold transition-all ${activeCategory === 'menus' ? 'bg-amber-600 text-white' : 'bg-white border border-neutral-200 text-neutral-600'}`}>
          Menus
        </button>
        <button onClick={() => setActiveCategory('snacks')} className={`px-4 py-2 rounded-xl text-xs uppercase font-bold transition-all ${activeCategory === 'snacks' ? 'bg-amber-600 text-white' : 'bg-white border border-neutral-200 text-neutral-600'}`}>
          {lang === 'pt' ? 'Petiscos / Salgados' : 'Savory Snacks'}
        </button>
      </div>

      {/* Products Grid */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-neutral-200 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
              <div className="relative h-48 bg-neutral-100">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-base font-bold text-neutral-900 font-serif">{lang === 'pt' ? item.title : item.titleEn}</h3>
                    <span className="text-sm font-black text-amber-700 whitespace-nowrap">{item.price.toFixed(2)}€</span>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-2">{lang === 'pt' ? item.description : item.descriptionEn}</p>
                </div>
                <button onClick={() => addToCart(item)} type="button" className="w-full py-2.5 bg-[#1F1916] hover:bg-amber-700 text-white text-xs uppercase font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {lang === 'pt' ? 'Adicionar' : 'Add to Order'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button onClick={() => setIsCartOpen(true)} type="button" className="fixed bottom-6 right-6 z-40 bg-amber-600 hover:bg-amber-700 text-white px-5 py-4 rounded-full shadow-2xl flex items-center gap-3 font-semibold">
          <ShoppingBag className="w-5 h-5" />
          <span className="text-sm">{lang === 'pt' ? 'Completar Pedido' : 'Checkout'}</span>
          <span className="text-sm font-bold bg-[#1F1916]/20 px-2.5 py-0.5 rounded-lg">{getCartTotal().toFixed(2)}€</span>
        </button>
      )}

      {/* Sidebar Cart / Checkout */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 z-50 flex justify-end backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl overflow-y-auto p-6">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">{lang === 'pt' ? 'O Teu Pedido' : 'My Order'}</h3>
                <button type="button" onClick={() => setIsCartOpen(false)}><X className="w-5 h-5" /></button>
              </div>

              {cart.map(item => (
                <div key={item.menuItem.id} className="flex justify-between items-center bg-neutral-50 p-3 rounded-xl mb-3">
                  <div className="flex-1 pr-2">
                    <h4 className="text-xs font-bold text-neutral-900">{lang === 'pt' ? item.menuItem.title : item.menuItem.titleEn}</h4>
                    <span className="text-xs text-amber-700 font-bold">{(item.menuItem.price * item.quantity).toFixed(2)}€</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="p-1 hover:text-amber-600" onClick={() => updateQuantity(item.menuItem.id, -1)}><Minus className="w-3.5 h-3.5" /></button>
                    <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                    <button type="button" className="p-1 hover:text-amber-600" onClick={() => updateQuantity(item.menuItem.id, 1)}><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              
              <div className="text-right font-black text-lg text-neutral-900 mt-4 mb-6 border-t pt-3">
                Total: <span className="text-amber-700">{getCartTotal().toFixed(2)}€</span>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-3.5">
                <div className="text-xs font-bold uppercase text-neutral-400 tracking-wider mb-1">{lang === 'pt' ? 'Dados de Entrega' : 'Delivery Details'}</div>
                <input type="text" required placeholder={lang === 'pt' ? 'Teu Nome' : 'Your Name'} value={clientName} onChange={(e) => setClientName(e.target.value)} className="border p-2.5 rounded-xl text-xs w-full focus:outline-amber-600" />
                <input type="email" required placeholder="Email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="border p-2.5 rounded-xl text-xs w-full focus:outline-amber-600" />
                <input type="text" required placeholder={lang === 'pt' ? 'Telefone / WhatsApp' : 'Phone / WhatsApp'} value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="border p-2.5 rounded-xl text-xs w-full focus:outline-amber-600" />
                <input type="text" required placeholder={lang === 'pt' ? 'Morada Completa do Airbnb' : 'Full Airbnb Address'} value={airbnbAddress} onChange={(e) => setAirbnbAddress(e.target.value)} className="border p-2.5 rounded-xl text-xs w-full focus:outline-amber-600" />
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase text-neutral-400 font-bold mb-1">{lang === 'pt' ? 'Data' : 'Date'}</label>
                    <input type="date" required value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="border p-2 rounded-xl text-xs w-full focus:outline-amber-600" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-neutral-400 font-bold mb-1">{lang === 'pt' ? 'Horário' : 'Time'}</label>
                    <select value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="border p-2 rounded-xl text-xs w-full bg-white focus:outline-amber-600">
                      <option value="08:00 - 08:30">08:00 - 08:30</option>
                      <option value="08:30 - 09:00">08:30 - 09:00</option>
                      <option value="09:00 - 09:30">09:00 - 09:30</option>
                      <option value="09:30 - 10:00">09:30 - 10:00</option>
                      <option value="10:00 - 10:30">10:00 - 10:30</option>
                    </select>
                  </div>
                </div>

                <textarea placeholder={lang === 'pt' ? 'Notas adicionais (ex: código da porta, alergias...)' : 'Additional notes (e.g. door code, allergies...)'} value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} className="border p-2.5 rounded-xl text-xs w-full h-16 resize-none focus:outline-amber-600" />
                
                {submitError && <p className="text-red-500 text-xs font-bold">{submitError}</p>}

                <button type="submit" disabled={isSubmitting} className="w-full mt-2 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md">
                  {isSubmitting ? '...' : (lang === 'pt' ? 'Ir para Pagamento Seguro' : 'Proceed to Secure Payment')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
