// The final, corrected api/upload.js file
import { put } from '@vercel/blob';

export default async function handler(request) {
  // --- THIS IS THE FIX ---
  // We now use `request.headers.host` instead of `request.headers.get('host')`
  const { searchParams } = new URL(request.url, `https://${request.headers.host}`);
  // --- END OF FIX ---
  
  const filename = searchParams.get('filename');

  if (!filename || !request.body) {
     return new Response(JSON.stringify({ message: 'No filename provided.' }), { status: 400 });
  }

  const blob = await put(filename, request.body, {
    access: 'public',
  });

  return new Response(JSON.stringify(blob), { status: 200 });
}
