import { ShoppingBag } from "lucide-react";

const STRIPE_PAYMENT_LINKS: Record<string, string> = {
  "rissol-leitao": "https://buy.stripe.com/9B63cw2eybqibrB7dG5gc0a",
  "croquete-vitela": "https://buy.stripe.com/eVq6oIf1k3XQanxeG85gc0b",
  "prego-pao": "https://buy.stripe.com/8x214odXgbqi53deG85gc0c",
  "bifana-portuguesa": "https://buy.stripe.com/00w3cw7yS51U7bldC45gc0d",
  "menu-summer": "https://buy.stripe.com/00w7sM4mGameeDN1Tm5gc0e",
  "menu-brunch": "https://buy.stripe.com/00wcN62eydyqcvF9lO5gc0f",
  "menu-portugues": "https://buy.stripe.com/aFa4gA6uOcum67hcy05gc0j",
  "menu-vitamina-c": "https://buy.stripe.com/bJeaEY1audyq7bl0Pi5gc0l",
};

const items = [
  { id: "rissol-leitao", title: "Rissol de Leitão", price: 3.9 },
  { id: "croquete-vitela", title: "Croquete de Vitela", price: 1.9 },
  { id: "prego-pao", title: "Prego no Pão", price: 4.9 },
  { id: "bifana-portuguesa", title: "Bifana Portuguesa", price: 3.9 },
  { id: "menu-summer", title: "Menu Verão", price: 9.9 },
  { id: "menu-brunch", title: "Menu Brunch", price: 14.9 },
  { id: "menu-portugues", title: "Menu Português", price: 8.9 },
  { id: "menu-vitamina-c", title: "Menu Vitamina C", price: 9.9 },
];

export default function App() {
  const openCheckout = (id: string) => {
    const url = STRIPE_PAYMENT_LINKS[id];
    if (url) window.location.href = url;
  };

  return (
    <div style={{ padding: 30, fontFamily: "system-ui" }}>
      <h1>Breakfast in Bed</h1>

      <div style={{ display: "grid", gap: 15 }}>
        {items.map((item) => (
          <div key={item.id} style={{ padding: 15, border: "1px solid #ddd" }}>
            <h3>{item.title}</h3>
            <p>{item.price}€</p>

            <button onClick={() => openCheckout(item.id)}>
              <ShoppingBag size={16} /> Comprar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
