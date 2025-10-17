import Stripe from 'stripe';

// Initialize Stripe with your secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // IMPORTANT: This is the CORS fix.
  // It specifically allows your website to make requests to this server.
  res.setHeader('Access-Control-Allow-Origin', 'https://alltheseflows.vercel.app/');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // The browser sends an OPTIONS request first to check permissions (a "preflight" request)
  // We need to respond with a 200 OK to let the actual POST request through.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      // Get the cart items from the request body sent by the front-end
      const { items } = req.body;

      // Create a Checkout Session with Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items,
        mode: 'payment',
        shipping_address_collection: {
          // You can customize which countries you ship to
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
        // IMPORTANT: Replace these placeholder URLs with your actual success and cancel pages
        success_url: `https://alltheseflows.vercel.app/success`,
        cancel_url: `https://alltheseflows.vercel.app/`,
      });

      // Send the session URL back to the front-end
      return res.status(200).json({ url: session.url });

    } catch (error) {
      console.error("Error creating Stripe session:", error);
      return res.status(500).json({ error: 'Failed to create Stripe session' });
    }
  } else {
    // If the request method is not POST or OPTIONS, send a "Method Not Allowed" error
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
}
