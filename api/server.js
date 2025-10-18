import Stripe from 'stripe';

// Initialize Stripe with your secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Although your pages are now on the same domain, these headers
  // won't hurt and can be useful if you ever split them again.
  res.setHeader('Access-Control-Allow-Origin', 'https://alltheseflows.shop/'); // Or your new domain if changed
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      // Get the cart items from the request body
      const { items } = req.body;

      // Create a Checkout Session with Stripe
      const session = await stripe.checkout.sessions.create({
        
        // --- THIS IS THE FIX ---
        // REMOVED: payment_method_types: ['card'],
        // ADDED: This line enables all payment methods from your dashboard (like Klarna)
        automatic_payment_methods: { enabled: true },
        // -----------------------

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
        success_url: `https://alltheseflows.shop/success`, // Make sure this domain is correct
        cancel_url: `https://alltheseflows.shop/`,       // Make sure this domain is correct
      });

      // Send the session URL back to the front-end
      return res.status(200).json({ url: session.url });

    } catch (error) {
      console.error("Error creating Stripe session:", error);
      return res.status(500).json({ error: 'Failed to create Stripe session' });
    }
  } else {
    // If method is not POST or OPTIONS, send an error
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
}
