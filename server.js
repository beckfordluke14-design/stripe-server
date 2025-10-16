// You DO NOT need to install anything for this file. Vercel does it automatically.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Securely gets your key from Vercel

export default async function handler(req, res) {
  // Allow requests from any origin (for Google Sites)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle pre-flight requests for CORS
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
        // IMPORTANT: You will replace these placeholder URLs later.
        success_url: `https://YOUR_GOOGLE_SITE_URL/success-page`,
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