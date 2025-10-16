mport { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Retrieve all products from the database
  if (req.method === 'GET') {
    try {
      const products = await kv.get('products');
      return res.status(200).json(products || {});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch products.' });
    }
  }

  // POST: Save all products to the database
  if (req.method === 'POST') {
    try {
      const { products } = req.body;
      await kv.set('products', products);
      return res.status(200).json({ message: 'Products saved successfully.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to save products.' });
    }
  }

  return res.status(405).end('Method Not Allowed');
}
