// api/upload.js
import { put } from '@vercel/blob';

// The 'config' object that caused the error has been REMOVED.

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  // Add protection to your upload endpoint to prevent abuse in a real production app.
  // See https://vercel.com/docs/blob/security/securing-your-blob-store
  
  if (!filename || !request.body) {
     return new Response(JSON.stringify({ message: 'No filename provided.' }), { status: 400 });
  }

  const blob = await put(filename, request.body, {
    access: 'public',
  });

  return new Response(JSON.stringify(blob), { status: 200 });
}
