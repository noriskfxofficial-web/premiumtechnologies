const { getStore } = require('@netlify/blobs');
const { requireAuth, json } = require('./auth');

exports.handler = async function (event) {
  const user = requireAuth(event);
  if (!user) return json(401, { error: 'Unauthorized' });
  try {
    const store = getStore('pt-leads');
    const leads = (await store.get('leads.json', { type: 'json' })) || [];
    return json(200, { leads });
  } catch (error) {
    return json(200, { leads: [] });
  }
};
