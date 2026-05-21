const { getStore } = require('@netlify/blobs');
const defaultContent = require('./defaultContent.json');
const { json } = require('./auth');

exports.handler = async function () {
  try {
    const store = getStore('pt-content');
    const content = await store.get('content.json', { type: 'json' });
    // Final VIP package safeguard: if an older blob exists from a previous build,
    // serve the upgraded default content until the new draft is published.
    if (content && content.version === defaultContent.version) return json(200, content);
    return json(200, defaultContent);
  } catch (error) {
    return json(200, defaultContent);
  }
};
