import { spawn } from 'child_process';
import { resolve } from 'path';

// Test commands for MCP server
const testCommands = [
  // Test 1: Valid find order request
  {
    type: 'tool_call',
    tool: 'find_order',
    id: 'test-1',
    params: {
      orderId: 'ORDER-123'
    }
  },
  
  // Test 2: Find order with multiple parameters
  {
    type: 'tool_call',
    tool: 'find_order',
    id: 'test-2',
    params: {
      orderId: 'ORDER-456',
      customerIdentifier: 'CUST-789',
      orderTrackingUrl: 'https://track.example.com/ORDER-456'
    }
  },

  // Test 3: Invalid JSON (this will be sent as a string)
  'invalid json data',

  // Test 4: Valid JSON but invalid tool
  {
    type: 'tool_call',
    tool: 'unknown_tool',
    id: 'test-4',
    params: {}
  }
];

async function runTests() {
  // Start the server process
  const server = spawn('npx', ['ts-node', resolve(__dirname, 'run-server.ts')], {
    stdio: ['pipe', 'pipe', 'pipe']  // Changed to pipe stderr as well
  });

  // Handle server output
  server.stdout.on('data', (data: Buffer) => {
    try {
      const lines = data.toString().split('\n').filter((line: string) => line.trim());
      for (const line of lines) {
        try {
          const response = JSON.parse(line);
          console.log('\nReceived response:', JSON.stringify(response, null, 2));
        } catch {
          console.log('\nReceived output:', line);
        }
      }
    } catch (error) {
      console.log('\nError processing output:', error);
    }
  });

  // Handle server errors
  server.stderr.on('data', (data: Buffer) => {
    console.error('\nServer error:', data.toString());
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Send commands and handle responses
  for (const command of testCommands) {
    console.log('\nSending command:', typeof command === 'string' ? command : JSON.stringify(command, null, 2));
    
    server.stdin.write(typeof command === 'string' ? command + '\n' : JSON.stringify(command) + '\n');

    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Clean up
  await new Promise(resolve => setTimeout(resolve, 1000));
  server.kill();
  process.exit(0);
}

// Run the tests
runTests().catch(console.error); 