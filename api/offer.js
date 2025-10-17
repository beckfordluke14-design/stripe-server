import { kv } from '@vercel/kv';

// This function handles getting and saving your offer data.
export default async function handler(request, response) {

  // This part runs when the page loads (GET request)
  if (request.method === 'GET') {
    try {
      const offerData = await kv.get('offerData');
      if (!offerData) {
        return response.status(404).json({ message: 'Offer data not yet saved.' });
      }
      return response.status(200).json(offerData);
    } catch (error) {
      return response.status(500).json({ message: 'Error fetching data from KV store.' });
    }
  }

  // This part runs when you save from the admin panel (POST request)
  if (request.method === 'POST') {
    // Security check for the admin password
    const adminPassword = request.headers['x-admin-password'];
    if (adminPassword !== 'e55c3p') {
      return response.status(403).json({ message: 'Authentication failed.' });
    }

    try {
      const newOfferData = request.body;
      await kv.set('offerData', newOfferData); // Save the new data to the database
      return response.status(200).json({ message: 'Offer updated successfully!' });
    } catch (error) {
      return response.status(500).json({ message: 'Error saving data to KV store.' });
    }
  }

  // If it's not GET or POST, it's not allowed
  response.setHeader('Allow', ['GET', 'POST']);
  return response.status(405).end('Method Not Allowed');
}
