import { useState, useEffect } from 'react';
import { ShoppingBag, Check, Plus, Minus, X } from 'lucide-react';

// --- CONFIGURAÇÃO ---
const WHATSAPP_NUMBER = '351964423221';
const DELIVERY_FEE = 3.90;

// --- TIPOS ---
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

// --- DADOS DOS PRODUTOS ---
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

// --- COMPONENTE PRINCIPAL ---
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

  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!clientName || !clientEmail || !clientPhone || !airbnbAddress || !deliveryDate || !deliveryTime) {
      alert(lang === 'pt' ? 'Preenche todos os campos!' : 'Please fill all fields!');
      return;
    }

    const itemsList = cart.map(c => `${c.quantity}x ${lang === 'pt' ? c.menuItem.title : c.menuItem.titleEn}`).join('\n');
    const subtotal = getCartSubtotal().toFixed(2);
    const total = getCartTotal().toFixed(2);

    const message = `Olá! Gostaria de fazer um pedido:

${itemsList}

*Detalhes do Pedido:*
Subtotal: €${subtotal}
Taxa de Entrega: €${DELIVERY_FEE.toFixed(2)}
*Total: €${total}*

*Dados de Entrega:*
Nome: ${clientName}
Email: ${clientEmail}
Telefone: ${clientPhone}
Morada: ${airbnbAddress}
Data: ${deliveryDate}
Hora: ${deliveryTime}
${deliveryNotes ? `Notas: ${deliveryNotes}` : ''}

Obrigado!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    setCart([]);
    localStorage.removeItem('breakinbed_cart');
    setIsCartOpen(false);
    setView('success');
  };

  const filteredItems = activeCategory === 'all' ? MENU_ITEMS : MENU_ITEMS.filter(item => item.category === activeCategory);

  if (view === 'success') return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4 text-center">
      <Check className="w-16 h-16 text-green-600 mb-4" />
      <h1 className="text-2xl font-bold mb-2">{lang === 'pt' ? 'Pedido Enviado!' : 'Order Sent!'}</h1>
      <p className="text-neutral-600 mb-6">{lang === 'pt' ? 'O teu pedido foi enviado para o WhatsApp. Aguarda confirmação!' : 'Your order has been sent to WhatsApp. Wait for confirmation!'}</p>
      <button onClick={() => { setView('home'); setClientName(''); setClientEmail(''); setClientPhone(''); setAirbnbAddress(''); setDeliveryDate(''); setDeliveryNotes(''); }} className="bg-amber-600 text-white px-6 py-2 rounded-xl font-bold">
        {lang === 'pt' ? 'Fazer Novo Pedido' : 'New Order'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col antialiased">
      <div className="bg-[#1F1916] text-white py-2 px-4 text-xs flex justify-between items-center">
        <span>☀️ Breakfast in Bed Lisbon</span>
        <div className="flex gap-4">
          <button onClick={() => setLang('pt')} className={lang === 'pt' ? 'text-amber-400 font-bold' : ''}>PT</button>
          <button onClick={() => setLang('en')} className={lang === 'en' ? 'text-amber-400 font-bold' : ''}>EN</button>
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
        <button onClick={() => setIsCartOpen(true)} className="fixed bottom-6 right-6 bg-amber-600 text-white px-6 py-4 rounded-full shadow-xl font-bold flex items-center gap-2 z-40">
          <ShoppingBag size={20} /> {getCartTotal().toFixed(2)}€
        </button>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{lang === 'pt' ? 'O Teu Pedido' : 'Your Order'}</h2>
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
              <p className="text-right font-bold text-lg mb-6">{lang === 'pt' ? 'Total' : 'Total'}: <span className="text-amber-700">{getCartTotal().toFixed(2)}€</span></p>
              <form onSubmit={handleWhatsAppCheckout} className="flex flex-col gap-3">
                <input required placeholder={lang === 'pt' ? 'Nome' : 'Name'} value={clientName} onChange={e => setClientName(e.target.value)} className="border p-3 rounded-xl text-sm" />
                <input required type="email" placeholder={lang === 'pt' ? 'Email' : 'Email'} value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="border p-3 rounded-xl text-sm" />
                <input required placeholder={lang === 'pt' ? 'Telefone' : 'Phone'} value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="border p-3 rounded-xl text-sm" />
                <input required placeholder={lang === 'pt' ? 'Morada Airbnb' : 'Airbnb Address'} value={airbnbAddress} onChange={e => setAirbnbAddress(e.target.value)} className="border p-3 rounded-xl text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input required type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="border p-3 rounded-xl text-sm" />
                  <select value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="border p-3 rounded-xl text-sm bg-white">
                    <option value="08:00 - 08:30">08:00 - 08:30</option>
                    <option value="08:30 - 09:00">08:30 - 09:00</option>
                    <option value="09:00 - 09:30">09:00 - 09:30</option>
                    <option value="09:30 - 10:00">09:30 - 10:00</option>
                  </select>
                </div>
                <textarea placeholder={lang === 'pt' ? 'Notas (opcional)' : 'Notes (optional)'} value={deliveryNotes} onChange={e => setDeliveryNotes(e.target.value)} className="border p-3 rounded-xl text-sm h-20" />
                <button type="submit" className="bg-green-500 text-white py-4 rounded-xl font-bold uppercase flex items-center justify-center gap-2">
                  <span>💬</span> {lang === 'pt' ? 'Enviar via WhatsApp' : 'Send via WhatsApp'}
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
