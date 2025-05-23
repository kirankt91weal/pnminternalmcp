require('dotenv').config();
const { generateSignature } = require('./auth/hmac');

// Test data
const orderId = 'ORDER123';
const timestamp = Math.floor(Date.now() / 1000).toString();
const method = 'POST';
const endpoint = '/api/orders/find';
const body = JSON.stringify({ order_id: orderId });

// Generate signature
const signature = generateSignature(method, endpoint, timestamp, body);

console.log(`
curl -X POST http://localhost:3000/api/orders/find \\
  -H "Content-Type: application/json" \\
  -H "X-PNM-Timestamp: ${timestamp}" \\
  -H "X-PNM-Key-Id: ${process.env.PNM_KEY_ID}" \\
  -H "X-PNM-Signature: ${signature}" \\
  -d '${body}'
`); 