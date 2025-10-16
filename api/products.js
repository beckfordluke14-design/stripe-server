// The final, corrected api/products.js file
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Allow requests from any origin (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: This runs when your website loads, to fetch all products.
  if (req.method === 'GET') {
    try {
      // Retrieve the 'products' object from the database
      const products = await kv.get('products');
      return res.status(200).json(products || {});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch products.' });
    }
  }

  // POST: This runs when you save a product in the admin panel.
  if (req.method === 'POST') {
    try {
      const { products } = req.body;
      // Save the entire products object to the database under the key 'products'
      await kv.set('products', products);
      return res.status(200).json({ message: 'Products saved successfully.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to save products.' });
    }
  }

  return res.status(405).end('Method Not Allowed');
}
