// The final, corrected api/upload.js file
import { put } from '@vercel/blob';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  // THIS IS THE FIX: Read the filename from the 'x-filename' header
  const filename = request.headers['x-filename'];

  if (!filename || !request.body) {
     return response.status(400).json({ message: 'No filename or body provided.' });
  }

  try {
    // Upload the file body directly to Vercel Blob
    const blob = await put(filename, request.body, {
      access: 'public',
    });
    // Respond with the blob's data, including the URL
    return response.status(200).json(blob);
  } catch (error) {
    console.error('Upload error:', error);
    return response.status(500).json({ message: 'Error uploading file.' });
  }
}
