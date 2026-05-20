const crypto = require('crypto');
const { signToken, getCredentials, json } = require('./auth');

function safeEqual(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const body = JSON.parse(event.body || '{}');
    const credentials = getCredentials();
    if (!safeEqual(body.email, credentials.email) || !safeEqual(body.password, credentials.password)) {
      return json(401, { error: 'Invalid admin credentials' });
    }
    const token = signToken({ email: credentials.email, role: 'owner' });
    return json(200, { token, user: { email: credentials.email, role: 'owner' } });
  } catch (error) {
    return json(400, { error: 'Invalid request' });
  }
};
