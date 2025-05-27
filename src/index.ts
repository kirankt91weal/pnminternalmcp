import { config } from './config';
import { findOrder } from './tools/findOrder';
import { FindOrderParams } from './types/paynearme';
import { EventEmitter } from 'events';

interface IOStreams {
  stdin: EventEmitter;
  stdout: { write: (data: string) => void };
}

export class MCPServer {
  private isRunning: boolean = false;
  private io: IOStreams;

  constructor(io?: Partial<IOStreams>) {
    this.io = {
      stdin: io?.stdin || process.stdin,
      stdout: io?.stdout || process.stdout
    };

    this.handleData = this.handleData.bind(this);
    this.handleSigterm = this.handleSigterm.bind(this);
  }

  async handleData(data: Buffer | string) {
    try {
      const request = JSON.parse(data.toString());
      
      if (request.type !== 'tool_call') {
        throw new Error('Invalid request type. Expected "tool_call"');
      }

      let response;
      
      // Handle tool calls
      switch (request.tool) {
        case 'find_order':
          const params = request.params as FindOrderParams;
          const result = await findOrder(params);
          response = {
            type: 'tool_response',
            id: request.id,
            result
          };
          break;
          
        default:
          response = {
            type: 'error',
            error: `Unknown tool: ${request.tool}`,
            id: request.id
          };
      }
      
      this.io.stdout.write(JSON.stringify(response) + '\n');
    } catch (error) {
      console.error('Error processing request:', error);
      
      // Send error response
      const response = {
        type: 'error',
        error: error instanceof Error ? error.message : 'Internal server error'
      };
      
      this.io.stdout.write(JSON.stringify(response) + '\n');
    }
  }

  handleSigterm() {
    console.log('Received SIGTERM. Shutting down...');
    this.stop();
  }

  start() {
    try {
      if (this.isRunning) {
        return;
      }

      if ('setEncoding' in this.io.stdin) {
        (this.io.stdin as NodeJS.ReadStream).setEncoding('utf8');
      }
      
      this.io.stdin.on('data', this.handleData);
      process.on('SIGTERM', this.handleSigterm);
      
      this.isRunning = true;
      console.log('PayNearMe MCP Server started');
    } catch (error) {
      console.error('Failed to start server:', error);
      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
    }
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    this.io.stdin.removeListener('data', this.handleData);
    process.removeListener('SIGTERM', this.handleSigterm);
    this.isRunning = false;
  }
}

// Only start the server if we're not in a test environment
if (process.env.NODE_ENV !== 'test') {
  const server = new MCPServer();
  server.start();
}

export default MCPServer;
