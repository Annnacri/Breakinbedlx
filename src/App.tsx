const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    // 1. Ir buscar o link do Stripe ANTES de mexer no Firebase para garantir que ele existe
    const selectedItemId = cart[0]?.menuItem.id;
    const stripeCheckoutUrl = STRIPE_PAYMENT_LINKS[selectedItemId];

    if (!stripeCheckoutUrl) {
      setSubmitError(lang === 'pt' 
        ? 'Link de pagamento não encontrado para este produto.' 
        : 'Payment link not found for this product.');
      setIsSubmitting(false);
      return;
    }

    const bookingData = {
      clientName,
      clientEmail,
      clientPhone,
      airbnbAddress,
      deliveryDate,
      deliveryTime,
      deliveryNotes: deliveryNotes || '',
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
      // 2. Tentar gravar no Firebase. 
      // Usamos um bloco try/catch isolado para que, mesmo que o Firebase falhe, o cliente consiga pagar!
      try {
        await addDoc(collection(db, 'bookings'), bookingData);
      } catch (firebaseErr) {
        console.error("Erro ao gravar no Firebase (Verifica as regras do Firestore):", firebaseErr);
        // Não bloqueia o utilizador, deixa-o ir pagar
      }

      // 3. Limpar o carrinho antes de sair
      setCart([]);
      setIsCartOpen(false);

      // 4. Redirecionamento forçado e limpo
      console.log("A redirecionar para:", stripeCheckoutUrl);
      window.location.assign(stripeCheckoutUrl);
      
    } catch (err) {
      console.error("Erro geral no submit:", err);
      setSubmitError(lang === 'pt' ? 'Erro ao conectar.' : 'Connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };
