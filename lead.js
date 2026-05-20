const { getStore } = require('@netlify/blobs');
const { json } = require('./auth');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const body = JSON.parse(event.body || '{}');
    const lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      name: String(body.name || '').slice(0, 160),
      email: String(body.email || '').slice(0, 180),
      company: String(body.company || '').slice(0, 180),
      interest: String(body.interest || '').slice(0, 180),
      message: String(body.message || '').slice(0, 2000)
    };
    if (!lead.name || !lead.email || !lead.message) return json(422, { error: 'Name, email, and message are required.' });
    const store = getStore('pt-leads');
    const current = (await store.get('leads.json', { type: 'json' })) || [];
    current.unshift(lead);
    await store.setJSON('leads.json', current.slice(0, 1000));
    return json(200, { ok: true, leadId: lead.id });
  } catch (error) {
    return json(400, { error: 'Unable to submit request' });
  }
};
