import Stripe from 'stripe';

// Initialize Stripe with your secret key and the LATEST API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // This line fixes the "unknown parameter" error.
});

export default async function handler(req, res) {
  // CORS Headers - Set to your specific domain for security
  res.setHeader('Access-Control-Allow-Origin', 'https://alltheseflows.shop'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight "OPTIONS" request from the browser
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      // Get the cart items from the request body sent by your website
      const { items } = req.body;

      // Create a Checkout Session with Stripe
      const session = await stripe.checkout.sessions.create({
        
        // This parameter enables Klarna, Apple Pay, etc., from your dashboard
        automatic_payment_methods: { enabled: true },

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
        success_url: `https://alltheseflows.shop/success`, // Make sure this is a real page
        cancel_url: `https://alltheseflows.shop/`,
      });

      // Send the session URL back to the website to redirect the user
      return res.status(200).json({ url: session.url });

    } catch (error) {
      console.error("Error creating Stripe session:", error);
      return res.status(500).json({ error: 'Failed to create Stripe session' });
    }
  } else {
    // If the request method is not POST or OPTIONS, send an error
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
}

