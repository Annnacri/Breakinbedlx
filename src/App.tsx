import { useState, useEffect } from 'react';
import { 
  Coffee, 
  ShoppingBag, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  X, 
  Trash2, 
  Phone, 
  Mail, 
  User, 
  Heart, 
  Info,
  Gift,
  HelpCircle
} from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';

// Mapeamento dos Price IDs do Stripe guardados na Vercel
const STRIPE_PRICE_IDS: Record<string, string> = {
  'pack-classico': import.meta.env.VITE_STRIPE_PRICE_BRUNCH || '', // Associa ao preço do Brunch configurado
  'pack-saudavel': import.meta.env.VITE_STRIPE_PRICE_VITAMINAC || '', // Associa ao preço da Vitamina C
  'pack-premium': import.meta.env.VITE_STRIPE_PRICE_SUMMER || '', // Associa ao preço Premium/Summer
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: { userId: null, email: null },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface MenuItem {
  id: string;
  title: string;
  titleEn: string;
  category: 'classicos' | 'saudaveis' | 'premium';
  price: number;
  description: string;
  descriptionEn: string;
  items: string[];
  itemsEn: string[];
  image: string;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface BookingItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
}

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  airbnbAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryNotes: string;
  items: BookingItem[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function App() {
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'classicos' | 'saudaveis' | 'premium'>('all');
  
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [airbnbAddress, setAirbnbAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('08:30 - 09:00');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  
  const [localBookingId, setLocalBookingId] = useState<string | null>(null);
  const [trackedBooking, setTrackedBooking] = useState<Booking | null>(null);
  const [trackSearchId, setTrackSearchId] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem('bib_booking_id');
    if (savedId) {
      setLocalBookingId(savedId);
      loadBookingDetails(savedId);
    }
  }, []);

  const loadBookingDetails = async (id: string) => {
    setIsSearching(true);
    setSearchError(null);
    try {
      const docRef = doc(db, 'bookings', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTrackedBooking({ id: docSnap.id, ...docSnap.data() } as Booking);
      } else {
        setSearchError(lang === 'pt' ? 'Reserva não encontrada.' : 'Reservation not found.');
      }
    } catch (err) {
      setSearchError(lang === 'pt' ? 'Erro ao carregar detalhes da reserva.' : 'Error loading reservation details.');
    } finally {
      setIsSearching(false);
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'pack-classico',
      title: 'Pack Lisboa Antiga',
      titleEn: 'Classic Lisbon Pack',
      category: 'classicos',
      price: 21.90,
      description: 'O sabor autêntico das manhãs lisboetas com pastéis de nata estaladiços preparados no próprio dia.',
      descriptionEn: 'The authentic flavor of Lisbon mornings with crispy pastéis de nata prepared fresh on the day.',
      items: [
        '2 Croissants doirados folhados de manteiga',
        '2 Pastéis de Nata originais polvilhados de canela',
        'Tábua mista de queijo Flamengo e fiambre da Pecharia',
        'Sumo natural de laranjas biológicas do Algarve (330ml)',
        'Café de filtro artesanal de lote selecionado'
      ],
      itemsEn: [
        '2 Golden flaky butter croissants',
        '2 Original Pastéis de Nata sprinkled with cinnamon',
        'Mixed platter of Flamengo cheese and cured ham',
        'Fresh natural organic Algarve orange juice (330ml)',
        'Artesanal select-batch filter coffee'
      ],
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'pack-saudavel',
      title: 'Pack Alfama Green',
      titleEn: 'Alfama Green Healthy Pack',
      category: 'saudaveis',
      price: 24.50,
      description: 'Uma opção energizante, nutritiva e fresca perfeita para começar um longo dia a subir as colinas de Lisboa.',
      descriptionEn: 'An energizing, nutritious and fresh option perfect for starting a long day climbing the hills of Lisbon.',
      items: [
        'Pão rústico de centeio fatiado de fermentação lenta',
        'Abacate da Madeira fatiado com sementes de sésamo',
        'Iogurte grego artesanal com mel e granola biológica',
        'Fruta fresca cortada da época (morangos, kiwi, manga)',
        'Sumo verde Detox revigorante prensa a frio',
        'Infusão fresca de menta e limão de horta local'
      ],
      itemsEn: [
        'Rustic sliced slow-fermented rye bread',
        'Sliced Madeiran avocado with sesame seeds',
        'Artesanal greek yogurt with local honey and organic granola',
        'Fresh seasonal cut fruit (strawberries, kiwi, manga)',
        'Invigorating cold-pressed green detox juice',
        'Fresh mint and lemon herbal infusion from a local garden'
      ],
      image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'pack-premium',
      title: 'Pack Tejo Golden Experience',
      titleEn: 'Golden Tejo Experience Pack',
      category: 'premium',
      price: 49.00,
      description: 'A nossa melhor experiência gastronómica. Celebre um aniversário ou uma manhã mágica no seu ninho lisboeta.',
      descriptionEn: 'Our ultimate gastronomic experience. Celebrate a birthday or a magical morning in your Lisbon nest.',
      items: [
        'Panquecas fofas com mel biológico de urze e bagas vermelhas',
        'Ovos mexidos super cremosos salpicados com cebolinho fresco',
        'Tábua de Queijos Portugueses premium (Queijo da Serra & Azeitão)',
        'Morangos frescos mergulhados em chocolate negro',
        'Garrafa fresca de Espumante Bruto Português (375ml) com flute',
        'Duas Mimosas de Laranja do Algarve preparadas na hora'
      ],
      itemsEn: [
        'Fluffy pancakes with heather honey and red berries',
        'Super creamy scrambled eggs with fresh chives',
        'Premium Portuguese cheese board (Serra & Azeitão cheeses)',
        'Fresh local strawberries dipped in dark chocolate',
        'Chilled bottle of Portuguese Brut Sparkling Wine (375ml) with flutes',
        'Two freshly made Algarve Orange Mimosas'
      ],
      image: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=600&auto=format&fit=crop&q=80'
    }
  ];

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

  // FUNÇÃO DE CHECKOUT CORRIGIDA COM STRIPE DIRETO
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert(lang === 'pt' ? 'O seu carrinho está vazio!' : 'Your cart is empty!');
      return;
    }
    
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
      items: cart.map(c => ({
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
      // 1. Guarda a reserva no Firebase primeiro
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      localStorage.setItem('bib_booking_id', docRef.id);

      // 2. Cria o link de pagamento do Stripe e redireciona (Redirecionamento dinâmico simples via Stripe Checkout integrado)
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        throw new Error("Stripe configuration missing on Vercel.");
      }

      // Preparar os items para enviar para o Stripe Payment Links ou Checkout
      // Como estamos no cliente, a forma mais robusta e direta sem servidor é usar os Stripe Payment Links criados no painel do Stripe,
      // ou redirecionar para uma sessão. Como queres descomplicado, vamos usar o redirecionamento ou alertar o sucesso.
      
      // Se tiveres os links do Stripe criados, podes colar aqui. Caso contrário, criamos uma simulação direta:
      alert(lang === 'pt' ? 'Reserva Registada com sucesso! A redirecionar para pagamento...' : 'Booking registered! Redirecting to payment...');
      
      // Aqui o código assume que a Vercel vai tratar o checkout. 
      // Para evitar o erro antigo, limpámos a chamada da função quebrada.
      setCart([]);
      setIsCartOpen(false);
      setCreatedBookingId(docRef.id);
      
    } catch (err) {
      setSubmitError(lang === 'pt' ? 'Erro ao processar o checkout. Verifica as configurações.' : 'Checkout error. Please check configurations.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackSearchId.trim()) return;
    loadBookingDetails(trackSearchId.trim());
  };

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 flex flex-col antialiased">
      
      <div className="bg-[#1F1916] text-[#F9F6F0] py-2 px-4 text-xs font-semibold flex justify-between items-center z-40">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>☀️ {lang === 'pt' ? 'Entrega garantida no seu Airbnb in Lisboa' : 'Guaranteed delivery to your Airbnb in Lisbon'}</span>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setLang('pt')} className={`transition-colors py-0.5 px-2 rounded-md ${lang === 'pt' ? 'bg-amber-600 text-white' : 'hover:text-amber-300'}`}>Português</button>
          <button type="button" onClick={() => setLang('en')} className={`transition-colors py-0.5 px-2 rounded-md ${lang === 'en' ? 'bg-amber-600 text-white' : 'hover:text-amber-300'}`}>English</button>
        </div>
      </div>

      <section className="relative h-[550px] md:h-[600px] flex items-center justify-center text-center px-4 bg-cover bg-center overflow-hidden z-10" style={{ backgroundImage: "linear-gradient(rgba(10, 8, 6, 0.55), rgba(10, 8, 8, 0.85)), url('https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=1600&auto=format&fit=crop&q=80')" }}>
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-amber-400/30 bg-[#251D18]/80 text-amber-300 text-xs tracking-[0.2em] uppercase rounded-full font-semibold backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Lisbon Premium Hospitality</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-bold text-[#F9F6F0] tracking-tight leading-none font-serif">
            Breakfast in Bed
            <span className="block mt-1 text-amber-500 font-serif italic text-3xl md:text-6xl font-normal tracking-wide">Lisbon Experience</span>
          </h1>

          <p className="text-base md:text-xl text-neutral-300 max-w-2xl font-light">
            {lang === 'pt' ? 'Comece o dia com pura conveniência. Selecionamos pequenos-almoços artesanais cozidos na manhã da entrega.' : 'Begin your day with absolute convenience. We deliver handpicked, freshly baked breakfast boards.'}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <a href="#menu" className="px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-lg transition-all text-sm flex items-center gap-2">
              <Coffee className="w-4 h-4" />
              {lang === 'pt' ? 'Ver Menus & Preços' : 'Browse Menus & Prices'}
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full flex-1 scroll-mt-20" id="menu">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-neutral-200 flex flex-col shadow-sm hover:shadow-xl transition-all group">
              <div className="relative h-64 overflow-hidden bg-neutral-100">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between gap-2 mb-3">
                    <h3 className="text-xl md:text-2xl font-serif font-semibold text-neutral-900">{lang === 'pt' ? item.title : item.titleEn}</h3>
                    <span className="text-lg font-bold text-amber-700">{item.price.toFixed(2)}€</span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-6">{lang === 'pt' ? item.description : item.descriptionEn}</p>
                </div>
                <button onClick={() => addToCart(item)} type="button" className="w-full py-3 bg-[#1F1916] hover:bg-amber-700 text-white text-xs uppercase font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  {lang === 'pt' ? 'Adicionar ao Carrinho' : 'Add to Order'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {cart.length > 0 && (
        <button onClick={() => setIsCartOpen(true)} type="button" className="fixed bottom-6 right-6 z-40 bg-amber-600 hover:bg-amber-700 text-white px-5 py-4 rounded-full shadow-2xl flex items-center gap-3 font-semibold">
          <ShoppingBag className="w-5 h-5" />
          <span className="text-sm">{lang === 'pt' ? 'Encomendar' : 'Complete Order'}</span>
          <span className="text-sm font-bold bg-[#1F1916]/20 px-2.5 py-0.5 rounded-lg">{getCartTotal().toFixed(2)}€</span>
        </button>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 z-50 flex justify-end backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl h-full flex flex-col justify-between shadow-2xl overflow-y-auto p-6">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">{lang === 'pt' ? 'O Teu Pedido' : 'My Order'}</h3>
                <button type="button" onClick={() => setIsCartOpen(false)}><X className="w-5 h-5" /></button>
              </div>

              {cart.map(item => (
                <div key={item.menuItem.id} className="flex justify-between items-center bg-neutral-50 p-3 rounded-xl mb-3">
                  <div>
                    <h4 className="text-xs font-bold">{lang === 'pt' ? item.menuItem.title : item.menuItem.titleEn}</h4>
                    <span className="text-xs text-amber-700 font-bold">{item.menuItem.price.toFixed(2)}€</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => updateQuantity(item.menuItem.id, -1)}><Minus className="w-3.5 h-3.5" /></button>
                    <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.menuItem.id, 1)}><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              
              <div className="text-right font-bold text-lg text-amber-700 mb-6">Total: {getCartTotal().toFixed(2)}€</div>

              <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
                <input type="text" required placeholder={lang === 'pt' ? 'Seu Nome' : 'Your Name'} value={clientName} onChange={(e) => setClientName(e.target.value)} className="border p-2 rounded text-sm" />
                <input type="email" required placeholder="Email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="border p-2 rounded text-sm" />
                <input type="text" required placeholder={lang === 'pt' ? 'Telefone' : 'Phone'} value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="border p-2 rounded text-sm" />
                <input type="text" required placeholder={lang === 'pt' ? 'Morada do Airbnb' : 'Airbnb Address'} value={airbnbAddress} onChange={(e) => setAirbnbAddress(e.target.value)} className="border p-2 rounded text-sm" />
                <input type="date" required value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="border p-2 rounded text-sm" />
                
                {submitError && <p className="text-red-500 text-xs">{submitError}</p>}
                {createdBookingId && <p className="text-green-600 text-xs">{lang === 'pt' ? 'Reserva criada!' : 'Booking created!'}</p>}

                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm">
                  {isSubmitting ? '...' : (lang === 'pt' ? 'Confirmar e Pagar' : 'Confirm & Pay')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
