import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Test credentials (these would normally come from the Lovable user)
const testCredentials = {
  apiKey: 'test-api-key',
  siteId: 'test-site',
  siteUrl: 'https://sandbox.paynearme.com'
};

async function testServer() {
  try {
    console.log('Testing PayNearMe MCP Server...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('Health check response:', health.data);

    // Test tools documentation endpoint
    console.log('\n2. Testing tools documentation endpoint...');
    const tools = await axios.get(`${BASE_URL}/tools`);
    console.log('Tools documentation:', JSON.stringify(tools.data, null, 2));

    // Test find_order execution
    console.log('\n3. Testing find_order execution...');
    const orderRequest = {
      version: '0.1',
      type: 'function_call',
      name: 'find_order',
      arguments: {
        orderId: 'ORDER-123'
      },
      credentials: testCredentials,
      requestId: 'test-1'
    };

    const orderResponse = await axios.post(`${BASE_URL}/execute`, orderRequest);
    console.log('Find order response:', JSON.stringify(orderResponse.data, null, 2));

    // Test error handling (invalid tool)
    console.log('\n4. Testing error handling (invalid tool)...');
    const invalidRequest = {
      version: '0.1',
      type: 'function_call',
      name: 'invalid_tool',
      arguments: {},
      credentials: testCredentials,
      requestId: 'test-2'
    };

    try {
      const errorResponse = await axios.post(`${BASE_URL}/execute`, invalidRequest);
      console.log('Error response:', JSON.stringify(errorResponse.data, null, 2));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log('Error response:', JSON.stringify(error.response.data, null, 2));
      } else {
        throw error;
      }
    }

    // Test error handling (missing credentials)
    console.log('\n5. Testing error handling (missing credentials)...');
    const noCredentialsRequest = {
      version: '0.1',
      type: 'function_call',
      name: 'find_order',
      arguments: {
        orderId: 'ORDER-123'
      },
      requestId: 'test-3'
    };

    try {
      const noCredResponse = await axios.post(`${BASE_URL}/execute`, noCredentialsRequest);
      console.log('Error response:', JSON.stringify(noCredResponse.data, null, 2));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log('Error response:', JSON.stringify(error.response.data, null, 2));
      } else {
        throw error;
      }
    }

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Wait for server to start
setTimeout(testServer, 1000); 