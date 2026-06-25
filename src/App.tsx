import { ShoppingBag } from "lucide-react";

// STRIPE LINKS
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

const menuItems = [
  {
    id: "rissol-leitao",
    title: "Rissol de Leitão",
    price: 3.9,
    desc: "Salgado tradicional português crocante.",
    img: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77",
  },
  {
    id: "croquete-vitela",
    title: "Croquete de Vitela",
    price: 1.9,
    desc: "Croquete artesanal dourado.",
    img: "https://images.unsplash.com/photo-1626132647523-66f5bf380027",
  },
  {
    id: "prego-pao",
    title: "Prego no Pão",
    price: 4.9,
    desc: "Sanduíche tradicional português.",
    img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd",
  },
  {
    id: "bifana-portuguesa",
    title: "Bifana Portuguesa",
    price: 3.9,
    desc: "Carne marinada em pão quente.",
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
  },
  {
    id: "menu-summer",
    title: "Menu Verão",
    price: 9.9,
    desc: "Leve e fresco para o verão.",
    img: "https://images.unsplash.com/photo-1528207776546-365bb710ee93",
  },
  {
    id: "menu-brunch",
    title: "Menu Brunch",
    price: 14.9,
    desc: "Brunch completo premium.",
    img: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d",
  },
  {
    id: "menu-portugues",
    title: "Menu Português",
    price: 8.9,
    desc: "Sabores tradicionais portugueses.",
    img: "https://images.unsplash.com/photo-1517433367423-c7e5b0f35086",
  },
  {
    id: "menu-vitamina-c",
    title: "Menu Vitamina C",
    price: 9.9,
    desc: "Fresco, energético e saudável.",
    img: "https://images.unsplash.com/photo-1621510456681-23a23cfb5f57",
  },
];

export default function App() {
  const handleOrder = (id: string) => {
    const url = STRIPE_PAYMENT_LINKS[id];
    if (!url) return alert("Link de pagamento não encontrado");
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800">

      {/* HEADER */}
      <header className="text-center py-12 px-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Breakfast in Bed
        </h1>
        <p className="text-neutral-500 mt-2">
          Lisbon Airbnb Breakfast Delivery
        </p>
      </header>

      {/* GRID */}
      <main className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {menuItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border"
          >

            {/* image */}
            <img
              src={item.img}
              className="h-44 w-full object-cover"
            />

            {/* content */}
            <div className="p-5 flex flex-col gap-3">

              <div className="flex justify-between items-start">
                <h2 className="font-bold text-lg">{item.title}</h2>
                <span className="font-bold text-amber-600">
                  {item.price.toFixed(2)}€
                </span>
              </div>

              <p className="text-sm text-neutral-500">
                {item.desc}
              </p>

              {/* button */}
              <button
                onClick={() => handleOrder(item.id)}
                className="mt-2 bg-black text-white py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition"
              >
                <ShoppingBag size={16} />
                Order Now
              </button>

            </div>
          </div>
        ))}

      </main>
    </div>
  );
}
