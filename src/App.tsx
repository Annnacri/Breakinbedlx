const handleCheckoutSubmit = async (e: React.FormEvent) => {
  // Impede que a página faça refresh e limpe os dados do cliente
  e.preventDefault();
  if (cart.length === 0) return;
  
  setIsSubmitting(true);
  setSubmitError(null);

  // 1. ANÁLISE DO LINK DO STRIPE
  // Obtém o ID do produto que está no carrinho (ex: 'menu-brunch')
  const selectedItemId = cart[0]?.menuItem.id;
  const stripeCheckoutUrl = STRIPE_PAYMENT_LINKS[selectedItemId];

  // Se o produto não tiver um link configurado, avisa o utilizador e para aqui
  if (!stripeCheckoutUrl) {
    setSubmitError(lang === 'pt' 
      ? 'Link de pagamento não encontrado para este produto.' 
      : 'Payment link not found for this product.');
    setIsSubmitting(false);
    return;
  }

  // 2. CRIAÇÃO DE ID COMPATÍVEL COM AS TUAS REGRAS
  // Gera um ID único baseado no tempo atual (Ex: bk-1719758700000)
  const customBookingId = `bk-${Date.now()}`;

  // 3. ORGANIZAÇÃO DOS DADOS DE ACORDO COM O SCHEMA DO FIRESTORE
  // O uso do .trim() remove espaços vazios acidentais que o cliente possa digitar
  const bookingData = {
    clientName: clientName.trim(),
    clientEmail: clientEmail.trim(),
    clientPhone: clientPhone.trim(),
    airbnbAddress: airbnbAddress.trim(),
    deliveryDate: deliveryDate,
    deliveryTime: deliveryTime,
    // Se não houver notas, envia uma string vazia "" para não quebrar a regra de validação
    deliveryNotes: deliveryNotes ? deliveryNotes.trim() : "", 
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
    // 4. GRAVAÇÃO NA BASE DE DADOS (BLOCO SEGURO)
    try {
      // Usamos setDoc com doc() para impor o nosso ID personalizado (customBookingId)
      await setDoc(doc(db, 'bookings', customBookingId), bookingData);
    } catch (firebaseErr) {
      // Se o Firebase falhar por problemas de rede ou permissões, guardamos o erro no histórico
      // Mas NÃO bloqueamos o cliente. Ele trabalhou duro, merece ir para o Stripe pagar!
      console.error("Erro ao gravar no Firebase (Verifica as regras do Firestore):", firebaseErr);
    }

    // 5. LIMPEZA DO CARRINHO LOCAL
    setCart([]);
    setIsCartOpen(false);

    // 6. REDIRECIONAMENTO IMEDIATO PARA FATURAÇÃO
    console.log("A redirecionar para o Stripe:", stripeCheckoutUrl);
    window.location.assign(stripeCheckoutUrl);
    
  } catch (err) {
    console.error("Erro geral no submit:", err);
    setSubmitError(lang === 'pt' ? 'Erro ao conectar.' : 'Connection error.');
  } finally {
    setIsSubmitting(false);
  }
};
