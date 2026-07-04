import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, deliveryFee, clientEmail, clientName, bookingId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid items' });
    }

    // Construir line_items para o Stripe
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }));

    // Adicionar taxa de entrega
    if (deliveryFee && deliveryFee > 0) {
      line_items.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Delivery Fee',
          },
          unit_amount: deliveryFee,
        },
        quantity: 1,
      });
    }

    // Criar Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.VERCEL_URL || 'http://localhost:3000'}/?success=true&booking=${bookingId}`,
      cancel_url: `${process.env.VERCEL_URL || 'http://localhost:3000'}/?canceled=true`,
      customer_email: clientEmail,
      metadata: {
        bookingId,
        clientName,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
