\// The final, corrected api/upload.js file
import { put } from '@vercel/blob';

export default async function handler(request) {
  // In the Vercel Node.js runtime, query parameters are in `request.query`.
  const filename = request.query.filename;

  // The raw file data is in `request.body`.
  if (!filename || !request.body) {
     return new Response(JSON.stringify({ message: 'No filename or body provided.' }), { status: 400 });
  }

  // Upload the file body directly to Vercel Blob.
  const blob = await put(filename, request.body, {
    access: 'public',
  });

  // Respond with the blob's data, which includes the URL.
  return new Response(JSON.stringify(blob), { status: 200 });
}
