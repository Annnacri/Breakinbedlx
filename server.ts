import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Breakfast in Bed Lisboa API' });
  });

  app.post('/api/create-checkout-session', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured' });
    }

    try {
      const { items, customer, delivery, deliveryFee } = req.body;

      const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
      
      const line_items = items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            description: item.description,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      if (deliveryFee && deliveryFee > 0) {
        line_items.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Delivery Fee / Taxa de Entrega',
              description: 'Service fee for accommodation delivery',
            },
            unit_amount: Math.round(deliveryFee * 100),
          },
          quantity: 1,
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart`,
        customer_email: customer.email,
        metadata: {
          deliveryDate: delivery.date,
          deliveryTime: delivery.time,
          address: delivery.address,
          phone: customer.phone,
        },
      });

      res.json({ id: session.id });
    } catch (error: any) {
      console.error('Stripe Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/order-details/:sessionId', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured' });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
        expand: ['line_items'],
      });
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
