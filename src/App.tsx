import { useState } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Plus, 
  Minus, 
  X
} from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

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
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'snacks' | 'menus'>('all');
  
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [airbnbAddress, setAirbnbAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('08:30 - 09:00');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    { id: 'rissol-leitao', title: 'Rissol de Leitão', titleEn: 'Suckling Pig Rissol', category: 'snacks', price: 3.90, description: 'Salgado tradicional crocante com recheio cremoso e intenso de leitão assado.', descriptionEn: 'Traditional crispy savory pastry with a creamy and intense roasted suckling pig filling.', image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&auto=format&fit=crop&q=80' },
    { id: 'croquete-vitela', title: 'Croquete de Vitela', titleEn: 'Veal Croquette', category: 'snacks', price: 1.90, description: 'Croquete artesanal feito com carne de vitela selecionada e frito na perfeição.', descriptionEn: 'Artisanal croquette made with selected veal meat and fried to golden perfection.', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80' },
    { id: 'prego-pao', title: 'Prego no Pão c/ Picles', titleEn: 'Prego Steak Sandwich with Pickles', category: 'snacks', price: 4.90, description: 'Prego de carne tenra em pão tipicamente português, acompanhado com picles estaladiços.', descriptionEn: 'Tender beef steak sandwich in traditional Portuguese bread, served with crunchy pickles.', image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=80' },
    { id: 'bifana-portuguesa', title: 'Bifana à Portuguesa no Pão', titleEn: 'Portuguese Bifana Pork Sandwich', category: 'snacks', price: 3.90, description: 'A clássica bifana de porco marinada em vinha, alho e especiarias, servida quente no pão.', descriptionEn: 'The classic Portuguese pork sandwich marinated in garlic, wine, and spices, served hot.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80' },
    { id: 'menu-summer', title: 'Menu Verão', titleEn: 'Summer Menu', category: 'menus', price: 9.90, description: 'Opção leve e refrescante ideal para as manhãs quentes e radiantes de Lisboa.', descriptionEn: 'A light and refreshing option ideal for Lisbon’s warm and radiant mornings.', image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&auto=format&fit=crop&q=80' },
    { id: 'menu-brunch', title: 'Menu Brunch', titleEn: 'Brunch Menu', category: 'menus', price: 14.90, description: 'Um brunch completo e reforçado com uma excelente seleção para o teu meio-dia.', descriptionEn: 'A complete and hearty brunch featuring an excellent selection for your midday experience.', image: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=600&auto=format&fit=crop&q=80' },
    { id: 'menu-portugues', title: 'Menu Português', titleEn: 'Portuguese Menu', category: 'menus', price: 8.90, description: 'A simbiose perfeita dos sabores tradicionais portugueses num pequeno-almoço autêntico.', descriptionEn: 'The perfect symbiosis of traditional Portuguese flavors in an authentic breakfast.', image: 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=600&auto=format&fit=crop&q=80' },
    { id: 'menu-vitamina-c', title: 'Menu Vitamina C', titleEn: 'Vitamin C Menu', category: 'menus', price: 9.90, description: 'Uma opção energética, sumarenta e fresca rica em vitamina C, perfeita para começar o dia.', descriptionEn: 'An energizing, juicy, and fresh choice packed with vitamin C, perfect to kickstart your day.', image: 'https://images.unsplash.com/photo-1621510456681-23a23cfb5f57?w=600&auto=format&fit=crop&q=80' }
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

  const getCartTotal = () => cart.reduce((acc, current) => acc + (current.menuItem.price * current.quantity), 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    const bookingData = {
      clientName, clientEmail, clientPhone, airbnbAddress,
      deliveryDate, deliveryTime, deliveryNotes: deliveryNotes || '',
      items: cart.map(c => ({ id: c.menuItem.id, title: lang === 'pt' ? c.menuItem.title : c.menuItem.titleEn, quantity: c.quantity, price: c.menuItem.price })),
      totalPrice: getCartTotal(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'bookings'), bookingData);
      
      // MÁGICA: Calcula o total em cêntimos e manda para a Stripe
      const totalInCents = Math.round(getCartTotal() * 100);
      const stripeBaseLink = 'https://buy.stripe.com/14A4gA5qKbqi2V50Pi5gc0y'; 
      
      window.location.href = `${stripeBaseLink}?prefilled_amount=${totalInCents}`;
      
      setCart([]);
      setIsCartOpen(false);
    } catch (err) {
      setSubmitError(lang === 'pt' ? 'Erro ao conectar à base de dados.' : 'Error connecting to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = activeCategory === 'all' ? menuItems : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 flex flex-col antialiased">
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

      <div className="flex justify-center gap-4 mt-12">
        <button onClick={() => setActiveCategory('all')} className={`px-4 py-2 rounded-xl text-xs
