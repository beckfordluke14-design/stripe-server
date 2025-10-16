// The final, corrected api/upload.js file for direct uploads
import { handleUpload } from '@vercel/blob/client';

export default async function handler(request, response) {
  const body = request.body;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // This generates a client token for the browser to upload the file
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This runs after the upload is finished
        console.log('Blob upload completed', blob.url);
      },
    });

    // Vercel's handleUpload function sends the response itself,
    // so we just forward it to be safe.
    response.status(200).json(jsonResponse);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
}
