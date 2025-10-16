// The final, corrected api/upload.js file
import { put } from '@vercel/blob';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
  }

  // THIS IS THE FIX: Read the filename from the 'x-filename' header
  const filename = request.headers.get('x-filename');

  if (!filename || !request.body) {
     return new Response(JSON.stringify({ message: 'No filename or body provided.' }), { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, {
      access: 'public',
    });
    return new Response(JSON.stringify(blob), { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ message: 'Error uploading file.' }), { status: 500 });
  }
}
