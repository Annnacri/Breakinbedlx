import { useState } from 'react';
import { ShoppingBag, Plus, Minus, X, Sparkles } from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

// DICIONÁRIO DE LINKS DE PAGAMENTO REAIS DO STRIPE
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
  
  // Estados de Car
