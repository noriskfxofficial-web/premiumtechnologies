const crypto = require('crypto');

const DEFAULT_EMAIL = 'admin@ptsolutions.global';
const DEFAULT_PASSWORD = 'PTSolutions@2026';
const DEFAULT_SECRET = 'pt-solutions-demo-secret-change-this-before-public-launch';

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function unbase64url(input) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  while (input.length % 4) input += '=';
  return Buffer.from(input, 'base64').toString();
}

function getSecret() {
  return process.env.ADMIN_JWT_SECRET || DEFAULT_SECRET;
}

function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 };
  const encoded = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(body))}`;
  const signature = crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encoded}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expected = crypto.createHmac('sha256', getSecret()).update(`${header}.${payload}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const decoded = JSON.parse(unbase64url(payload));
  if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) return null;
  return decoded;
}

function requireAuth(event) {
  const auth = event.headers.authorization || event.headers.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return verifyToken(token);
}

function getCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || DEFAULT_EMAIL,
    password: process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD
  };
}

function json(statusCode, data) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(data)
  };
}

module.exports = { signToken, verifyToken, requireAuth, getCredentials, json };
