import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';

dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // OAuth Session Configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'breakfast-in-bed-lisboa-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport Google Strategy
  if (process.env.OAUTH_CLIENT_ID && process.env.OAUTH_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        proxy: true
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    ));

    passport.serializeUser((user: any, done) => {
      done(null, user);
    });

    passport.deserializeUser((user: any, done) => {
      done(null, user);
    });
  }

  // Auth Routes
  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login?error=auth_failed' }),
    (req, res) => {
      res.redirect('/');
    }
  );

  app.get('/api/user', (req, res) => {
    res.json(req.user || null);
  });

  app.get('/auth/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

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
      
      const line_items = items.map((item: any) => {
        const product_data: any = {
          name: item.name,
          description: item.description,
        };

        // Stripe requires absolute URLs for images. 
        // If it doesn't start with http, it's likely a relative path which Stripe will reject.
        if (item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'))) {
          product_data.images = [item.image];
        }

        return {
          price_data: {
            currency: 'eur',
            product_data,
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        };
      });

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
