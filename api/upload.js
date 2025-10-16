// The final, corrected api/upload.js file
import { put } from '@vercel/blob';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const filename = request.query.filename;

  if (!filename || !request.body) {
     return response.status(400).json({ message: 'No filename or body provided.' });
  }

  try {
    const blob = await put(filename, request.body, {
      access: 'public',
    });
    return response.status(200).json(blob);
  } catch (error) {
    console.error('Upload error:', error);
    return response.status(500).json({ message: 'Error uploading file.' });
  }
}
