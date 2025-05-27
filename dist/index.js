"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPServer = void 0;
const findOrder_1 = require("./tools/findOrder");
class MCPServer {
    constructor(io) {
        this.isRunning = false;
        this.io = {
            stdin: io?.stdin || process.stdin,
            stdout: io?.stdout || process.stdout
        };
        this.handleData = this.handleData.bind(this);
        this.handleSigterm = this.handleSigterm.bind(this);
    }
    async handleData(data) {
        try {
            const request = JSON.parse(data.toString());
            // Handle tool calls
            if (request.type === 'tool_call' && request.tool === 'find_order') {
                const params = request.params;
                const result = await (0, findOrder_1.findOrder)(params);
                // Send response back
                const response = {
                    type: 'tool_response',
                    id: request.id,
                    result
                };
                this.io.stdout.write(JSON.stringify(response) + '\n');
            }
        }
        catch (error) {
            console.error('Error processing request:', error);
            // Send error response
            const response = {
                type: 'error',
                error: 'Internal server error'
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
                this.io.stdin.setEncoding('utf8');
            }
            this.io.stdin.on('data', this.handleData);
            process.on('SIGTERM', this.handleSigterm);
            this.isRunning = true;
            console.log('PayNearMe MCP Server started');
        }
        catch (error) {
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
exports.MCPServer = MCPServer;
// Only start the server if we're not in a test environment
if (process.env.NODE_ENV !== 'test') {
    const server = new MCPServer();
    server.start();
}
exports.default = MCPServer;
