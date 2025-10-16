// The final, corrected api/upload.js file
import { put } from '@vercel/blob';

export default async function handler(request) {
  // Vercel automatically provides query parameters in `request.query`.
  const filename = request.query.filename;

  // The request body contains the raw file data.
  if (!filename || !request.body) {
     return new Response(JSON.stringify({ message: 'No filename or body provided.' }), { status: 400 });
  }

  // Upload the file body to Vercel Blob
  const blob = await put(filename, request.body, {
    access: 'public',
  });

  // Respond with the blob's data, including the URL
  return new Response(JSON.stringify(blob), { status: 200 });
}
