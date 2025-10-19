     import Stripe from 'stripe';

// Initialize Stripe with your secret key.
// We are removing the apiVersion and automatic_payment_methods for this fix.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', 'https://alltheseflows.shop'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight "OPTIONS" request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { items } = req.body;

      // Create a Checkout Session with Stripe
      const session = await stripe.checkout.sessions.create({
        
        // --- THE FIX ---
        // We are now explicitly listing the payment methods to show.
        // This is a reliable method that bypasses API version issues.
        payment_method_types: ['card', 'klarna', 'afterpay_clearpay'],
        // ----------------

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
        success_url: `https://alltheseflows.shop/confirm.html`,
        cancel_url: `https://alltheseflows.shop/`,
      });

      // Send the session URL back to the website
      return res.status(200).json({ url: session.url });

    } catch (error) {
      console.error("Error creating Stripe session:", error);
      return res.status(500).json({ error: 'Failed to create Stripe session' });
    }
  } else {
    // Handle other methods
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
}

   
