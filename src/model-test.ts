import { spawn } from 'child_process';
import { resolve } from 'path';

// Simulated model conversation
const modelConversation = [
  {
    role: 'user',
    content: 'Can you find the order with ID ORDER-123 for me?'
  },
  {
    role: 'assistant',
    content: 'I\'ll help you find that order using the PayNearMe API.',
    tool_calls: [
      {
        type: 'tool_call',
        tool: 'find_order',
        id: 'call-1',
        params: {
          orderId: 'ORDER-123'
        }
      }
    ]
  }
];

async function simulateModelInteraction() {
  console.log('Starting model interaction simulation...\n');

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
        
        // Simulate model processing the response
        console.log('\n=== Model received response ===');
        console.log(JSON.stringify(response, null, 2));
        
        if (response.type === 'tool_response') {
          console.log('\n=== Model interpretation ===');
          if (response.result && response.result.includes('Unauthorized')) {
            console.log('I apologize, but I received an unauthorized error from the PayNearMe API.');
            console.log('This is expected in our test environment. In production, with valid credentials,');
            console.log('I would receive the actual order details and could tell you:');
            console.log('- The order status');
            console.log('- Payment amount and currency');
            console.log('- Transaction type');
            console.log('- Customer details (if available)');
          } else {
            console.log('Here are the order details:', response.result);
          }
        } else if (response.type === 'error') {
          console.log('\n=== Model interpretation ===');
          console.log('I encountered an error:', response.error);
          console.log('Let me know if you\'d like me to try a different approach.');
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

  // Simulate the conversation
  for (const message of modelConversation) {
    console.log(`\n=== ${message.role.toUpperCase()} ===`);
    console.log(message.content);

    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        console.log('\n=== MODEL USING TOOL ===');
        console.log('Tool:', toolCall.tool);
        console.log('Parameters:', toolCall.params);
        
        server.stdin.write(JSON.stringify(toolCall) + '\n');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // Clean up
  await new Promise(resolve => setTimeout(resolve, 1000));
  server.kill();
  process.exit(0);
}

// Run the simulation
simulateModelInteraction().catch(console.error); 