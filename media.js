const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  try {
    const key = event.queryStringParameters && event.queryStringParameters.key;
    if (!key) return { statusCode: 404, body: 'Not found' };
    const store = getStore('pt-media');
    const file = await store.get(key, { type: 'json' });
    if (!file) return { statusCode: 404, body: 'Not found' };
    return {
      statusCode: 200,
      headers: {
        'Content-Type': file.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable'
      },
      isBase64Encoded: true,
      body: file.base64
    };
  } catch (error) {
    return { statusCode: 500, body: 'Unable to load media' };
  }
};
