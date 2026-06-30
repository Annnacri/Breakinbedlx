const handleCheckoutSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (cart.length === 0) return;
  
  setIsSubmitting(true);
  setSubmitError(null);

  // 1. Buscar o link do Stripe ANTES
  const selectedItemId = cart[0]?.menuItem.id;
  const stripeCheckoutUrl = STRIPE_PAYMENT_LINKS[selectedItemId];

  if (!stripeCheckoutUrl) {
    setSubmitError(lang === 'pt' 
      ? 'Link de pagamento não encontrado para este produto.' 
      : 'Payment link not found for this product.');
    setIsSubmitting(false);
    return;
  }

  // GERAR ID COMPATÍVEL COM A TUA REGRA isValidId(bookingId)
  const customBookingId = `bk-${Date.now()}`;

  // ESTRUTURA EXATA EXIGIDA PELO TEU SCHEMAS JSON E REGRAS FIRESTORE
  const bookingData = {
    clientName: clientName.trim(),
    clientEmail: clientEmail.trim(),
    clientPhone: clientPhone.trim(),
    airbnbAddress: airbnbAddress.trim(),
    deliveryDate: deliveryDate,
    deliveryTime: deliveryTime,
    deliveryNotes: deliveryNotes ? deliveryNotes.trim() : "", // Garante string limpa para passar no schema
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
    // 2. Gravar no Firebase usando SETDOC para enviar com o ID validado
    try {
      await setDoc(doc(db, 'bookings', customBookingId), bookingData);
    } catch (firebaseErr) {
      console.error("Erro ao gravar no Firebase (Regras do Firestore):", firebaseErr);
      // Mantém o try/catch isolado para não bloquear o cliente caso queiras que ele pague de qualquer forma
    }

    // 3. Limpar o carrinho
    setCart([]);
    setIsCartOpen(false);

    // 4. Redirecionamento
    console.log("A redirecionar para:", stripeCheckoutUrl);
    window.location.assign(stripeCheckoutUrl);
    
  } catch (err) {
    console.error("Erro geral no submit:", err);
    setSubmitError(lang === 'pt' ? 'Erro ao conectar.' : 'Connection error.');
  } finally {
    setIsSubmitting(false);
  }
};
