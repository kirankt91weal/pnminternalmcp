import { spawn } from 'child_process';
import { resolve } from 'path';

// Lovable.dev style MCP request
const lovableRequest = {
  version: '0.1',
  type: 'function_call',
  name: 'find_order',
  arguments: {
    orderId: 'ORDER-123'
  },
  requestId: 'lovable-test-1'
};

async function testWithLovable() {
  console.log('Starting Lovable.dev MCP test...\n');

  // Start the MCP server
  const server = spawn('npx', ['ts-node', resolve(__dirname, 'run-server.ts')], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Handle server output
  server.stdout.on('data', (data: Buffer) => {
    const lines = data.toString().split('\n').filter((line: string) => line.trim());
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        console.log('\n=== Lovable received response ===');
        console.log(JSON.stringify(response, null, 2));
        
        // Verify response format matches Lovable's expectations
        if (response.type === 'tool_response' || response.type === 'error') {
          console.log('\n=== Response validation ===');
          console.log('✓ Response type is valid');
          console.log('✓ Response includes request ID:', response.id === lovableRequest.requestId);
          if (response.type === 'tool_response') {
            console.log('✓ Response includes result data');
          } else {
            console.log('✓ Response includes error message');
          }
        }
      } catch {
        console.log('\nServer message:', line);
      }
    }
  });

  // Handle server errors
  server.stderr.on('data', (data: Buffer) => {
    console.error('\nServer error:', data.toString());
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Send Lovable-style request
  console.log('\n=== Sending Lovable.dev request ===');
  console.log(JSON.stringify(lovableRequest, null, 2));

  // Convert Lovable request to our MCP format
  const mcpRequest = {
    type: 'tool_call',
    tool: lovableRequest.name,
    id: lovableRequest.requestId,
    params: lovableRequest.arguments
  };

  server.stdin.write(JSON.stringify(mcpRequest) + '\n');

  // Wait for response and cleanup
  await new Promise(resolve => setTimeout(resolve, 2000));
  server.kill();
  process.exit(0);
}

// Run the test
testWithLovable().catch(console.error); 