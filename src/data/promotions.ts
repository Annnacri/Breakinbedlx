export interface Promotion {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  active: boolean;
  startDate?: string;
  endDate?: string;
  color: string;
}

export const promotions: Promotion[] = [
  {
    id: 'p1',
    title: {
      pt: 'Oferta de Boas-Vindas',
      en: 'Welcome Offer',
      es: 'Oferta de Bienvenida',
      fr: 'Offre de Bienvenue',
      de: 'Willkommensangebot',
      it: 'Offerta di Benvenuto'
    },
    description: {
      pt: 'Na compra de 5 menus, receba um extra à sua escolha grátis!',
      en: 'Buy 5 menus, get 1 free extra item of your choice!',
      es: '¡Compre 5 menús y reciba un extra gratis de su elección!',
      fr: 'Achetez 5 menus, obtenez un supplément gratuit de votre choix !',
      de: 'Kaufen Sie 5 Menüs, erhalten Sie ein Extra Ihrer Wahl gratis!',
      it: 'Compra 5 menu, ricevi un extra a tua scelta gratis!'
    },
    active: true,
    color: '#C86A4A' // Terra cotta
  },
  {
    id: 'p2',
    title: {
      pt: 'Madrugador',
      en: 'Early Bird',
      es: 'Madrugador',
      fr: 'Lève-tôt',
      de: 'Frühaufsteher',
      it: 'Mattiniero'
    },
    description: {
      pt: 'Descontos especiais para entregas antes das 9h.',
      en: 'Special discounts for deliveries before 9am.',
      es: 'Descuentos especiales para entregas antes de las 9:00.',
      fr: 'Remises spéciales pour les livraisons avant 9h.',
      de: 'Sonderrabatte für Lieferungen vor 9 Uhr morgens.',
      it: 'Sconti speciali per consegne prima delle 9:00.'
    },
    active: true,
    color: '#7C9A92' // Sage green
  }
];
