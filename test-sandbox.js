require('dotenv').config();
const PayNearMeClient = require('./client/paynearme');

async function testSandbox() {
  const client = new PayNearMeClient();

  try {
    // Test: Order Lookup
    console.log('\nTesting order lookup...');
    const orderId = '89804488355';
    const order = await client.findOrder(orderId);
    console.log('Order lookup result:', JSON.stringify(order, null, 2));
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('API Error Details:', error.response.data);
    }
    process.exit(1);
  }
}

console.log('Starting PayNearMe API Tests...');
console.log('Using site ID:', process.env.PNM_MERCHANT_ID);
console.log('Using API base:', process.env.PNM_API_BASE);

testSandbox(); 