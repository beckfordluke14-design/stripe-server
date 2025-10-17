// api/offer.js
import { kv } from '@vercel/kv';

const OFFER_KEY = 'offerProduct'; // The key we'll use in the database

export default async function handler(req, res) {
  // Allow requests from any origin (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Runs when a visitor loads the page
  if (req.method === 'GET') {
    try {
      const offerProduct = await kv.get(OFFER_KEY);
      return res.status(200).json(offerProduct || {});
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch offer.' });
    }
  }

  // POST: Runs when you click "Save Offer" in the admin panel
  if (req.method === 'POST') {
    try {
      const { offerProduct } = req.body;
      await kv.set(OFFER_KEY, offerProduct);
      return res.status(200).json({ message: 'Offer saved successfully.' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save offer.' });
    }
  }

  return res.status(405).end('Method Not Allowed');
}
