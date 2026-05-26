export interface MenuItem {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: number;
  image: string;
  isMain?: boolean;
}

export const menus: MenuItem[] = [
  {
    id: 'm1',
    name: {
      pt: 'Menu Vitamina C',
      en: 'Menu Vitamin C',
      es: 'Menú Vitamina C',
      fr: 'Menu Vitamine C',
      de: 'Menü Vitamin C',
      it: 'Menu Vitamina C'
    },
    description: {
      pt: 'Sumo de laranja, torta de laranja caseira, quiche de cogumelos, croissants recheados com queijo cottage e kiwi.',
      en: 'Orange juice, homemade orange cake, mushroom quiche, croissants filled with cottage cheese and kiwi.',
      es: 'Zumo de naranja, bizcocho de naranja casero, quiche de champiñones, cruasanes rellenos de requesón y kiwi.',
      fr: 'Jus d\'orange, gâteau à l\'orange maison, quiche aux champignons, croissants fourrés au fromage blanc et kiwi.',
      de: 'Orangensaft, hausgemachter Orangenkuchen, Pilz-Quiche, mit Hüttenkäse und Kiwi gefüllte Croissants.',
      it: 'Spremuta d\'arancia, torta all\'arancia fatta in casa, quiche ai funghi, croissant farciti con fiocchi di latte e kiwi.'
    },
    price: 9.90,
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=800',
    isMain: true
  },
  {
    id: 'm2',
    name: {
      pt: 'Menu Português',
      en: 'Portuguese Menu',
      es: 'Menú Portugués',
      fr: 'Menu Portugais',
      de: 'Portugiesisches Menü',
      it: 'Menu Portoghese'
    },
    description: {
      pt: 'Leite com chocolate, Pão de mistura c/ presunto, Pastel de bacalhau e Pastel de nata.',
      en: 'Chocolate milk, Mixed bread with ham, Codfish fritter and Pastel de nata.',
      es: 'Leche con chocolate, Pan de mezcla con jamón, Buñuelo de bacalao y Pastel de nata.',
      fr: 'Lait au chocolat, Pain de campagne au jambon, Beignet de morue et Pastel de nata.',
      de: 'Schokomilch, Mischbrot mit Schinken, Kabeljau-Krokette und Pastel de nata.',
      it: 'Latte al cioccolato, Pane misto con prosciutto, Crocchetta di baccalà e Pastel de nata.'
    },
    price: 8.90,
    image: '/portuguese_breakfast.png',
    isMain: true
  },
  {
    id: 'm3',
    name: {
      pt: 'Menu Brunch',
      en: 'Brunch Menu',
      es: 'Menú Brunch',
      fr: 'Menu Brunch',
      de: 'Brunch-Menü',
      it: 'Menu Brunch'
    },
    description: {
      pt: 'Sumo de laranja, Ovos mexidos com farinheira, Mini tostas, rissol de camarão, rissol de leitão, patê de sardinha, Tarte caseira de maça.',
      en: 'Orange juice, scrambled eggs with farinheira, mini toasts, shrimp rissol, suckling pig rissol, sardine pate, homemade apple tart.',
      es: 'Zumo de naranja, huevos revueltos con farinheira, mini tostadas, rissol de gambas, rissol de cochinillo, paté de sardina, tarta de manzana casera.',
      fr: 'Jus d\'orange, œufs brouillés à la farinheira, mini toasts, rissol de crevettes, rissol de cochon de lait, pâté de sardines, tarte aux pommes maison.',
      de: 'Orangensaft, Rührei mit Farinheira, Mini-Toasts, Garnelen-Rissol, Spanferkel-Rissol, Sardinenpastete, hausgemachte Apfeltorte.',
      it: 'Spremuta d\'arancia, uova strapazzate con farinheira, mini toast, rissol di gamberi, rissol di maialino da latte, paté di sardine, crostata di mele fatta in casa.'
    },
    price: 14.90,
    image: 'https://images.unsplash.com/photo-1513442542250-854d436a73f2?auto=format&fit=crop&q=80&w=800',
    isMain: true
  },
  {
    id: 'm4',
    name: {
      pt: 'Menu Summer',
      en: 'Summer Menu',
      es: 'Menú Verano',
      fr: 'Menu d\'été',
      de: 'Sommer-Menü',
      it: 'Menu Summer'
    },
    description: {
      pt: 'Limonada fresca, Queijo fresco, Tosta de pasta de atum com alface, torta de limão, tarte de pêra e chocolate.',
      en: 'Fresh lemonade, fresh cheese, tuna paste toast with lettuce, lemon roll, pear and chocolate tart.',
      es: 'Limonada fresca, queso fresco, tostada de pasta de de atún con lechuga, torta de limón, tarta de pera y chocolate.',
      fr: 'Limonade fraîche, fromage frais, toast à la mousse de thon et laitue, roulé au citron, tarte poire et chocolat.',
      de: 'Frische Limonade, Frischkäse, Thunfischpasteten-Toast mit Salat, Zitronenrolle, Birnen-Schokoladen-Torte.',
      it: 'Limonata fresca, formaggio fresco, toast con pasta di tonno e lattuga, rotolo al limone, crostata di pere e cioccolato.'
    },
    price: 9.90,
    image: '/menu_summer.png',
    isMain: true
  }
];

export const extras: MenuItem[] = [
  {
    id: 'e1',
    name: { pt: 'Bifana á Portuguesa, no pão', en: 'Portuguese Bifana in bread', es: 'Bifana Portuguesa en pan', fr: 'Bifana Portugaise dans du pain', de: 'Portugiesische Bifana im Brot', it: 'Bifana Portoghese nel pane' },
    description: { pt: 'Receita tradicional portuguesa no pão.', en: 'Traditional Portuguese pork sandwich.', es: 'Receta tradicional portuguesa en pan.', fr: 'Recette traditionnelle portugaise dans du pain.', de: 'Traditionelles portugiesisches Schweinefleisch-Sandwich.', it: 'Ricetta tradicional portoghese nel pane.' },
    price: 3.90,
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=800',
    isMain: false
  },
  {
    id: 'e2',
    name: { pt: 'Prego no pão c/ pickles', en: 'Steak sandwich w/ pickles', es: 'Prego en pan con pepinillos', fr: 'Sandwich de steak aux pickles', de: 'Steak-Sandwich mit Pickles', it: 'Prego nel pane con sottaceti' },
    description: { pt: 'Bife tenro com pickles caseiros.', en: 'Tender steak with homemade pickles.', es: 'Filete tierno con pepinillos caseros.', fr: 'Steak tendre avec des pickles maison.', de: 'Zartes Steak mit hausgemachten Pickles.', it: 'Bistecca tenera con sottaceti fatti in casa.' },
    price: 4.90,
    image: '/prego_steaksandwich.png',
    isMain: false
  },
  {
    id: 'e3',
    name: { pt: 'Croquete de vitela', en: 'Veal croquette', es: 'Croqueta de ternera', fr: 'Croquette de veau', de: 'Kalbsskrokette', it: 'Crocchetta di vitello' },
    description: { pt: 'Artesanal e estaladiço.', en: 'Handcrafted and crispy.', es: 'Artesanal y crujiente.', fr: 'Artisanal et croustillant.', de: 'Handwerklich und knusprig.', it: 'Artigianale e croccante.' },
    price: 1.90,
    image: '/veal_croquettes.png',
    isMain: false
  },
  {
    id: 'e4',
    name: { pt: 'Rissol de leitão', en: 'Suckling pig rissol', es: 'Rissol de cochinillo', fr: 'Rissol de cochon de lait', de: 'Spanferkel-Rissol', it: 'Rissol di maialino da latte' },
    description: { pt: 'Salgado artesanal premium.', en: 'Premium handcrafted savory.', es: 'Aperitivo premium artesanal.', fr: 'Savoureux artisanal premium.', de: 'Premium handgemachter Snack.', it: 'Salato artigianale premium.' },
    price: 3.90,
    image: '/suckling_pig_rissol.png',
    isMain: false
  }
];
