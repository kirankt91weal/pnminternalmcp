import { EventEmitter } from 'events';
import { MCPServer } from '../index';
import { findOrder } from '../tools/findOrder';
import { PayNearMeOrder } from '../types/paynearme';

// Mock findOrder
jest.mock('../tools/findOrder');
const mockedFindOrder = findOrder as jest.MockedFunction<typeof findOrder>;

describe('MCP Server', () => {
  let server: MCPServer;
  let stdin: EventEmitter;
  let stdout: { write: jest.Mock };

  beforeEach(() => {
    // Create mock IO streams
    stdin = new EventEmitter();
    stdout = { write: jest.fn() };

    // Create server instance with mock IO
    server = new MCPServer({ stdin, stdout });
    server.start();
  });

  afterEach(() => {
    server.stop();
    jest.clearAllMocks();
  });

  it('should handle find_order tool call successfully', async () => {
    const mockOrder: PayNearMeOrder = {
      id: 'test-123',
      status: 'Created',
      amount: { value: 100, currency: 'USD' },
      transactionType: 'debit'
    };

    mockedFindOrder.mockResolvedValueOnce(mockOrder);

    // Simulate MCP tool call
    stdin.emit('data', JSON.stringify({
      type: 'tool_call',
      tool: 'find_order',
      id: 'request-123',
      params: { orderId: 'test-123' }
    }));

    // Wait for async operations
    await new Promise(resolve => setImmediate(resolve));

    // Verify response
    expect(stdout.write).toHaveBeenCalledWith(
      expect.stringContaining('tool_response')
    );
    
    const response = JSON.parse(stdout.write.mock.calls[0][0]);
    expect(response).toEqual({
      type: 'tool_response',
      id: 'request-123',
      result: mockOrder
    });
  });

  it('should handle errors gracefully', async () => {
    // Simulate MCP tool call with invalid data
    stdin.emit('data', 'invalid json');

    // Wait for async operations
    await new Promise(resolve => setImmediate(resolve));

    // Verify error response
    expect(stdout.write).toHaveBeenCalledWith(
      expect.stringContaining('error')
    );
    
    const response = JSON.parse(stdout.write.mock.calls[0][0]);
    expect(response.type).toBe('error');
  });

  it('should handle API errors gracefully', async () => {
    mockedFindOrder.mockRejectedValueOnce(new Error('API Error'));

    // Simulate MCP tool call
    stdin.emit('data', JSON.stringify({
      type: 'tool_call',
      tool: 'find_order',
      id: 'request-123',
      params: { orderId: 'test-123' }
    }));

    // Wait for async operations
    await new Promise(resolve => setImmediate(resolve));

    // Verify error response
    expect(stdout.write).toHaveBeenCalledWith(
      expect.stringContaining('error')
    );
  });
}); 