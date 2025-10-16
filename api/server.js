// The corrected api/server.js file
import Stripe from 'stripe'; // <-- NEW LINE (replaces the old 'require' line)

// This line now uses the imported Stripe and your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 

export default async function handler(req, res) {
  // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { items } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items,
        mode: 'payment',
        
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'DO'], 
        },
        phone_number_collection: {
          enabled: true,
        },
        billing_address_collection: 'required',
        consent_collection: {
          promotions: 'auto',
        },
        customer_creation: 'always',

        success_url: `https://YOUR_GOOGLE_SITE_URL/success-page`, // Remember to replace these later
        cancel_url: `https://YOUR_GOOGLE_SITE_URL/cancel-page`,
      });

      return res.status(200).json({ url: session.url });
    } catch (error) {
      console.error("Error creating Stripe session:", error);
      return res.status(500).json({ error: 'Failed to create Stripe session' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
}
