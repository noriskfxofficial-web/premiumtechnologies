const { getStore } = require('@netlify/blobs');
const { requireAuth, json } = require('./auth');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const user = requireAuth(event);
  if (!user) return json(401, { error: 'Unauthorized' });
  try {
    const body = JSON.parse(event.body || '{}');
    const data = body.data || '';
    const match = data.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return json(422, { error: 'Invalid file data' });
    const contentType = match[1];
    const base64 = match[2];
    const size = Buffer.byteLength(base64, 'base64');
    if (size > 4 * 1024 * 1024) return json(413, { error: 'File too large. Max 4MB per upload.' });
    const safeName = String(body.filename || 'upload').replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 80);
    const key = `${Date.now()}-${safeName}`;
    const store = getStore('pt-media');
    await store.setJSON(key, { contentType, base64, uploadedAt: new Date().toISOString(), uploadedBy: user.email });
    return json(200, { ok: true, url: `/.netlify/functions/media?key=${encodeURIComponent(key)}` });
  } catch (error) {
    return json(400, { error: 'Unable to upload media', details: error.message });
  }
};
