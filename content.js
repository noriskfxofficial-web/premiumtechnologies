const { getStore } = require('@netlify/blobs');
const defaultContent = require('./defaultContent.json');
const { json } = require('./auth');

exports.handler = async function () {
  try {
    const store = getStore('pt-content');
    const content = await store.get('content.json', { type: 'json' });
    return json(200, content || defaultContent);
  } catch (error) {
    return json(200, defaultContent);
  }
};
