const { getStore } = require('@netlify/blobs');
const { requireAuth, json } = require('./auth');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const user = requireAuth(event);
  if (!user) return json(401, { error: 'Unauthorized' });
  try {
    const content = JSON.parse(event.body || '{}');
    if (!content || !content.settings || !content.hero) {
      return json(422, { error: 'Invalid content structure' });
    }
    content.version = content.version || '1.0.0';
    content.lastPublishedAt = new Date().toISOString();
    content.lastPublishedBy = user.email;
    const store = getStore('pt-content');
    await store.setJSON('content.json', content);
    return json(200, { ok: true, lastPublishedAt: content.lastPublishedAt });
  } catch (error) {
    return json(400, { error: 'Unable to publish content', details: error.message });
  }
};
