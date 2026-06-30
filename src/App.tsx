import { doc, setDoc } from 'firebase/firestore'; // Adiciona esta importação no topo se não tiveres

// ... resto do teu código anterior ...

const handleCheckoutSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (cart.length === 0) return;
  
  setIsSubmitting(true);
  setSubmitError(null);

  const selectedItemId = cart[0]?.menuItem.id;
  const stripeCheckoutUrl = STRIPE_PAYMENT_LINKS[selectedItemId];

  if (!stripeCheckoutUrl) {
    setSubmitError(lang === 'pt' 
      ? 'Link de pagamento não configurado para este produto.' 
      : 'Payment link not configured for this product.');
    setIsSubmitting(false);
    return;
  }

  // GERAR UM ID SEGURO COMPATÍVEL COM AS TUAS REGRAS (Apenas letras, números e hífen)
  const customBookingId = `bk-${Date.now()}`;

  // DADOS ESTRUTURADOS EXATAMENTE COMO O TEU ESQUEMA JSON EXIGE
  const bookingData = {
    id: customBookingId,
    clientName: clientName.trim(),
    clientEmail: clientEmail.trim(),
    clientPhone: clientPhone.trim(),
    airbnbAddress: airbnbAddress.trim(),
    deliveryDate: deliveryDate,
    deliveryTime: deliveryTime,
    deliveryNotes: deliveryNotes ? deliveryNotes.trim() : "", // Garante que é string válida
    items: cart.map((c: CartItem) => ({
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
    // USAR SETDOC PARA ENVIAR O ID SEGURO QUE A TUA REGRA EXIGE
    await setDoc(doc(db, 'bookings', customBookingId), bookingData);

    // Se a gravação no Firebase correu bem, limpamos o carrinho e avançamos!
    setCart([]);
    setIsCartOpen(false);
    window.location.assign(stripeCheckoutUrl);
    
  } catch (err) {
    console.error("Erro na validação do Firebase:", err);
    setSubmitError(lang === 'pt' 
      ? 'Erro ao registar o pedido no Firebase. Verifica os dados.' 
      : 'Error registering order in Firebase. Please check details.');
  } finally {
    setIsSubmitting(false);
  }
};
