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
// @ts-expect-error - Vite handles jpg asset bundling
import brandLogo from './assets/images/brand_logo_1784035012900.jpg';

// Operation and error handling according to the Firebase Skill
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
    authInfo: {
      userId: null,
      email: null,
    },
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
  category: 'menus' | 'extras';
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
  const [activeCategory, setActiveCategory] = useState<'all' | 'menus' | 'extras'>('all');
  
  // Checkout Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [airbnbAddress, setAirbnbAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('08:30 - 09:00');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  
  // Booking result systems
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  
  // Track existing user bookings
  const [localBookingId, setLocalBookingId] = useState<string | null>(null);
  const [trackedBooking, setTrackedBooking] = useState<Booking | null>(null);
  const [trackSearchId, setTrackSearchId] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Load bookings from LocalStorage on mount
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
      id: 'menu-vitamin-c',
      title: 'Menu Vitamina C',
      titleEn: 'Menu Vitamin C',
      category: 'menus',
      price: 9.90,
      description: 'Sumo de laranja, bolo de laranja caseiro, quiche de cogumelos, croissants recheados com queijo fresco e kiwi.',
      descriptionEn: 'Orange juice, homemade orange cake, mushroom quiche, croissants filled with cottage cheese and kiwi.',
      items: [
        'Sumo de laranja natural fresco',
        'Bolo de laranja caseiro fofinho',
        'Quiche artesanal de cogumelos',
        'Croissants recheados com queijo fresco e kiwi'
      ],
      itemsEn: [
        'Fresh natural orange juice',
        'Fluffy homemade orange cake',
        'Artisanal mushroom quiche',
        'Croissants filled with cottage cheese and kiwi'
      ],
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'menu-portuguese',
      title: 'Menu Português',
      titleEn: 'Portuguese Menu',
      category: 'menus',
      price: 8.90,
      description: 'Leite com chocolate, pão misto com fiambre, pastel de bacalhau e pastel de nata.',
      descriptionEn: 'Chocolate milk, Mixed bread with ham, Codfish fritter and Pastel de nata.',
      items: [
        'Leite fresco com chocolate',
        'Pão misto rústico fatiado com fiambre',
        'Pastel de bacalhau tradicional estaladiço',
        'Pastel de nata folhado polvilhado com canela'
      ],
      itemsEn: [
        'Fresh chocolate milk',
        'Mixed rustic bread sliced with ham',
        'Traditional crispy codfish fritter',
        'Flaky pastel de nata with cinnamon sprinkles'
      ],
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'menu-brunch',
      title: 'Menu Brunch',
      titleEn: 'Brunch Menu',
      category: 'menus',
      price: 14.90,
      description: 'Sumo de laranja, ovos mexidos com farinheira, mini tostas, rissol de camarão, rissol de leitão, paté de sardinha, tarte de maçã caseira.',
      descriptionEn: 'Orange juice, scrambled eggs with farinheira, mini toasts, shrimp rissol, suckling pig rissol, sardine pate, homemade apple tart.',
      items: [
        'Sumo de laranja da época espremido na hora',
        'Ovos mexidos super cremosos combinados com farinheira',
        'Mini tostas crocantes com paté de sardinha tradicional',
        'Rissóis artesanais premium (1x camarão e 1x leitão)',
        'Deliciosa fatia de tarte de maçã caseira'
      ],
      itemsEn: [
        'Freshly squeezed seasonal orange juice',
        'Super creamy scrambled eggs with local farinheira sausage',
        'Mini crisp toasts served with traditional sardine pate',
        'Handcrafted premium savories (1x shrimp, 1x suckling pig rissol)',
        'Warm delicious slice of homemade apple tart'
      ],
      image: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'menu-summer',
      title: 'Menu Verão',
      titleEn: 'Summer Menu',
      category: 'menus',
      price: 9.90,
      description: 'Limonada fresca, queijo fresco, tosta de paté de atum com alface, rolo de limão, tarte de pêra e chocolate.',
      descriptionEn: 'Fresh lemonade, fresh cheese, tuna paste toast with lettuce, lemon roll, pear and chocolate tart.',
      items: [
        'Limonada natural fresquinha e aromática',
        'Queijo fresco cremoso de produtores locais',
        'Tosta dourada com paté de atum suave e folhas de alface',
        'Rolo de limão feito na manhã da entrega',
        'Tarte de pêra madura e chocolate negro estaladiço'
      ],
      itemsEn: [
        'Fragrant chilled natural lemonade',
        'Creamy local fresh cottage cheese',
        'Golden-brown toast topped with light tuna spread and lettuce',
        'Sweet lemon roll baked on the delivery morning',
        'Ripe pear tart with rich dark crispy chocolate'
      ],
      image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'extra-bifana',
      title: 'Bifana Portuguesa no Pão',
      titleEn: 'Portuguese Bifana in bread',
      category: 'extras',
      price: 3.90,
      description: 'Sanduíche de porco tradicional portuguesa.',
      descriptionEn: 'Traditional Portuguese pork sandwich.',
      items: ['Bifana portuguesa tenra no pão estaladiço'],
      itemsEn: ['Tender traditional Portuguese pork steak in rustic bread'],
      image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'extra-prego',
      title: 'Prego no Pão com Picles',
      titleEn: 'Steak sandwich w/ pickles',
      category: 'extras',
      price: 4.90,
      description: 'Bife tenro com picles caseiros.',
      descriptionEn: 'Tender steak with homemade pickles.',
      items: ['Bife de novilho tenro no pão com picles artesanais'],
      itemsEn: ['Tender beef steak in bread with traditional homemade pickles'],
      image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'extra-croquete',
      title: 'Croquete de Vitela',
      titleEn: 'Veal croquette',
      category: 'extras',
      price: 1.90,
      description: 'Croquete artesanal e estaladiço.',
      descriptionEn: 'Handcrafted and crispy.',
      items: ['Croquete de vitela estaladiço feito na hora'],
      itemsEn: ['Crispy handcrafted veal croquette prepared fresh'],
      image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'extra-rissol',
      title: 'Rissol de Leitão',
      titleEn: 'Suckling pig rissol',
      category: 'extras',
      price: 3.90,
      description: 'Salgado artesanal premium.',
      descriptionEn: 'Premium handcrafted savory.',
      items: ['Rissol de leitão com recheio cremoso e massa dourada'],
      itemsEn: ['Suckling pig rissol with rich golden pastry and creamy filling'],
      image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const DELIVERY_FEE = 3.90;

  const getSubtotal = () => {
    return cart.reduce((acc, current) => acc + (current.menuItem.price * current.quantity), 0);
  };

  const getCartTotal = () => {
    const subtotal = getSubtotal();
    return subtotal > 0 ? (subtotal + DELIVERY_FEE) : 0;
  };

  const addToCart = (item: MenuItem) => {
    // Non-blocking prompt if user adds an extra without any main menu
    if (item.category === 'extras') {
      const hasMainMenu = cart.some(c => c.menuItem.category === 'menus');
      if (!hasMainMenu) {
        alert(
          lang === 'pt' 
            ? 'Atenção: Os extras apenas são permitidos se encomendar pelo menos um Menu principal.' 
            : 'Notice: Extras are only permitted when accompanied by a main Menu.'
        );
      }
    }

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

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert(lang === 'pt' ? 'O seu carrinho está vazio!' : 'Your cart is empty!');
      return;
    }

    // Verify main menu validation constraint: "Extras are only allowed with a main menu."
    const hasMainMenu = cart.some(c => c.menuItem.category === 'menus');
    if (!hasMainMenu) {
      alert(
        lang === 'pt'
          ? 'Atenção: Os extras só são permitidos acompanhando um Menu principal. Adicione pelo menos um Menu ao seu carrinho.'
          : 'Notice: Extras are only allowed with a main menu. Please add at least one main Menu layout to complete booking.'
      );
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    setCreatedBookingId(null);

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
      const path = 'bookings';
      const docRef = await addDoc(collection(db, path), bookingData);
      setCreatedBookingId(docRef.id);
      localStorage.setItem('bib_booking_id', docRef.id);
      setLocalBookingId(docRef.id);
      // load tracking
      setTrackedBooking({ id: docRef.id, ...bookingData } as Booking);
      setCart([]);
      setIsCartOpen(false);
    } catch (err) {
      setSubmitError(lang === 'pt' ? 'Erro no servidor de reservas. Por favor, tente novamente.' : 'Failed to register the reservation. Please try again.');
      try {
        handleFirestoreError(err, OperationType.WRITE, 'bookings');
      } catch (logErr) {
        // logged
      }
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
      
      {/* Absolute Language Switcher & Floating Help Bar */}
      <div className="bg-[#1F1916] text-[#F9F6F0] py-2 px-4 text-xs font-semibold flex justify-between items-center z-40">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 font-bold animate-ping"></span>
          <span>☀️ {lang === 'pt' ? 'Entrega garantida no seu Airbnb em Lisboa' : 'Guaranteed delivery to your Airbnb in Lisbon'}</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => setLang('pt')} 
            className={`transition-colors py-0.5 px-2 rounded-md font-bold ${lang === 'pt' ? 'bg-amber-600 text-white' : 'hover:text-amber-300'}`}
          >
            PT
          </button>
          <button 
            type="button"
            onClick={() => setLang('en')} 
            className={`transition-colors py-0.5 px-2 rounded-md font-bold ${lang === 'en' ? 'bg-amber-600 text-white' : 'hover:text-amber-300'}`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Brand Navigation Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-neutral-200/60 py-4 px-6 md:px-12 z-30 flex items-center justify-between shadow-sm">
        <a href="#" className="flex items-center gap-3">
          <img 
            src={brandLogo} 
            alt="Breakfast in Bed Lisboa Logo" 
            className="w-10 h-10 rounded-xl object-cover shadow-sm bg-neutral-100 border border-neutral-200/40"
            referrerPolicy="no-referrer"
          />
          <span className="font-serif font-bold text-xl md:text-2xl tracking-tight text-[#1F1916]">
            Breakfast in Bed <span className="italic font-normal text-amber-600">Lisboa</span>
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-neutral-600">
          <a href="#menu" className="hover:text-amber-600 transition-colors">{lang === 'pt' ? 'Menus' : 'Menus'}</a>
          <a href="#about" className="hover:text-amber-600 transition-colors">{lang === 'pt' ? 'Quem Somos' : 'About Us'}</a>
          <a href="#contact" className="hover:text-amber-600 transition-colors">{lang === 'pt' ? 'Contacto' : 'Contact'}</a>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/40 rounded-full text-[11px] font-bold">
            Taxa Fixa Delivery: €3.90
          </span>
          <button 
            type="button" 
            onClick={() => alert(lang === 'pt' ? 'Área de login de cliente disponível brevemente!' : 'Client login portal coming soon!')}
            className="px-4 py-2 border border-[#1F1916]/10 hover:bg-[#1F1916]/5 text-[#1F1916] rounded-xl text-xs font-bold uppercase transition-colors"
          >
            Login
          </button>
        </div>
      </header>

      {/* Main Luxury Hero Header */}
      <section className="relative h-[550px] md:h-[600px] flex items-center justify-center text-center px-4 bg-cover bg-center overflow-hidden z-10" style={{ backgroundImage: "linear-gradient(rgba(10, 8, 6, 0.55), rgba(10, 8, 8, 0.85)), url('https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=1600&auto=format&fit=crop&q=80')" }}>
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-amber-400/30 bg-[#251D18]/80 text-amber-300 text-xs tracking-[0.2em] uppercase rounded-full font-semibold backdrop-blur-sm animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Lisbon's Premium Choice</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-[#F9F6F0] tracking-tight leading-none font-serif">
            Breakfast in Bed
            <span className="block mt-1 text-amber-500 font-serif italic text-3xl md:text-6xl font-normal tracking-wide">Lisboa</span>
          </h1>

          <p className="text-base md:text-xl text-neutral-300 max-w-2xl font-light">
            {lang === 'pt' 
              ? 'O conforto de um pequeno-almoço artesanal entregue diretamente na sua morada em Lisboa por uma taxa fixa de €3.90.' 
              : 'The comfort of a handcrafted breakfast delivered straight to your door in Lisbon for a flat delivery fee of €3.90.'}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <a href="#menu" className="px-8 py-3.5 bg-amber-600 hover:bg-amber-700 active:transform active:scale-95 text-white font-semibold rounded-lg shadow-lg hover:shadow-amber-600/20 transition-all text-sm flex items-center gap-2">
              <Coffee className="w-4 h-4" />
              {lang === 'pt' ? 'Encomendar Agora' : 'Order Now'}
            </a>
            <a href="#reclamacao" className="px-6 py-3.5 border border-white/20 hover:border-white/50 bg-black/25 text-white font-medium rounded-lg hover:bg-white/5 transition-all text-sm">
              {lang === 'pt' ? 'Verificar Minha Reserva' : 'Check My Status'}
            </a>
          </div>
        </div>

        {/* Dynamic Wave Cut */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-neutral-50 to-transparent"></div>
      </section>

      {/* Interactive Process Roadmap */}
      <section className="bg-white border-b border-neutral-200 py-12 px-6 relative z-20 shadow-sm" id="about">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0">1</div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">{lang === 'pt' ? 'Escolha o seu Pack' : 'Select Your Pack'}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {lang === 'pt' ? 'Opte por opções clássicas de pastelaria a fresca, receitas saudáveis ​​de abacate ou extras com champanhe.' : 'Choose from golden bakery products, vibrant avocado slices, or sparkling prosecco highlights.'}
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0">2</div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">{lang === 'pt' ? 'Insira Detalhes e Airbnb' : 'Add Time & Airbnb'}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {lang === 'pt' ? 'Diga-nos a sua morada em Alfama, Baixa ou Chiado e o intervalo de trinta minutos em que deseja tomar pequeno-almoço.' : 'Provide your specific historic address in Lisbon and select a convenient 30-minute delivery slot.'}
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0">3</div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">{lang === 'pt' ? 'Acorde Pronta!' : 'Wake Up and Feast!'}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {lang === 'pt' ? 'O nosso estafeta sobe as escadas e entrega o pack acabado de fazer à sua porta com um caloroso "Bom dia!"' : 'Our courier climbs the winding streets of Lisbon to bring delicious warmth right to your flat with a smile.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu / Selection Grid Area */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full flex-1 scroll-mt-20" id="menu">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center gap-3">
          <span className="text-xs tracking-widest font-extrabold text-amber-600 uppercase">{lang === 'pt' ? 'Menu da Manhã' : 'Morning Menu'}</span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-neutral-900">
            {lang === 'pt' ? 'Pequenos-Almoços Artesanais' : 'Artisanal Breakfast Selections'}
          </h2>
          <p className="text-neutral-500 font-light mt-2">
            {lang === 'pt' 
              ? 'Todos os nossos produtos provêm de panificadoras artesanais lisboetas e produtores nacionais. Fruta descascada na hora e sumos 100% naturais.' 
              : 'Our baking is outsourced to local traditional bakeries. We use fresh organic fruits sliced right before packaging.'}
          </p>

          {/* Interactive Categories Menu Toggles */}
          <div className="flex flex-wrap justify-center gap-2 mt-8 bg-neutral-200/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeCategory === 'all' ? 'bg-[#1F1916] text-[#F9F6F0] shadow-sm' : 'text-neutral-600 hover:text-amber-700'}`}
            >
              {lang === 'pt' ? 'Todos os Produtos' : 'All Products'}
            </button>
            <button
              onClick={() => setActiveCategory('menus')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeCategory === 'menus' ? 'bg-[#1F1916] text-[#F9F6F0] shadow-sm' : 'text-neutral-600 hover:text-amber-700'}`}
            >
              {lang === 'pt' ? 'Packs de Menus' : 'Breakfast Menus'}
            </button>
            <button
              onClick={() => setActiveCategory('extras')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeCategory === 'extras' ? 'bg-[#1F1916] text-[#F9F6F0] shadow-sm' : 'text-neutral-600 hover:text-amber-700'}`}
            >
              {lang === 'pt' ? 'Salgados / Extras' : 'Salty Extras & Bites'}
            </button>
          </div>
        </div>

        {/* Menu Cards Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-neutral-200 flex flex-col shadow-sm hover:shadow-xl hover:border-[#1F1916]/20 transition-all group">
              <div className="relative h-56 overflow-hidden bg-neutral-150">
                <img 
                  src={item.image} 
                  alt={lang === 'pt' ? item.title : item.titleEn}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-[#1F1916]/95 text-[#FFF] text-[9px] tracking-widest uppercase font-extrabold py-1 px-3 rounded-md backdrop-blur-md">
                  {item.category === 'menus' ? (lang === 'pt' ? 'Menu' : 'Menu') : (lang === 'pt' ? 'Salgado / Extra' : 'Salty Extra')}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <h3 className="text-base md:text-lg font-serif font-bold text-neutral-900 leading-tight">
                      {lang === 'pt' ? item.title : item.titleEn}
                    </h3>
                  </div>
                  <div className="text-amber-700 font-extrabold text-sm mb-3">
                    {item.price.toFixed(2)}€
                  </div>

                  <p className="text-xs text-neutral-500 leading-relaxed font-light mb-4 min-h-[48px]">
                    {lang === 'pt' ? item.description : item.descriptionEn}
                  </p>

                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100 mb-4 flex flex-col gap-1.5">
                    <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1 leading-none">
                      <Coffee className="w-3 h-3 text-amber-600" />
                      {lang === 'pt' ? 'Ingredientes incluídos:' : 'Ingredients included:'}
                    </span>
                    <ul className="text-[11px] text-neutral-700 flex flex-col gap-1 font-medium">
                      {(lang === 'pt' ? item.items : item.itemsEn).map((inc, index) => (
                        <li key={index} className="flex gap-1.5 items-start leading-tight">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => addToCart(item)}
                  type="button"
                  className="w-full py-2.5 bg-[#1F1916] hover:bg-amber-600 hover:text-white tracking-wide active:scale-[0.98] text-white text-[10px] uppercase font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {lang === 'pt' ? 'Adicionar ao Carrinho' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Authentic About Us / Luxury Highlight Section */}
      <section className="py-20 bg-neutral-100 border-y border-neutral-200 px-6 md:px-12 scroll-mt-20" id="about-brand">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden h-[380px] md:h-[450px] shadow-lg group">
            <img 
              src="https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800&auto=format&fit=crop&q=80" 
              alt="Artisanal breakfast with berries and coffee" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F1916]/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] tracking-widest uppercase font-extrabold text-amber-400 bg-[#1F1916]/80 py-1 px-3.5 rounded-full inline-block mb-3">
                Portuguese Artisanal Food
              </span>
              <h4 className="text-xl md:text-2xl font-serif font-bold text-[#F9F6F0]">
                {lang === 'pt' ? 'Comida fresca, local e 100% feita à mão diariamente.' : 'Artisan fresh daily food. 100% Handmade.'}
              </h4>
            </div>
          </div>

          <div className="flex flex-col gap-6 justify-center">
            <span className="text-xs uppercase tracking-widest font-extrabold text-[#1F1916] block">{lang === 'pt' ? 'SOBRE NÓS' : 'ABOUT US'}</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-neutral-900 tracking-tight">
              {lang === 'pt' ? 'Experiência de Turismo de Luxo em Lisboa' : 'Luxury Tourism Experience in Lisbon'}
            </h2>
            <p className="text-neutral-600 font-light text-sm md:text-base leading-relaxed">
              {lang === 'pt' 
                ? 'Acreditamos que a refeição mais importante do dia deve ser um evento memorável. A nossa missão é combinar o calor de um lar português com a sofisticação e o cuidado de um hotel boutique.'
                : 'We believe that the most important meal of the day should be an event. Our mission is to combine the warmth of a Portuguese home with the sophistication of a boutique hotel.'}
            </p>

            <div className="flex flex-col gap-6 mt-2">
              <div className="flex gap-4 items-start pb-4 border-b border-neutral-200">
                <span className="text-2xl font-serif font-bold text-amber-600">01</span>
                <div>
                  <h4 className="font-bold text-neutral-950 text-sm">{lang === 'pt' ? 'Alimentos Artesanais Autênticos' : 'Authentic Artisanal Food'}</h4>
                  <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                    {lang === 'pt' ? 'Ingredientes frescos selecionados todos os dias diretamente nos mercados locais de Lisboa.' : 'Fresh ingredients sourced daily from local Lisbon markets.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="text-2xl font-serif font-bold text-amber-600">02</span>
                <div>
                  <h4 className="font-bold text-neutral-950 text-sm">{lang === 'pt' ? 'Conveniência Sem Esforço' : 'Seamless Convenience'}</h4>
                  <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                    {lang === 'pt' ? 'Faça a sua reserva comodamente a partir do seu telemóvel e acorde com um serviço perfeito em minutos.' : 'Order from your phone and wake up to perfection.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Shopping Cart Drawer trigger button */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          type="button"
          className="fixed bottom-6 right-6 z-40 bg-amber-600 hover:bg-amber-700 active:scale-95 transition-transform text-white px-5 py-4 rounded-full shadow-2xl flex items-center gap-3 font-semibold group"
          id="floating-cart-trigger"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-white" />
            <span className="absolute -top-2 -right-3 bg-[#1F1916] text-[#FFF] text-[9px] font-bold h-5 w-5 rounded-full flex items-center justify-center border border-white">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <span className="text-sm tracking-wide hidden sm:inline">{lang === 'pt' ? 'Encomendar Pequeno-Almoço' : 'Complete Reservation'}</span>
          <span className="text-sm font-bold bg-[#1F1916]/20 px-2.5 py-0.5 rounded-lg border border-white/10">{getCartTotal().toFixed(2)}€</span>
        </button>
      )}

      {/* Embedded Booking Modal / Offcanvas Form Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 z-50 flex justify-end animate-fade-in backdrop-blur-sm" id="cart-drawer-overlay">
          <div className="bg-white w-full max-w-xl h-full flex flex-col justify-between shadow-2xl relative animate-slide-left overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-neutral-900">{lang === 'pt' ? 'O Teu Pedido' : 'My Reservation'}</h3>
                  <p className="text-xs text-neutral-500 font-medium">{lang === 'pt' ? 'Lisbon Experiência Fresca' : 'Lisbon Fresh Morning experience'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                type="button"
                className="p-2 hover:bg-neutral-150 rounded-full transition-colors text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart & Form Body Content */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto flex flex-col gap-8">
              
              {/* Added items list */}
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-3">
                  {lang === 'pt' ? 'Artigos Escolhidos' : 'Selected Products'}
                </span>
                {cart.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-neutral-200 rounded-xl">
                    <p className="text-xs text-neutral-400 font-light">{lang === 'pt' ? 'O carrinho está vazio.' : 'Cart is completely empty.'}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {cart.map(item => (
                      <div key={item.menuItem.id} className="flex gap-3 justify-between items-center bg-neutral-50 p-3 rounded-xl border border-neutral-150">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-neutral-900 truncate">
                            {lang === 'pt' ? item.menuItem.title : item.menuItem.titleEn}
                          </h4>
                          <span className="text-[11px] text-amber-700 font-bold block mt-0.5">
                            {item.menuItem.price.toFixed(2)}€ / {lang === 'pt' ? 'unidade' : 'unit'}
                          </span>
                        </div>
                        
                        {/* Quantity Counter */}
                        <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.menuItem.id, -1)}
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-500"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-neutral-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.menuItem.id, 1)}
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-500"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Remocal trigger */}
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.menuItem.id, -item.quantity)}
                          className="p-2 hover:bg-red-50 text-neutral-300 hover:text-red-500 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <div className="border-t border-neutral-150 pt-3.5 mt-2 flex flex-col gap-1.5 text-xs">
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>{lang === 'pt' ? 'Subtotal:' : 'Subtotal:'}</span>
                        <span className="font-semibold">{getSubtotal().toFixed(2)}€</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>{lang === 'pt' ? 'Taxa de Entrega (Fixa):' : 'Delivery Fee (Flat):'}</span>
                        <span className="font-semibold">{DELIVERY_FEE.toFixed(2)}€</span>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-neutral-100 font-bold text-neutral-900">
                        <span>{lang === 'pt' ? 'Total Estimado:' : 'Total Amount:'}</span>
                        <span className="text-lg font-extrabold text-amber-700">{getCartTotal().toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Information Form */}
              {cart.length > 0 && (
                <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-5 border-t border-neutral-100 pt-6">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                    {lang === 'pt' ? 'Entrega no Airbnb & Contactos' : 'Airbnb Delivery & Contact Details'}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="form-name" className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        {lang === 'pt' ? 'Seu Nome' : 'Your Full Name'}*
                      </label>
                      <input
                        id="form-name"
                        type="text"
                        required
                        placeholder="Ana Esteves"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="form-email" className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        {lang === 'pt' ? 'Seu Email' : 'Email Address'}*
                      </label>
                      <input
                        id="form-email"
                        type="email"
                        required
                        placeholder="exemplo@gmail.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mobile */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="form-phone" className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        {lang === 'pt' ? 'Telemóvel (WhatsApp)' : 'Mobile Phone (WhatsApp)'}*
                      </label>
                      <input
                        id="form-phone"
                        type="tel"
                        required
                        placeholder="+351 912 345 678"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>

                    {/* Delivery Date */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="form-date" className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        {lang === 'pt' ? 'Data de Entrega' : 'Delivery Date'}*
                      </label>
                      <input
                        id="form-date"
                        type="date"
                        required
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Delivery Location - Lisbon Area */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="form-address" className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {lang === 'pt' ? 'Morada do Alojamento / Airbnb em Lisboa' : 'Airbnb / Accommodation Address (Lisbon)'}*
                    </label>
                    <textarea
                      id="form-address"
                      required
                      rows={2}
                      placeholder={lang === 'pt' ? "Ex: Rua dos Remédios 45, Alfama, Lisboa, Código à porta: 1234" : "Ex: Rua dos Remédios 45, Alfama, Lisbon. Door code: 1234"}
                      value={airbnbAddress}
                      onChange={(e) => setAirbnbAddress(e.target.value)}
                      className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                    />
                    <span className="text-[10px] text-neutral-400 font-light italic flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" />
                      {lang === 'pt' ? 'Servimos Bairro Alto, Alfama, Chiado, Baixa, Belém, etc.' : 'We serve historic Alfama, Bairro Alto, Chiado, Baixa, Belém, etc.'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Time option select */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="form-time" className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        {lang === 'pt' ? 'Intervalo de Hora de Entrega' : 'Preffered Delivery Window'}*
                      </label>
                      <select
                        id="form-time"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      >
                        <option value="08:00 - 08:30">08:00 - 08:30</option>
                        <option value="08:30 - 09:00">08:30 - 09:00</option>
                        <option value="09:00 - 09:30">09:00 - 09:30</option>
                        <option value="09:30 - 10:00">09:30 - 10:00</option>
                        <option value="10:00 - 10:30">10:00 - 10:30</option>
                      </select>
                    </div>

                    {/* Delivery Notes */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="form-notes" className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-amber-500" />
                        {lang === 'pt' ? 'Restrições ou Presente Especial?' : 'Allergies or Special Occasions?'}
                      </label>
                      <input
                        id="form-notes"
                        type="text"
                        placeholder={lang === 'pt' ? "Surpresa de aniversário, sem glúten..." : "Birthday surprise! Vegetarian..."}
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium text-xs leading-relaxed mt-2 text-center">
                      <span>⚠️ {submitError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 mt-2 tracking-wide font-bold uppercase rounded-xl text-xs text-white ${isSubmitting ? 'bg-neutral-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'} transition-all`}
                  >
                    {isSubmitting ? (lang === 'pt' ? 'A Registar Pedido...' : 'Registering Request...') : (lang === 'pt' ? 'Submeter Reserva de Pequeno-Almoço' : 'Complete Reservation')}
                  </button>
                </form>
              )}
            </div>

            {/* Note */}
            <div className="p-4 bg-neutral-50 text-neutral-400 text-center text-[10px] uppercase font-bold tracking-wider border-t border-neutral-100">
              © 2026 Breakfast in Bed LX
            </div>

          </div>
        </div>
      )}

      {/* Booking Confirmation / Active Tracker Area */}
      <section className="py-20 bg-[#1F1916] text-[#F9F6F0] scroll-mt-20 px-4 md:px-8" id="reclamacao">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Status Tracker left info text */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <span className="text-xs text-amber-400 font-extrabold uppercase tracking-widest">{lang === 'pt' ? 'Acompanhar Encomenda' : 'Order Sync & Live Tracking'}</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
              {lang === 'pt' ? 'Já tem uma Reserva registada?' : 'Already have a Reservation?'}
            </h2>
            <p className="text-neutral-400 font-light text-sm leading-relaxed">
              {lang === 'pt' 
                ? 'Insira o seu ID de reserva debaixo do voucher recebido para verificar o progresso da nossa equipa de cozinha e entregas na manhã escolhida.' 
                : 'Input your custom booking ID generated below to view the active state of confirmation, kitchen packaging, and delivery tracking details.'}
            </p>

            <form onSubmit={handleSearchCheck} className="flex gap-2.5 mt-2 bg-[#251D18] p-1.5 border border-[#3E342B]/80 rounded-xl">
              <input
                type="text"
                required
                placeholder={lang === 'pt' ? "ID da Reserva (ex: d89sS1x)" : "Reservations ID (e.g. d89sS1x)"}
                value={trackSearchId}
                onChange={(e) => setTrackSearchId(e.target.value)}
                className="flex-1 bg-transparent border-none text-xs outline-none p-2.5 text-white font-mono placeholder:text-neutral-500 font-medium"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-500 text-white rounded-lg text-xs font-bold transition-all shrink-0 uppercase tracking-widest"
              >
                {isSearching ? '...' : (lang === 'pt' ? 'Procurar' : 'Search')}
              </button>
            </form>

            {searchError && (
              <p className="text-xs text-red-400 font-bold flex items-center gap-1.5 mt-1">
                <span>⚠️ {searchError}</span>
              </p>
            )}

            {localBookingId && (
              <p className="text-xs text-amber-300 mt-2">
                {lang === 'pt' ? 'Sua reserva ativa: ' : 'Your active reservation: '}
                <button 
                  type="button"
                  onClick={() => { setTrackSearchId(localBookingId); loadBookingDetails(localBookingId); }} 
                  className="underline font-mono bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded cursor-pointer text-amber-400 font-semibold transition-colors"
                >
                  {localBookingId}
                </button>
              </p>
            )}
          </div>

          {/* Active / Found Booking Tracker panel */}
          <div className="lg:col-span-7">
            {trackedBooking ? (
              <div className="bg-[#2E241E] border border-[#48392F]/60 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden backdrop-blur-sm shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5 border-b border-[#4F3F34] pb-4">
                  <div>
                    <span className="text-[10px] tracking-wider uppercase font-bold text-amber-400">{lang === 'pt' ? 'Encomenda Local Ativa' : 'Active Reservation Details'}</span>
                    <h3 className="text-xl font-serif font-bold text-white mt-1">
                      {trackedBooking.clientName}
                    </h3>
                  </div>
                  <div className="inline-flex py-1 px-3 bg-[#42332A] rounded-lg border border-[#594639] text-xs text-neutral-300 font-mono">
                    Ref ID: <span className="font-bold text-amber-400 ml-1">{trackedBooking.id}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs text-neutral-300">
                  <div>
                    <span className="text-amber-500 font-semibold block uppercase text-[10px] tracking-wider mb-1">{lang === 'pt' ? 'Estado' : 'Status'}</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                      {trackedBooking.status === 'pending' ? (lang === 'pt' ? 'Aguardando Aprovação' : 'Awaiting Approval') : (lang === 'pt' ? 'Confirmado' : 'Confirmed')}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-500 font-semibold block uppercase text-[10px] tracking-wider mb-1">{lang === 'pt' ? 'Data de Entrega' : 'Delivery Date'}</span>
                    <div className="font-bold flex items-center gap-1 text-white">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <span>{trackedBooking.deliveryDate}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-amber-500 font-semibold block uppercase text-[10px] tracking-wider mb-1">{lang === 'pt' ? 'Hora Agendada' : 'Scheduled Time'}</span>
                    <div className="font-bold flex items-center gap-1 text-white">
                      <Clock className="w-4 h-4 text-neutral-400" />
                      <span>{trackedBooking.deliveryTime}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#241C17] rounded-xl p-4 border border-[#3E3027] text-xs">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    {lang === 'pt' ? 'Morada do seu Airbnb' : 'Airbnb Delivery Address'}
                  </span>
                  <p className="font-medium text-neutral-300 leading-normal">{trackedBooking.airbnbAddress}</p>
                </div>

                {/* Items Summariser inside Tracker */}
                <div className="text-xs">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">{lang === 'pt' ? 'Resumo de Produtos' : 'Basket Summary'}</span>
                  <div className="flex flex-col gap-1.5 bg-[#241C17] rounded-xl p-4 border border-[#3E3027]">
                    {trackedBooking.items?.map((item: BookingItem, i: number) => (
                      <div key={i} className="flex justify-between items-center text-neutral-300 font-medium">
                        <span>{item.quantity}x {item.title}</span>
                        <span className="font-bold">{(item.price * item.quantity).toFixed(2)}€</span>
                      </div>
                    ))}
                    <div className="border-t border-[#46362C] pt-2.5 mt-2 flex items-center justify-between text-neutral-200">
                      <span className="font-bold">{lang === 'pt' ? 'Preço Total Pago:' : 'Total price:'}</span>
                      <span className="text-sm font-bold text-amber-400">{trackedBooking.totalPrice?.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-650/10 border border-amber-600/20 rounded-xl p-4.5 text-xs text-amber-300 flex gap-2.5 items-start">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-normal">
                    {lang === 'pt' 
                      ? 'Nesta fase, a nossa cozinha em Lisboa já recebeu o seu pedido. Iremos confirmar o menu e os detalhes com o seu alojamento via contacto nas próximas duas horas!' 
                      : 'Our local Lisbon kitchen has queue-registered your order. We will sync confirmation details with your Airbnb contact within 2 hours!'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#2E241E]/40 border border-[#3E3129] rounded-2xl p-10 text-center flex flex-col items-center gap-4 relative overflow-hidden h-[380px] justify-center text-neutral-400">
                <Coffee className="w-16 h-16 text-[#3E3129]" />
                <div>
                  <p className="font-semibold text-neutral-300 text-sm">{lang === 'pt' ? 'Sem Reserva Selecionada' : 'No Reservation Selected'}</p>
                  <p className="text-xs text-neutral-500 font-light mt-1.5 leading-relaxed max-w-sm mx-auto">
                    {lang === 'pt' 
                      ? 'Faça o seu primeiro pedido acima. Os detalhes da reserva aparecerão automaticamente aqui em tempo real!' 
                      : 'Place your first order above. The exact booking state will synchronize in real-time here!'}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Lisbon localized Tourism FAQ section */}
      <section className="py-20 bg-white border-t border-neutral-200 px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-12">
          
          <div className="text-center flex flex-col items-center gap-2 mb-4">
            <HelpCircle className="w-8 h-8 text-amber-600 mb-2" />
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-neutral-950">{lang === 'pt' ? 'Perguntas Frequentes — Lisboa' : 'Frequently Asked Questions'}</h3>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1 font-bold">{lang === 'pt' ? 'Dúvidas sobre o serviço' : 'Useful service details'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                {lang === 'pt' ? 'Como entregam a comida quente?' : 'How is food kept fresh and warm?'}
              </h4>
              <p className="text-neutral-600 leading-relaxed font-light">
                {lang === 'pt' 
                  ? 'Os nossos estafetas utilizam mochilas térmicas profissionais adaptadas. Os croissants e os pastéis de nata são colocados no saco diretamente do forno da padaria parceira.' 
                  : 'Our couriers utilize professional delivery bags with specialized insolation layers. Pastries are packed straight from the bakers oven on delivery day.'}
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                {lang === 'pt' ? 'Entregam em zonas difíceis com muitas escadas (como Alfama)?' : 'Can you deliver to historic stairs (like Alfama)?'}
              </h4>
              <p className="text-neutral-600 leading-relaxed font-light">
                {lang === 'pt' 
                  ? 'Sim! Os nossos estafetas conhecem as escadinhas e becos de Alfama, Mouraria e Graça como ninguém. Entregamos diretamente à sua porta!' 
                  : 'Absolutely! Our couriers know Alfama, Mouraria, and Graça alleys inside out. We will climb the stairs and deliver to your apartment door.'}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                {lang === 'pt' ? 'O que acontece se eu não ouvir o estafeta?' : 'What if I am fast asleep during arrival?'}
              </h4>
              <p className="text-neutral-600 leading-relaxed font-light">
                {lang === 'pt' 
                  ? 'Pedimos que coloque os contactos corretos do telemóvel (WhatsApp) e o código da porta do prédio no formulário. Se não abrir, ligamos imediatamente para si!' 
                  : 'Please input active WhatsApp info or building entry codes. If you do not answer the ring, we will directly call or text your phone.'}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                {lang === 'pt' ? 'Posso programar surpresas ou mimos de anos?' : 'Can I order a custom birthday/anniversary surprise?'}
              </h4>
              <p className="text-neutral-600 leading-relaxed font-light">
                {lang === 'pt' 
                  ? 'Sim, use o campo "Presente Especial" no fim do checkout. Adicionamos velas, espumante ou notas escritas à mão personalizadas para tornar a manhã inesquecível.' 
                  : 'Yes! Let us know under special notes in checkout. We can arrange hand-written cards, birthday candles, champagne, and mimosas.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Review Testimonials */}
      <section className="bg-neutral-100 py-20 px-4 md:px-8 text-center border-t border-neutral-200">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => <Heart key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />)}
          </div>
          <blockquote className="text-xl md:text-3xl font-serif italic text-neutral-900 font-medium max-w-4xl mx-auto leading-relaxed">
            {lang === 'pt'
              ? '"O melhor pequeno-almoço que já comi em viagens. Acordar e ter sumos de laranja e natas quentinhas entregues na nossa varanda em Alfama foi como um sonho de férias! Altamente recomendável."'
              : '"The highlights of our city stay in Lisbon! To wake up in Alfama and have pastries still hot with freshly squezed orange juice delivered to our window is a dream. Highly recommended!"'}
          </blockquote>
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-neutral-900 text-sm">Clara & Mark, London</span>
            <span className="text-xs text-neutral-400 font-medium">{lang === 'pt' ? 'Visualizado no Airbnb Reviews' : 'Verified via Airbnb guest feedback'}</span>
          </div>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer className="bg-[#1F1916] text-[#F9F6F0] py-16 px-6 md:px-12 border-t border-[#312823]" id="contact">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12 text-left">
          {/* About us footer column */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <h4 className="font-serif font-bold text-lg text-white">Breakfast in Bed <span className="italic font-normal text-amber-500">Lisboa</span></h4>
            <p className="text-[#a3978f] text-xs font-light leading-relaxed">
              {lang === 'pt'
                ? 'Levar a experiência de um hotel boutique de luxo diretamente ao seu alojamento em Lisboa. Comida artesanal cozida na manhã da entrega.'
                : 'Bringing the boutique hotel experience directly to your accommodation in Lisbon. Handcrafted breakfast baked on the morning of delivery.'}
            </p>
          </div>

          {/* Contact details footer column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#F9F6F0] border-b border-white/5 pb-2">Contact</h4>
            <ul className="text-xs text-[#a3978f] flex flex-col gap-3">
              <li className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-amber-500 mb-0.5">{lang === 'pt' ? 'Email de Suporte' : 'Email Support'}</span>
                <span className="font-medium text-neutral-200">info@breakfasinbedlx.com</span>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-amber-500 mb-0.5">WhatsApp</span>
                <span className="font-medium text-neutral-200">+351 964 423 221</span>
              </li>
            </ul>
          </div>

          {/* Serving Hours column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#F9F6F0] border-b border-white/5 pb-2">Information</h4>
            <ul className="text-xs text-[#a3978f] flex flex-col gap-3">
              <li className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-amber-500 mb-0.5">{lang === 'pt' ? 'Localização' : 'Location'}</span>
                <span className="font-medium text-neutral-200">Lisbon, Portugal</span>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-amber-500 mb-0.5">{lang === 'pt' ? 'Horário de Entregas' : 'Serving Hours'}</span>
                <span className="font-medium text-white">08:00 – 13:00</span>
              </li>
            </ul>
          </div>

          {/* Delivery areas column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#F9F6F0] border-b border-white/5 pb-2">{lang === 'pt' ? 'Zonas de Entrega' : 'Delivery Areas'}</h4>
            <ul className="text-xs text-neutral-300 grid grid-cols-2 gap-x-4 gap-y-2 font-medium">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>Penha de França</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>Graça</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>São Vicente</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>Alfama</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>Santa Clara</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-[#312823] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-neutral-500">
          <span>© 100% Handmade Daily in Lisbon, Portugal. All rights reserved.</span>
          <span>Breakfast in Bed Lisboa Tourism Experience</span>
        </div>
      </footer>

      {/* Success Congrats Overlay Modal */}
      {createdBookingId && (
        <div className="fixed inset-0 bg-[#0A0806]/85 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-neutral-250 text-center flex flex-col items-center gap-6 shadow-2xl relative">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-serif font-bold text-neutral-900">{lang === 'pt' ? 'Reserva Efetuada!' : 'Booking Registered!'}</h3>
              <p className="text-sm text-neutral-500 font-light mt-2 leading-relaxed">
                {lang === 'pt' 
                  ? 'A sua reserva de pequeno-almoço premium em Lisboa foi registada com sucesso com o seguinte identificador:' 
                  : 'Your premium breakfast reservation in Lisbon has been successfully registered with this reference:'}
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 py-3.5 px-6 rounded-2xl w-full flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">REF ID</span>
              <span className="text-base font-mono font-extrabold text-amber-600 tracking-wider select-all">{createdBookingId}</span>
            </div>

            <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-sm">
              {lang === 'pt'
                ? 'Guarde este ID para acompanhar o estado da sua encomenda em tempo real no rodapé do nosso site.'
                : 'Save this ID specifically to track your delivery status of historic bakery boards below.'}
            </p>

            <button
              onClick={() => setCreatedBookingId(null)}
              type="button"
              className="w-full py-3.5 bg-[#1F1916] hover:bg-neutral-800 text-white font-bold rounded-xl text-xs uppercase cursor-pointer transition-colors"
            >
              {lang === 'pt' ? 'Concluir & Acompanhar' : 'Done & Track Order'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
