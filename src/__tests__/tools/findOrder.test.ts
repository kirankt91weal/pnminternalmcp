import axios from 'axios';
import { findOrder } from '../../tools/findOrder';
import { PayNearMeOrder } from '../../types/paynearme';

// Mock axios module
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('findOrder', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should successfully find an order', async () => {
    // Mock successful API response
    const mockOrder: PayNearMeOrder = {
      id: 'test-order-123',
      status: 'Created',
      amount: {
        value: 100.00,
        currency: 'USD'
      },
      transactionType: 'debit',
      customerDetails: {
        email: 'test@example.com',
        name: 'Test User'
      }
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockOrder });

    const result = await findOrder({ orderId: 'test-order-123' });

    expect(result).toEqual(mockOrder);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.paynearme.com/api/find_orders',
      expect.objectContaining({
        params: expect.objectContaining({
          site_identifier: 'test_site_id',
          version: '2.0',
          orderId: 'test-order-123'
        })
      })
    );
  });

  it('should return null when API call fails', async () => {
    // Mock API error
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    const result = await findOrder({ orderId: 'non-existent' });

    expect(result).toBeNull();
    expect(mockedAxios.get).toHaveBeenCalled();
  });

  it('should include all search parameters in the request', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: {} });

    await findOrder({
      orderId: 'test-123',
      customerIdentifier: 'cust-456',
      orderTrackingUrl: 'https://track.example.com'
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.paynearme.com/api/find_orders',
      expect.objectContaining({
        params: expect.objectContaining({
          orderId: 'test-123',
          customerIdentifier: 'cust-456',
          orderTrackingUrl: 'https://track.example.com'
        })
      })
    );
  });
}); 