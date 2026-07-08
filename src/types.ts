export interface MenuItem {
  id: string;
  title: string;
  titleEn: string;
  category: 'snacks' | 'menus';
  price: number;
  description: string;
  descriptionEn: string;
  image: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export type AppView = 'home' | 'success' | 'cancel';

export const DELIVERY_FEE = 3.90;

export const MENU_ITEMS: MenuItem[] = [
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
